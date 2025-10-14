async function loadCV() {
  try {
    const response = await fetch("cv.json");
    const cv = await response.json();

    document.title = cv.name;
    document.getElementById("cv-name").textContent = cv.name;
    document.getElementById("cv-title").textContent = cv.title;
    document.getElementById("cv-img").src = cv.photoCV;
    document.getElementById("cv-img").alt = cv.name;
    document.getElementById("cv-contact").innerHTML = `
      <h2><i class="fas fa-envelope"></i> Contacto</h2>
      <ul>
        <li><a href="tel:${cv.contact.phone}" target="_blank"><i class="fas fa-phone"></i> ${cv.contact.phone}</a></li>
        <li><a href="mailto:${cv.contact.email}" target="_blank"><i class="fas fa-envelope"></i> ${cv.contact.email}</a></li>
      </ul>
    `;

    const containerBio = document.getElementById("cv-bio");
    containerBio.innerHTML = cv.bio;

    Object.entries(cv.experience).forEach(([experience, td]) => {
      const experienceId = `exp-${experience.toLowerCase().replace(/\s+/g, '-')}`;
      const experienceHTML = `
        <div class="container-accordion">
          <h3 class="accordion" data-target="${experienceId}">
            <i class="accordion-icon fas fa-chevron-right"></i> ${td.title}
          </h3>
          <div id="${experienceId}" class="accordion-content">
            <p class="content">${td.description}</p>
          </div>
        </div>
      `;
      containerBio.insertAdjacentHTML("beforeend", experienceHTML);
    });

    renderGallery(cv.photos);

    const cv_url = cv.externalLink.url;
    document.getElementById("cv-link").innerHTML = `
      <h2><i class="fas fa-link"></i> Otros proyectos</h2>
      <div class="other-projects">
        <strong>${cv.externalLink.label}:</strong> ${cv_url
        ? `<a href="${cv_url}" target="_blank">${cv_url}</a>`
        : `<span style="opacity:0.5;">Próximamente</span>`}
      </div>
    `;
  } catch (error) {
    console.error("Error loading CV:", error);
  }
}

function renderGallery(cvPhotos) {
  // Duplicate the gallery for seamless loop
  const photos = cvPhotos.map((photo, idx) => {
    const filePath = photo.src;
    const isVideo = filePath.toLowerCase().endsWith('.mp4');
    const iconHTML = isVideo
      ? `<span class="gallery-type-icon"><i class="fas fa-video"></i></span>`
      : `<span class="gallery-type-icon"><i class="fas fa-image"></i></span>`;
    if (isVideo) {
      return `
      <div class="gallery-item">
        <video data-idx="${idx}" class="gallery-photo" muted preload="metadata">
          <source src="${filePath}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
        ${iconHTML}
      </div>
    `;
    } else {
      return `
      <div class="gallery-item">
        <img src="${filePath}" alt="${photo.alt}" class="gallery-photo" data-idx="${idx}">
        ${iconHTML}
      </div>
    `;
    }
  }).join("");
  document.getElementById("cv-photos").innerHTML = `<div class="gallery-track">${photos}</div>`;

  // Modal logic for image/video preview
  if (!document.getElementById("photo-modal")) {
    const modalHTML = `
      <div id="photo-modal" class="photo-modal">
        <span class="photo-modal-close">&times;</span>
        <div class="photo-modal-content"></div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHTML);
    document.querySelector(".photo-modal-close").onclick = () => {
      document.getElementById("photo-modal").style.display = "none";
      // Stop video if open
      const modalContent = document.querySelector(".photo-modal-content");
      modalContent.innerHTML = "";
    };
  }

  document.querySelectorAll(".gallery-photo").forEach(el => {
    el.onclick = function () {
      const idx = this.dataset.idx;
      const photo = cvPhotos[idx];
      const modal = document.getElementById("photo-modal");
      const modalContent = modal.querySelector(".photo-modal-content");
      modalContent.innerHTML = ""; // Clear previous

      if (photo.src.toLowerCase().endsWith('.mp4')) {
        // Video: allow controls, autoplay, but don't play in gallery
        const video = document.createElement("video");
        video.src = photo.src;
        video.controls = true;
        video.autoplay = true;
        video.style.maxWidth = "90vw";
        video.style.maxHeight = "90vh";
        video.style.borderRadius = "1rem";
        video.setAttribute("controlsList", "nodownload noremoteplayback");
        modalContent.appendChild(video);
      } else {
        // Image
        const img = document.createElement("img");
        img.src = photo.src;
        img.alt = photo.alt;
        img.style.maxWidth = "90vw";
        img.style.maxHeight = "90vh";
        img.style.borderRadius = "1rem";
        img.setAttribute("draggable", "false");
        img.setAttribute("oncontextmenu", "return false;");
        img.style.userSelect = "none";
        modalContent.appendChild(img);
      }
      modal.style.display = "flex";
    };
  });
}

async function renderCompositions() {
  try {
    const response = await fetch("compositions.json");
    const categories = await response.json();
    const container = document.querySelector(".compositions");

    Object.entries(categories).forEach(([category, pdfs]) => {
      const categoryId = `cat-${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      const categoryHTML = `
        <div class="container-accordion">
          <h3 class="accordion" data-target="${categoryId}">
            <i class="accordion-icon fas fa-chevron-right"></i> ${category}
          </h3>
          <div id="${categoryId}" class="accordion-content">
            <div class="pdf-grid">
              ${pdfs.map(pdf => `
                <div class="pdf-card" onclick="openPDF('docs/${category}/${pdf}')">
                  <i class="fas fa-file-pdf pdf-icon"></i>
                  <p>${pdf.replace('.pdf', '')}</p>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      `;
      container.insertAdjacentHTML("beforeend", categoryHTML);
    });

    // Add accordion behavior
    document.querySelectorAll(".accordion").forEach(acc => {
      acc.addEventListener("click", e => {
        e.preventDefault();
        const target = document.getElementById(acc.dataset.target);
        const offsetTop = target.offsetTop - 100;
        window.scrollTo({
          top: offsetTop,
          behavior: "smooth"
        });
        acc.classList.toggle("selected");
        target.classList.toggle("open");
        const icon = acc.querySelector(".accordion-icon");
        icon.classList.toggle("fa-chevron-right");
        icon.classList.toggle("fa-chevron-down");
      });
    });
  } catch (error) {
    console.error("Error loading compositions:", error);
  }
}

function generateNotes() {
  const symbols = ["♪", "♫", "♬", "♩"];
  const numNotes = Math.floor(Math.random() * (12 - 4 + 1)) + 4;
  const containerNotes = document.querySelector("header");
  let notesHTML = "";
  for (let i = 0; i < numNotes; i++) {
    const left = Math.floor(Math.random() * 80) + 10;
    const delay = Math.floor(Math.random() * 8) + 2;
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    notesHTML += `<div class="note" style="left:${left}%; animation-delay:${delay}s;">${symbol}</div>`;
  }
  containerNotes.insertAdjacentHTML("beforeend", notesHTML);
}

window.openPDF = function (url) {
  document.getElementById("pdfViewer").src = url;
  document.getElementById("pdfModal").style.display = "flex";
}
window.closePDF = function () {
  document.getElementById("pdfModal").style.display = "none";
  document.getElementById("pdfViewer").src = "";
}

generateNotes();
loadCV();
renderCompositions();
