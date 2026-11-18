from pathlib import Path
from docx import Document
from docx.shared import Inches, Pt, RGBColor

OUT=Path(r'Z:\cfq_sgc\SGC_CALFERQUIM\00_Inbox\Solicitudes_Analisis_Nucleos_Word')
OUT.mkdir(parents=True,exist_ok=True)

def make(name,title,dates,refs,samples,request,params,notes=()):
 d=Document();s=d.sections[0];s.top_margin=Inches(.8);s.bottom_margin=Inches(.8);s.left_margin=Inches(.85);s.right_margin=Inches(.85)
 st=d.styles['Normal'];st.font.name='Arial';st.font.size=Pt(11);st.paragraph_format.space_after=Pt(8)
 p=d.add_paragraph(style='Title');r=p.add_run(title);r.font.name='Arial';r.font.size=Pt(20);r.font.bold=True;r.font.color.rgb=RGBColor(0,0,0)
 p=d.add_paragraph();p.paragraph_format.space_after=Pt(18);r=p.add_run('Extracto tecnico de las solicitudes historicas');r.italic=True;r.font.size=Pt(9)
 for lab,val in [('Fecha(s): ',dates),('Referencia(s): ',refs),('Muestra(s) / lote(s): ',samples)]:
  p=d.add_paragraph();p.add_run(lab).bold=True;p.add_run(val)
 p=d.add_paragraph();p.paragraph_format.space_before=Pt(10);p.add_run('Solicitud tecnica').bold=True
 d.add_paragraph(request)
 p=d.add_paragraph();p.paragraph_format.space_before=Pt(10);p.add_run('Parametros solicitados').bold=True
 d.add_paragraph(params)
 for n in notes:d.add_paragraph(n)
 d.save(OUT/name)

make('Solicitud_Tecnica_Nucleo_Camasi_Yara.docx','Nucleo Camasi Yara','25 de abril, 14 de mayo y 16 de abril de 2025','20250425 Solicitud Analisis 10.docx; 20250425_Solicitud_Analisis_10_1.docx; 20250416 Solicitud Analisis 10.docx','Lote 491070425','Analisis fisicoquimico y actualizaciones de parametros para Nucleo Camasi Yara.','Lote 491070425 (25 de abril): calcio total, magnesio total, azufre total, silicio total, solubilidad, pH al 10 %, conductividad electrica (1:100), humedad, densidad y metales pesados (arsenico, cadmio, cromo, mercurio, plomo y niquel). En la linea sin lote de la carta del 16 de abril: magnesio total, azufre total, boro total, cobalto total, sodio total y metales pesados (arsenico, cadmio, cromo, mercurio, niquel y plomo).')

make('Solicitud_Tecnica_Nucleo_Magnesio_Azufre.docx','Nucleo Magnesio Azufre','5 de marzo, 25 de abril y 22 de octubre de 2025','20250305 Solicitud Analisis 02.docx; 20250425 Solicitud Analisis 10.docx; 20251022 Solicitud Analisis 24 N4 MgS.docx','Muestra 050325 (sin numero de lote comercial en marzo); lotes 208-190225 y 208-201025','Solicitar analisis de las muestras denominadas Nucleo Magnesio y Nucleo Magnesio-S en las distintas comunicaciones.','Muestra 050325: magnesio total, azufre total, solubilidad, pH al 10 %, conductividad electrica (1:100), humedad, densidad y metales pesados (arsenico, cadmio, cromo, mercurio y plomo). Lote 208-190225: magnesio total, azufre total, solubilidad, pH al 10 %, conductividad electrica (1:100), humedad, densidad y metales pesados (arsenico, cadmio, cromo, mercurio, plomo y niquel). Lote 208-201025: magnesio total y azufre total.')

make('Solicitud_Tecnica_Nucleo_4.docx','Nucleo 4','2024-2025','Solicitudes de analisis 18 a 27; 20250416 Solicitud Analisis 10.docx; 20251022 Solicitud Analisis 24 N4 MgS.docx','Lotes 65-081024, 65-161024-2, 65-221024-1, 65-221031-2, 65-071124-2, 65-131124-2, 65-201124-1, 65-031224-1, 65-291124-1, 65-060225-1, 65-060425-1, 65-270425, 65-200525, 65-120625, 65-050825, 65-250925 y 65-061025','Analisis fisicoquimico de las muestras de Nucleo 4 listadas en las comunicaciones historicas.','Calcio total, magnesio total, azufre total, silicio total, pH al 10 %, conductividad electrica (1:100), densidad aparente y humedad.')

make('Solicitud_Tecnica_Nucleo_Fosforo_10.docx','Nucleo Fosforo 10','15 de marzo, 25 de abril y 14 de mayo de 2025','20250315 Solicitud Analisis 05.docx; 20250425 Solicitud Analisis 10.docx; 20250425_Solicitud_Analisis_10_1.docx','Muestras 130325-1 y 130325-2; lote 679080425','Analisis fisicoquimico de dos muestras de Nucleo Fosforo 10 Especial y del lote 679080425.','Muestras 130325-1 y 130325-2: fosforo total, calcio total, magnesio total, azufre total, solubilidad, pH al 10 %, conductividad electrica (1:100), humedad y densidad. Para 130325-2: metales pesados (arsenico, cadmio, cromo, mercurio y plomo). Lote 679080425: fosforo total, fosforo asimilable, potasio total, potasio asimilable, calcio total, magnesio total, azufre total, solubilidad, pH al 10 %, conductividad electrica (1:100), humedad, densidad y metales pesados (arsenico, cadmio, cromo, mercurio, plomo y niquel).')

make('Solicitud_Tecnica_Nucleo_Fosforo_1.docx','Nucleo Fosforo 1','16 y 25 de abril de 2025','20250416 Solicitud Analisis 10.docx; 20250425 Solicitud Analisis 10.docx','Lote 574260325 en la carta del 25 de abril; la linea de la carta del 16 de abril no consigna lote','Analisis fisicoquimico de la muestra de Nucleo Fosforo 1 y parametros listados en la comunicacion adicional.','Lote 574260325: fosforo total, fosforo asimilable, solubilidad, pH al 10 %, conductividad electrica (1:100), humedad, densidad y metales pesados (arsenico, cadmio, cromo, mercurio, plomo y niquel). Linea sin lote del 16 de abril: calcio total, azufre total, boro total, cobalto total, cobre total, hierro total y metales pesados (arsenico, cadmio, cromo, mercurio, niquel y plomo).')

make('Solicitud_Tecnica_Nucleo_Magnesio_Silicio.docx','Nucleo Magnesio Silicio','16 y 25 de abril y 14 de mayo de 2025','20250416 Solicitud Analisis 10.docx; 20250425 Solicitud Analisis 10.docx; 20250425_Solicitud_Analisis_10_1.docx','Lote 558020425','Analisis fisicoquimico de la muestra de Nucleo Magnesio Silicio; la comunicacion del 14 de mayo confirma la inclusion de niquel.','Lote 558020425: magnesio total, azufre total, silicio total, solubilidad, pH al 10 %, conductividad electrica (1:100), humedad, densidad y metales pesados (arsenico, cadmio, cromo, mercurio, plomo y niquel). Linea sin lote del 16 de abril: magnesio total y metales pesados (arsenico, cadmio, cromo, mercurio, niquel y plomo).')

make('Solicitud_Tecnica_Sulfato_de_Calcio.docx','Sulfato de Calcio','5 y 15 de marzo, 16 y 25 de abril, y 14 de mayo de 2025','20250305 Solicitud Analisis 02.docx; 20250315 Solicitud Analisis 05.docx; 20250416 Solicitud Analisis 10.docx; 20250425 Solicitud Analisis 10.docx; 20250425_Solicitud_Analisis_10_1.docx','Muestra 050325; muestras 130325-1 y 130325-2; MP 140425; lote 141250325 cancelado el 14 de mayo','Analisis de varias muestras de Sulfato de Calcio-P y materia prima, con una cancelacion posterior especifica.','Muestra 050325: calcio total, azufre total, pH al 10 %, conductividad electrica (1:100), humedad, densidad y metales pesados (arsenico, cadmio, cromo, mercurio y plomo). Muestras 130325-1 y 130325-2: calcio total, azufre total, pH al 10 %, conductividad electrica (1:100), humedad y densidad; para 130325-2 tambien metales pesados (arsenico, cadmio, cromo, mercurio y plomo). MP 140425: calcio total, calcio soluble, azufre total, solubilidad, pH al 10 %, conductividad electrica (1:100), humedad y densidad. La carta del 14 de mayo pide cancelar los analisis del lote 141250325.')

print('\n'.join(str(x) for x in sorted(OUT.glob('Solicitud_Tecnica_*.docx'))))
