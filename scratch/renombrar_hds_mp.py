#!/usr/bin/env python3
import os
import re
from pathlib import Path

# Directorios
PROJECT_ROOT = Path(__file__).resolve().parent.parent
HDS_TEST_DIR = PROJECT_ROOT / "hds_test"
PT_SOURCE_DIR = PROJECT_ROOT / "_Legacy_y_Otros" / "Hojas de seguridad"

# 1. Obtener la lista de nombres de archivos de Productos Terminados (PT)
pt_files = set(f.name for f in PT_SOURCE_DIR.glob("*.pdf"))

# 2. Mapeo manual para normalizar los nombres de las materias primas de forma súper limpia
# Esto garantiza que los nombres no contengan basura técnica, números, ni palabras repetidas
mp_normalization = {
    # Paso 2 (desde 01_Dossier_Materias_Primas)
    'HDS ACIDO BORICO PQP .pdf': 'ACIDO_BORICO.pdf',
    'Ficha tecnica Dolomita +CAL DOLOMITA.pdf': 'CAL_DOLOMITA.pdf',
    'ft_caolin_antec_c_98.pdf': 'CAOLIN.pdf',
    'Cloruro de Potasio-FDS-CO (1).pdf': 'CLORURO_DE_POTASIO.pdf',
    '29. Ficha de datos de seguridad de Kieserita - Sulfato de magnesio monohidratado, kieserite.pdf': 'KIESERITA.pdf',
    'MSDS - Fosfato Monoamonico.pdf': 'MAP_FOSFATO_MONOAMONICO.pdf',
    'MSDS Nitrato de potasio soluble nov 2016 v03 (1).pdf': 'NITRATO_DE_POTASIO.pdf',
    'HOJA DE SEGURIDAD -SILICATO DE MAGNESIO.docx': 'SILICATO_DE_MAGNESIO.docx',
    'Hoja de Seguridad APDR 233_SULFATO DE AMONIO (1).PDF': 'SULFATO_DE_AMONIO.pdf',
    '11) HS Sulfato de Cobre Pentahidratado 25_ CONAGRAN.pdf': 'SULFATO_DE_COBRE.pdf',
    '29. Ficha de datos de seguridad de Sulfato de Manganeso Monohidratado Fino - 17S+31Mn 20231025 22.pdf': 'SULFATO_DE_MANGANESO.pdf',
    'HOJA DE SEGURIDAD SULFATO DE POTASIO.docx': 'SULFATO_DE_POTASIO.docx',
    'HOJA DE SEGURIDAD -  SULFATO DE ZINC AL 35_.docx': 'SULFATO_DE_ZINC_35.docx',
    '13) Ulexita calcinada Calcined ulexite 45 - TDS (Español) TIERRA SA.pdf': 'ULEXITA.pdf',
    '21) HS Urea CIAMSA.pdf': 'UREA.pdf',
    
    # Paso 3 (desde 07 Hojas de Seguridad legacy)
    '01) Citrato de Zinc- Trihidratado-TZC HDS SUCRO 2014.pdf': 'CITRATO_DE_ZINC.pdf',
    '02) Aceite Usado.pdf': 'ACEITE_USADO.pdf',
    '03) Silicato de Magnesio.jpg': 'SILICATO_DE_MAGNESIO.jpg',
    '04) Cal Agricola HELVECIA.pdf': 'CAL_AGRICOLA.pdf',
    '06) HI-PIX 6733 02-16 INGREDION.pdf': 'HI_PIX_6733.pdf',
    '09) Silicato de Sodio  NP-41  JADESI SA.pdf': 'SILICATO_DE_SODIO.pdf',
    '10) Silicato de Magnesio 30-30  CALES RIO CLARO.pdf': 'SILICATO_DE_MAGNESIO_30_30.pdf',
    '12) HS Sulfato de Zinc 28_ CONAGRAN.pdf': 'SULFATO_DE_ZINC_28.pdf',
    '15) Yeso Agricola Natural Santa Rosa .pdf': 'YESO_AGRICOLA.pdf',
    '16) HS DAP CIAMSA.pdf': 'DAP_CIAMSA.pdf',
    '17) HS KCL CIAMSA.pdf': 'KCL_CIAMSA.pdf',
    '18) HS MAP CIAMSA.pdf': 'MAP_CIAMSA.pdf',
    '19) HS Silicato de Sodio NP-41 JADESI SA.pdf': 'SILICATO_DE_SODIO_NP41.pdf',
    '20) HS Silicato de Magnesio Pulverizar.pdf': 'SILICATO_DE_MAGNESIO_PULVERIZAR.pdf',
    '22) Trizinc citrate trihydrate Spec ENG 2015-11-18.pdf': 'CITRATO_DE_ZINC_TRIHIDRATADO.pdf',
    'HS 2017 Calcinit.pdf': 'CALCINIT_YARA.pdf',
    'Amilsol SOP_005b_1.0_GHS_Spanish.pdf': 'SULFATO_DE_POTASIO_AMILSOL.pdf',
    'PDS Amilsol SOP.pdf': 'PDS_SULFATO_DE_POTASIO_AMILSOL.pdf',
    'MSDS - Sulfato de Zinc Monohidratado.pdf': 'SULFATO_DE_ZINC_MONOHIDRATADO.pdf',
    'HDS NÚCLEO CAMASI 2 (1).docx': 'NUCLEO_CAMASI_2.docx',
    'HOJA SEGURIDAD RaiFOS 20.docx': 'RAIFOS_20.docx',
    'HOJA SEGURIDAD - SAM GRA (Sulfato de Amonio).pdf': 'SULFATO_DE_AMONIO_SAM_GRA.pdf',
    'HOJA SEGURIDAD ZUELOCa.docx': 'ZUELOCa.docx',
    'HS-CC-51 Sulfato de Magnesio Técnico.pdf': 'SULFATO_DE_MAGNESIO_TECNICO.pdf',
    'HS-GC-025 SULFATO DE POTASIO V-1.pdf': 'SULFATO_DE_POTASIO_V1.pdf',
    'HS-GC-177 NITRONS Ca - B V-1.pdf': 'NITRONS_CA_B.pdf',
    'HOJA DE SEGURIDAD KCL STANDAR.pdf': 'KCL_STANDARD.pdf',
    'HOJA DE SEGURIDAD KIESERITA P.docx': 'KIESERITA_P.docx',
    'SULFATO DE ZINC MONO MAXIMO-360-POLVO-HS..pdf': 'SULFATO_DE_ZINC_MONO_MAXIMO.pdf'
}

# 3. Procesar y renombrar archivos en hds_test/
print("=" * 80)
print("RENOMBRANDO MATERIAS PRIMAS A FORMATO HDS_MP_nombre")
print("=" * 80)

renombrados = 0
omitidos = 0

for file_path in HDS_TEST_DIR.glob("*.*"):
    filename = file_path.name
    
    # Si es de Productos Terminados (PT), se omite
    if filename in pt_files:
        print(f"[PT Omitido]: {filename}")
        omitidos += 1
        continue
    
    # Si está en nuestro mapa de materias primas
    if filename in mp_normalization:
        clean_name = mp_normalization[filename]
        # Formato solicitado HDS_MP_nombre
        new_filename = f"HDS_MP_{clean_name}"
        new_file_path = HDS_TEST_DIR / new_filename
        
        try:
            # Si el destino ya existe (por ejemplo duplicados de Cloruro de Potasio), lo manejamos
            if new_file_path.exists() and file_path != new_file_path:
                print(f"[REPETIDO]: {filename} -> ya existe {new_filename}. Se elimina duplicado.")
                file_path.unlink()
            else:
                os.rename(file_path, new_file_path)
                print(f"[RENOMBRADO]: {filename} -> {new_filename}")
                renombrados += 1
        except Exception as e:
            print(f"[ERR]: Error renombrando {filename} - {e}")
    else:
        # Si por alguna razón no está en el mapa, pero es MP, le hacemos una normalización automática
        stem = file_path.stem
        ext = file_path.suffix
        # Limpiar
        stem_clean = re.sub(r'^[0-9\)\.\s\-]+', '', stem) # Quitar números iniciales
        stem_clean = re.sub(r'(HOJA\s+DE\s+SEGURIDAD|HOJA\s+SEGURIDAD|HDS|MSDS|FDS|HS|Ficha\s+de\s+datos\s+de\s+seguridad)\s*', '', stem_clean, flags=re.IGNORECASE)
        stem_clean = re.sub(r'[\s\-]+', '_', stem_clean).strip('_').upper()
        
        new_filename = f"HDS_MP_{stem_clean}{ext}"
        new_file_path = HDS_TEST_DIR / new_filename
        
        try:
            if new_file_path.exists() and file_path != new_file_path:
                file_path.unlink()
                print(f"[AUTO-REPETIDO]: {filename} -> ya existe {new_filename}. Se elimina.")
            else:
                os.rename(file_path, new_file_path)
                print(f"[AUTO-RENOMBRADO]: {filename} -> {new_filename}")
                renombrados += 1
        except Exception as e:
            print(f"[ERR AUTO]: Error renombrando {filename} - {e}")

print("=" * 80)
print(f"PROCESO TERMINADO. Renombrados: {renombrados}, Omitidos (PT): {omitidos}")
print("=" * 80)
