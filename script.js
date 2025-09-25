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

    const photos = cv.photos.map(photo => `<img src="${photo.src}" alt="${photo.alt}">`).join("");
    document.getElementById("cv-photos").innerHTML = photos;

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

async function renderCompositions() {
  try {
    const response = await fetch("compositions.json");
    const categories = await response.json();
    const container = document.querySelector(".compositions");

    Object.entries(categories).forEach(([category, pdfs]) => {
      const categoryId = `cat-${category.toLowerCase().replace(/\s+/g, '-')}`;

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
