# Simple Python script to add watermark to a PDF
# You need to install the PyPDF2 library: pip install PyPDF2
from PyPDF2 import PdfReader, PdfWriter
from PyPDF2.generic import NameObject, TextStringObject

reader = PdfReader("docs/ejemplo.pdf")
writer = PdfWriter()

for page in reader.pages:
    writer.add_page(page)

# Añadir metadatos como marca
writer.add_metadata({
    '/Producer': 'LegadoDigital',
    '/Creator': 'Shalix Script',
    '/Custom': 'Marca de agua: legado digital'
})

with open("docs/ejemplo_marcado.pdf", "wb") as f:
    writer.write(f)