from pathlib import Path
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

OUT = Path(r"Z:\cfq_sgc\SGC_CALFERQUIM\00_Inbox\Solicitudes_Analisis_Nucleos_Word")
OUT.mkdir(parents=True, exist_ok=True)

def base_doc(title, subtitle=None):
    d = Document()
    sec = d.sections[0]
    sec.top_margin = Inches(.8); sec.bottom_margin = Inches(.8)
    sec.left_margin = Inches(.85); sec.right_margin = Inches(.85)
    normal = d.styles['Normal']; normal.font.name = 'Arial'; normal.font.size = Pt(11)
    normal.paragraph_format.space_after = Pt(8)
    t = d.add_paragraph(style='Title'); t.alignment = WD_ALIGN_PARAGRAPH.LEFT
    r = t.add_run(title); r.font.name='Arial'; r.font.size=Pt(20); r.font.bold=True; r.font.color.rgb=RGBColor(0,0,0)
    if subtitle:
        p=d.add_paragraph(); p.paragraph_format.space_after=Pt(18)
        rr=p.add_run(subtitle); rr.italic=True; rr.font.size=Pt(9); rr.font.color.rgb=RGBColor(90,90,90)
    return d

def add_label(d, label, value):
    p=d.add_paragraph(); p.paragraph_format.space_after=Pt(5)
    r=p.add_run(label); r.bold=True
    p.add_run(value)

def add_section(d, title):
    p=d.add_paragraph(); p.paragraph_format.space_before=Pt(10); p.paragraph_format.space_after=Pt(6)
    r=p.add_run(title); r.bold=True; r.font.size=Pt(12)

def add_bullet(d, text):
    p=d.add_paragraph(style='List Bullet'); p.paragraph_format.space_after=Pt(4); p.add_run(text)

def save_tech(filename, product, source, date, lots, request, params, note=None):
    d=base_doc(product, 'Transcripción del componente técnico de la solicitud histórica')
    add_label(d,'Fecha de la comunicación: ',date)
    add_label(d,'Referencia: ',source)
    add_section(d,'Solicitud técnica')
    d.add_paragraph(request)
    for lot in lots: add_bullet(d,lot)
    if params:
        add_section(d,'Parámetros solicitados')
        d.add_paragraph(params)
    if note:
        add_section(d,'Actuación indicada en la comunicación')
        d.add_paragraph(note)
    d.save(OUT/filename)

save_tech('Solicitud_Tecnica_Nucleo_Fosforo_10.docx','Núcleo Fósforo 10','20250425 Solicitud Analisis 10.docx','25 de abril de 2025',['Lote 679080425'], 'Solicitud de análisis fisicoquímico de la muestra de Núcleo Fósforo 10.', 'Fósforo total, fósforo asimilable, potasio total, potasio asimilable, calcio total, magnesio total, azufre total, solubilidad, pH al 10 %, conductividad eléctrica (1:100), humedad, densidad y metales pesados (arsénico, cadmio, cromo, mercurio, plomo y níquel).')
save_tech('Solicitud_Tecnica_Nucleo_Fosforo_1.docx','Núcleo Fósforo 1','20250425 Solicitud Analisis 10.docx; complemento 20250416 Solicitud Analisis 10.docx','25 de abril de 2025',['Lote 574260325'], 'Solicitud de análisis fisicoquímico de la muestra de Núcleo Fósforo 1. La comunicación del 16 de abril lista además parámetros adicionales para Núcleo Fósforo 1, sin lote consignado.', 'Lote 574260325: fósforo total, fósforo asimilable, solubilidad, pH al 10 %, conductividad eléctrica (1:100), humedad, densidad y metales pesados (arsénico, cadmio, cromo, mercurio, plomo y níquel). Adicionalmente, en la lista de 16 de abril figuran calcio total, azufre total, boro total, cobalto total, cobre total, hierro total y metales pesados (arsénico, cadmio, cromo, mercurio, níquel y plomo); ese documento no identifica lote para esa línea.')
save_tech('Solicitud_Tecnica_Nucleo_Camasi_Gris.docx','Núcleo Camasi Gris','20250305 Solicitud Analisis 02.pdf','5 de marzo de 2025',['Muestra 050325 (la comunicación no consigna un número de lote comercial)'], 'Solicitar análisis fisicoquímico de la muestra de Núcleo Camasi, producto asociado al ítem 62 Núcleo Camasi Gris.', 'Calcio total, magnesio total, azufre total, silicio total, solubilidad, pH al 10 %, conductividad eléctrica (1:100), humedad, densidad y metales pesados (arsénico, cadmio, cromo, mercurio y plomo).', 'La comunicación posterior del 14 de mayo añade níquel a muestras identificadas como Camasi rojo, Fósforo 1, Magnesio-S, Fósforo 10, Magnesio Silicio, Calferzinc-P y Camasi Yara; no menciona níquel para la muestra del ítem 62.')
save_tech('Solicitud_Tecnica_Nucleo_Camasi_Yara.docx','Núcleo Camasi Yara','20250514_Solicitud_Analisis_10_1.pdf','14 de mayo de 2025',['Lote 491070425'], 'Agregar níquel al análisis y realizar análisis de la muestra.', 'Calcio total, magnesio total, azufre total, silicio total, solubilidad, pH al 10 %, conductividad eléctrica (1:100), humedad y densidad; incluir níquel como parámetro adicional.')
save_tech('Solicitud_Tecnica_Nucleo_4.docx','Núcleo 4','Solicitudes 2024; 20250416 Solicitud Analisis 10.pdf; 20251022 Solicitud Analisis 24 N4 MgS.pdf','2024-2025',['Lotes 65-081024, 65-161024-2, 65-221024-1, 65-221031-2, 65-071124-2, 65-131124-2, 65-201124-1, 65-031224-1, 65-291124-1','Lotes 65-060225-1, 65-060425-1, 65-270425 y 65-200525','Lotes 65-120625, 65-050825, 65-250925 y 65-061025'], 'Solicitar análisis fisicoquímico de las muestras de Núcleo 4 consignadas en las comunicaciones históricas.', 'Calcio total, magnesio total, azufre total, silicio total, pH al 10 %, conductividad eléctrica (1:100), densidad aparente y humedad.')
save_tech('Solicitud_Tecnica_Sulfato_de_Calcio.docx','Sulfato de Calcio P','20250305 Solicitud Analisis 02.pdf; actualización 20250514_Solicitud_Analisis_10_1.pdf','5 de marzo y 14 de mayo de 2025',['Muestra 050325 (solicitud original; sin número de lote comercial consignado)','Lote 141250325 (muestra cuyo análisis se cancela en la comunicación del 14 de mayo)'], 'Solicitud original: analizar Sulfato de Calcio-P. La carta posterior cancela análisis del lote indicado.', 'Calcio total, azufre total, pH al 10 %, conductividad eléctrica (1:100), humedad, densidad y metales pesados (arsénico, cadmio, cromo, mercurio y plomo).', 'El lote 141250325 quedó expresamente cancelado en la carta del 14 de mayo de 2025.')
save_tech('Solicitud_Tecnica_Nucleo_Magnesio_Silicio.docx','Núcleo Magnesio Silicio','20250425 Solicitud Analisis 10.docx','25 de abril de 2025',['Lote 558020425'], 'Solicitud de análisis fisicoquímico de la muestra de Núcleo Magnesio Silicio.', 'Magnesio total, azufre total, silicio total, solubilidad, pH al 10 %, conductividad eléctrica (1:100), humedad, densidad y metales pesados (arsénico, cadmio, cromo, mercurio, plomo y níquel).')
save_tech('Solicitud_Tecnica_Nucleo_Magnesio_Azufre.docx','Núcleo Magnesio Azufre','20250305 Solicitud Analisis 02.pdf; 20251022 Solicitud Analisis 24 N4 MgS.pdf','5 de marzo y 22 de octubre de 2025',['Muestra 050325 (solicitud original; sin número de lote comercial consignado)','Lote 208-201025 (comunicación del 22 de octubre)'], 'Solicitar análisis de la muestra identificada como Núcleo Magnesio en marzo y Núcleo Magnesio-S en octubre.', 'Magnesio total, azufre total, solubilidad, pH al 10 %, conductividad eléctrica (1:100), humedad, densidad y metales pesados (arsénico, cadmio, cromo, mercurio y plomo) según la solicitud original del 5 de marzo. La comunicación del 22 de octubre especifica magnesio total y azufre total para el lote 208-201025.')

# Transcripción completa de la comunicación del 14 de mayo de 2025.
d=base_doc('Carta de solicitud de análisis fisicoquímico','Transcripción de la comunicación del 14 de mayo de 2025')
d.add_paragraph('San Pedro, Mayo 14 de 2025')
d.add_paragraph('Señores\nLABORATORIO DOCTOR CALDERON LTDA.\nAvenida Carrera 20 N° 87-81\nBogotá D.C.')
add_label(d,'Referencia: ','Solicitud de análisis físico químico - ajuste de muestras y parámetros')
d.add_paragraph('Cordial saludo:')
d.add_paragraph('Me dirijo a ustedes con el fin de solicitar formalmente un ajuste concerniente a los análisis de laboratorio que fueron enviados previamente. El ajuste solicitado consiste en lo siguiente:')
add_section(d,'Cancelación de análisis')
d.add_paragraph('Solicitamos cancelar la realización de los análisis a las siguientes siete (7) muestras:')
for x in ['MP Sulfato de Amonio Nutrición de Plantas 140425 - Granulado','MP Kieserita + KCl 140425 - Granulado','Micron CS 140425 - Fertilizante inorgánico','Micron C 140425 - Fertilizante inorgánico granulado','Núcleo manganeso lote 050425 - Fertilizante inorgánico granulado','Sulfato de calcio P - 141250325 - Fertilizante inorgánico simple sólido','Fercorrectivo - 120425 - Acondicionador inorgánico de suelo sólido']: add_bullet(d,x)
add_section(d,'Inclusión del parámetro níquel')
d.add_paragraph('Solicitamos incluir el análisis del parámetro níquel a las siguientes ocho (8) muestras:')
for x in ['Boro Granulado 123060225 - Fertilizante inorgánico','Núcleo Camasi rojo 452070325 - Fertilizante inorgánico granulado','Núcleo fósforo 1 574260325 - Fertilizante inorgánico granulado','Núcleo Magnesio-S 208190225 - Fertilizante inorgánico simple sólido','Núcleo fósforo 10 679080425 - Fertilizante inorgánico simple sólido','Núcleo Magnesio Silicio 558020425 - Fertilizante inorgánico granulado','Calferzinc-P 140425 - Fertilizante inorgánico simple sólido','Núcleo Camasi Yara 491070425 - Fertilizante inorgánico granulado']: add_bullet(d,x)
add_section(d,'Inclusión de muestras para análisis')
d.add_paragraph('Solicitamos incluir las siguientes cuatro (4) muestras para análisis:')
add_label(d,'Núcleo Camasi 62210425: ','Fertilizante inorgánico granulado. Calcio total, magnesio total, azufre, silicio total, solubilidad, pH al 10 %, conductividad eléctrica (1:100), humedad, densidad y metales pesados (arsénico, cadmio, cromo, mercurio, plomo y níquel).')
add_label(d,'Raifos 20 - 155070225: ','Fertilizante orgánico mineral sólido granulado. Fósforo total, calcio total, azufre total, magnesio total, silicio total, carbono orgánico oxidable, nitrógeno total, relación C/N, CIC, solubilidad, pH al 10 %, conductividad eléctrica, humedad, densidad, cenizas, pérdidas por volatilización, capacidad de retención de humedad y residuo insoluble en ácido; fósforo asimilable, fósforo de lenta asimilación, potasio soluble en agua, calcio soluble en agua, magnesio soluble en agua, azufre soluble en agua, silicio soluble en agua y sodio total. Metales pesados: arsénico, cadmio, cromo, níquel, mercurio y plomo. Microbiología: enterobacterias, Salmonella sp., coliformes totales y huevos de helmintos.')
add_label(d,'Núcleo Camasi Yara - 491070425: ','Fertilizante inorgánico granulado. Calcio total, magnesio total, azufre total, silicio total, solubilidad, pH al 10 %, conductividad eléctrica (1:100), humedad y densidad.')
add_label(d,'BIOPLANTAS - 140525: ','Fertilizante orgánico. Nitrógeno total, nitrógeno orgánico, fósforo total, potasio total, carbono orgánico oxidable, relación C/N, CIC, solubilidad, pH al 10 %, conductividad eléctrica, humedad, densidad, cenizas, pérdidas por volatilización, capacidad de retención de humedad y residuo insoluble en ácido. Metales pesados: arsénico, cadmio, cromo, níquel, mercurio y plomo. Microbiología: enterobacterias, Salmonella sp., coliformes totales y huevos de helmintos.')
d.add_paragraph('Estoy atento a cualquier comentario o aclaración que se requiera, así como a la proforma actualizada, para proceder con el pago correspondiente.')
d.add_paragraph('Muchas gracias.\n\nCordialmente,')
d.add_paragraph('WILSON R SALAS\nDIRECCIÓN TÉCNICA LABORATORIO\nCALFERQUIM SAS')
d.save(OUT/'Carta_Original_Transcrita_20250514.docx')
print('\n'.join(str(p) for p in sorted(OUT.glob('*.docx'))))
