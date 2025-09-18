# Portfolio / Legado digital — Instrucciones de uso y mantenimiento

Repositorio pensado para: CV + Composiciones (PDFs) con visor en modal, acordeones por categoría, GitHub Pages y generación automática de `compositions.json` vía GitHub Actions.

## ÍNDICE
- [COMPOSITOR (CLIENTE)](#compositor-cliente)
  1. [Objetivo](#1-objetivo)
  2. [Actualizar el CV](#2-actualizar-el-cv)
  3. [Subir nuevas composiciones (PDFs)](#3-subir-nuevas-composiciones-pdfs)
  4. [Marca de agua / firma (recomendado)](#4-marca-de-agua--firma-recomendado)
  5. [Invitar colaboradores (si necesitas ayuda)](#5-invitar-a-colaboradores-si-necesitas-ayuda)
- [DESARROLLADORES (FORKS)](#desarrolladores-forks)
  1. [Clonar el repositorio](#1-clonar-el-repositorio)
  2. [Ejecutar y probar localmente](#2-ejecutar--probar-localmente)
  3. [Regenerar `compositions.json` localmente (script Node)](#3-regenerar-compositionsjson-localmente-script-node)
  4. [Detalles del workflow (qué hace y cuándo se ejecuta)](#4-detalles-del-workflow-qué-hace-y-cuándo)
  5. [Personalizaciones comunes (CSS, acento, tipografías)](#5-personalizaciones-habituales)
  6. [Buenas prácticas y seguridad](#6-buenas-prácticas-y-seguridad)

## COMPOSITOR (CLIENTE)

### 1) Objetivo
- Mantener tu CV y tus partituras accesibles y duraderas.
- Solo tienes que subir PDFs *(previamente firmados/marcados)* en `/docs/<Categoría>/`.
- El sistema genera `compositions.json` automáticamente; no necesitas tocar código.
- GitHub Pages reconstruirá el sitio; *suele estar disponible en segundos a minutos*.
- URL: https://<USER>.github.io/<REPO>/ *(configurable en Settings → Pages)*.

### 2) Actualizar el CV
Edita el archivo `cv.json` para cambiar:
- `name` → nombre completo
- `title` → subtítulo profesional
- `photo` → ruta a la foto (p. ej. `./img/foto.jpg`)
- `bio` → texto corto
- `externalLink` → si hay URL externa (o déjalo `null` para mostrar “Próximamente”)

Puedes editar `cv.json` desde:
- **GitHub web UI** → botón *Edit* en el archivo → Commit.
- **Local** → editar y hacer `git push` (ver sección Git CLI abajo).

### 3) Subir nuevas composiciones (PDFs)
**Regla básica:** Cada categoría es una carpeta dentro de `docs/`. Ejemplo:
```
docs/
  Piano/
    nocturno_en_re.pdf
  Coral/
    misa_breve.pdf
```

**Recomendaciones de formato:**
- Usa nombres de archivo sin espacios ni caracteres raros: *nocturno_en_re.pdf*.
- Mantén copias originales sin marcar guardadas fuera del repositorio *(si lo deseas)*.

**Pasos (web UI) — el método más fácil:**
1. Entra al repositorio en github.com.
2. Haz clic en `docs/` → entra en la carpeta de la categoría (o crea una nueva carpeta con *Add file → Create new file* y pon `Piano/.gitkeep` si quieres crearla).
3. Pulsa *Add file → Upload files* y arrastra el/los PDF(s).
4. Commit changes (mensaje claro: “Añadir <archivo>”).
5. GitHub Actions detectará el cambio y actualizará `compositions.json`. La web se actualizará en segundos/minutos.

**Pasos (git CLI) — para usuarios que usan git:**
```bash
# desde la raíz del repo local
git checkout -b add-mi-nueva-composicion
mkdir -p docs/Piano
cp /ruta/a/mi/nueva.pdf docs/Piano/
git add docs/Piano/nueva.pdf
git commit -m "Añadir Piano: nueva.pdf"
git push origin add-mi-nueva-composicion
# luego creas PR en GitHub o haces push a main si tienes permiso:
git push origin main
```

### 4) Marca de agua / firma (recomendado)

***IMPORTANTE**: los PDFs deberían de contener la marca de agua/firma del cliente antes de subirlos. El repositorio no aplica marcas automáticamente.*

Opciones sencillas para marcar PDFs:

1. Crear **watermark.pdf**: una página con el texto/logo de la marca. Se puede crear con LibreOffice/Word exportado a PDF.
2. Elegir una de las siguientes opciones:

- **pdftk** -> *requiere instalar y ejecutar el siguiente comando*:
```bash
pdftk original.pdf stamp watermark.pdf output original_marcado.pdf
```

- **PyPDF2** -> *requiere usar Python, con un script básico de overlay como el siguiente*:
```bash
from PyPDF2 import PdfReader, PdfWriter

reader = PdfReader("original.pdf")
watermark = PdfReader("watermark.pdf")
writer = PdfWriter()

watermark_page = watermark.pages[0]

for page in reader.pages:
    page.merge_page(watermark_page)
    writer.add_page(page)

with open("original_marcado.pdf", "wb") as f:
    writer.write(f)
```

### 5) Invitar a colaboradores (si necesitas ayuda)

1. Repo → Settings → Manage access → Invite a collaborator.
2. Añade el usuario GitHub (ej. tu desarrollador). Dale permiso Write.

Así podrá subir PDFs directamente y ayudar en mantenimiento.

## DESARROLLADORES (FORKS)

### 1) Clonar el repositorio

1. Haz `Fork` en GitHub (botón Fork).
2. Clona:
```bash
git clone https://github.com/<TU_USUARIO>/<REPO>.git
cd <REPO>
```
3. Trabaja en rama:
```bash
git checkout -b feature/mi-cambio
# editar archivos
git add .
git commit -m "Mi mejora"
git push origin feature/mi-cambio
# abrir PR si quieres integrar a upstream
```

Para desplegar Pages en tu fork: ``Settings → Pages → selecciona main (o la rama que uses) y root``.

> Nota: las forks públicas permiten que otros vean/replicen tu copia; el workflow copiado en la fork también puede ejecutarse en la fork, pero el propietario del fork debe habilitar Actions si están desactivadas por defecto.

### 2) Ejecutar / probar localmente

La web es estática. Para probar sin subir:

1. Con Python (rápido, sin instalación extra):
```python
# Python 3
python -m http.server 8000
# luego abrir http://localhost:8000
```
2. Con live-server (npm):
```bash
npx live-server --port=8000
```

Si vas a probar la generación de `compositions.json` localmente, crea la estructura `docs/` local con carpetas y PDFs *(pueden ser archivos vacíos con extensión .pdf)*.

### 3) Regenerar `compositions.json` localmente (script Node)

Crea `scripts/generate-compositions.js` con este contenido:
```bash
// scripts/generate-compositions.js
const fs = require('fs');
const path = require('path');

const docsDir = path.join(process.cwd(), 'docs');
const categories = {};

if (!fs.existsSync(docsDir)) {
  console.error('No existe la carpeta docs/ en este repo.');
  process.exit(1);
}

fs.readdirSync(docsDir).forEach(folder => {
  const fullPath = path.join(docsDir, folder);
  if (fs.lstatSync(fullPath).isDirectory()) {
    const pdfs = fs.readdirSync(fullPath).filter(f => f.toLowerCase().endsWith('.pdf'));
    categories[folder] = pdfs;
  }
});

fs.writeFileSync(path.join(process.cwd(), 'compositions.json'), JSON.stringify(categories, null, 2));
console.log('compositions.json generado correctamente.');
```

Ejecuta:
```bash
node scripts/generate-compositions.js
git add compositions.json
git commit -m "Generar compositions.json (local)"
git push
```

Esto te permite mantener `compositions.json` actualizado sin depender exclusivamente de la **Action**.

### 4) Detalles del workflow (qué hace y cuándo)

Archivo: `.github/workflows/build-json.yml`

Se activa `on: push` para cambios dentro de `docs/**`.

Acciones principales:

1. Hace checkout del repo.
2. Ejecuta un script *Node* que recorre `docs/` y genera `compositions.json`.
3. Hace *commit y push* de `compositions.json` *(si hay cambios)*.

El usuario de commit en la Action se configura como *github-actions*. **Si no hay cambios, el commit no se hace y no rompe nada**.

> **Nota sobre forks y Actions**: en forks el workflow existe pero depende de la configuración de Actions en la cuenta del fork; por defecto las Actions pueden estar habilitadas. Si el autor del fork quiere, puede desactivar/activar Actions en la configuración.

### 5) Personalizaciones habituales

- **Cambiar color de acento o fuentes**: editar `styles.css` *(archivo CSS central)*.
- **Cambiar tipografía (partitura)**: añade <link> a Google Fonts en `index.html` y actualiza el font-family en el CSS.
- **Modificar estructura visual**: `index.html` es plano y se alimenta desde `cv.json` y `compositions.json` — cambiar comportamiento en `script.js`.

### 6) Buenas prácticas y seguridad

- **No subir archivos >100 MB** *(GitHub limita a 100 MB por archivo)*. Para archivos más grandes considera almacenamiento externo *(Archive.org, IPFS)*.
- **No subir credenciales ni tokens al repositorio**. Si necesita automatización que use tokens, usa ***Secrets en GitHub Actions** (pero en esta plantilla no hace falta)*.
- Mantener `docs/` organizado con nombres claros *(categoria/nombre_composicion.pdf)*.
- Haz backups periódicos fuera de GitHub si quieres redundancia extra *(Archive.org, copias locales)*.