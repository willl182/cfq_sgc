from pathlib import Path
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

out=Path(r'Z:\cfq_sgc\SGC_CALFERQUIM\00_Inbox\Solicitudes_Analisis_Nucleos_Word')
doc=Document()
sec=doc.sections[0]
sec.top_margin=Inches(.8);sec.bottom_margin=Inches(.8);sec.left_margin=Inches(.85);sec.right_margin=Inches(.85)
normal=doc.styles['Normal'];normal.font.name='Arial';normal.font.size=Pt(11);normal.paragraph_format.space_after=Pt(8)
p=doc.add_paragraph(style='Title');r=p.add_run('Nucleo Camasi Rojo');r.font.name='Arial';r.font.size=Pt(20);r.font.bold=True;r.font.color.rgb=RGBColor(0,0,0)
p=doc.add_paragraph();p.paragraph_format.space_after=Pt(18);rr=p.add_run('Extracto tecnico de las solicitudes historicas');rr.italic=True;rr.font.size=Pt(9)
for label,value in [('Fechas: ','16 y 25 de abril de 2025'),('Referencias: ','20250416 Solicitud Analisis 10.docx y 20250425 Solicitud Analisis 10.docx'),('Muestra: ','Nucleo Camasi Rojo, codigo 452; lote 070325 (la carta del 25 de abril identifica 452 070325).')]:
 p=doc.add_paragraph();p.add_run(label).bold=True;p.add_run(value)
p=doc.add_paragraph();p.paragraph_format.space_before=Pt(10);p.add_run('Parametros solicitados').bold=True
p=doc.add_paragraph('Solicitud del 25 de abril de 2025: calcio total, magnesio total, azufre, silicio total, solubilidad, pH al 10 %, conductividad electrica (1:100), humedad, densidad y metales pesados (arsenico, cadmio, cromo, mercurio, plomo y niquel).')
p=doc.add_paragraph('Solicitud adicional del 16 de abril de 2025: nitrogeno nitrico, nitrogeno organico, calcio total y metales pesados (arsenico, cadmio, cromo, mercurio, niquel y plomo). Esta comunicacion no consigna lote para esta linea.')
doc.save(out/'Solicitud_Tecnica_Nucleo_Camasi_Rojo.docx')
print(out/'Solicitud_Tecnica_Nucleo_Camasi_Rojo.docx')
