#!/usr/bin/env python3
"""
rebuild_08_dossier.py
Reconstruye SGC_CALFERQUIM/08_Dossier_Productos_Registrados/ alineándolo
con el índice oficial de RVF (27 productos), copiando los expedientes
reales desde 05_Dossier_Productos/ y recuperando SOLURAIFOS desde Legacy.

Reglas de seguridad:
- NUNCA borra archivos directamente; cualquier carpeta desplazada va a _Archivo/
- Copia (no mueve) desde 05_Dossier_Productos para preservar la fuente
- Todos los pasos se loguean en rebuild_08_log.txt
"""

import os
import shutil
import datetime
import sys

BASE = "/home/w182/w421/cfq_sgc"
DIR_05 = os.path.join(BASE, "SGC_CALFERQUIM/05_Dossier_Productos")
DIR_08 = os.path.join(BASE, "SGC_CALFERQUIM/08_Dossier_Productos_Registrados")
DIR_LEGACY = os.path.join(BASE, "_Legacy_y_Otros/08_Dossier_Productos_Registrados_Legacy")
DIR_ARCHIVO = os.path.join(DIR_08, "_Archivo_Previo")
LOG_FILE = os.path.join(BASE, "scratch/rebuild_08_log.txt")

# Mapeo: (prefijo_destino_en_08, nombre_carpeta_en_08, nombre_en_05, fuente_override)
# fuente_override = None usa DIR_05, si es string usa esa ruta completa
MAPEO_RVF = [
    ("01", "01_RVF2812_FOSFORITA_NEIVA",         "27_FOSFORITA NEIVA",        None),
    ("02", "02_RVF2949_CALFERZINC-P",             "23_CALFERZINC-P",           None),
    ("03", "03_RVF3537_CALFERQUIM_15-15-15",      "07_15-15-15",               None),
    ("04", "04_RVF3601_SILIMAGRAN_30",            "62_SILIMAGRAN 30",          None),
    ("05", "05_RVF4415_AFOS-K_0-40-50",           "11_AFOSK",                  None),
    ("06", "06_RVF4533_CALFERQUIM_18-18-18",      "05_18-18-18",               None),
    ("07", "07_RVF5060_CALFERQUIM_17-6-18-2",     "06_17-6-18-2",              None),
    ("08", "08_RVF5791_CALFERCOBRE",              "16_CALFERCOBRE",            None),
    ("09", "09_RVF5867_CALFERMAGNESIO",           "63_CALFERMAGNESIO",         None),
    ("10", "10_RVF5884_BIOPLANTAS",               "60_BIOPLANTAS",             None),
    ("11", "11_RVF9386_25-4-24",                  "04_25-4-24",                None),
    ("12", "12_RVF13446_RAIFOS_20",               "46_RAIFOS 20",              None),
    ("13", "13_RVF13702_ZUELOCA",                 "59_ZUELOCa",               None),
    ("14", "14_RVF13749_SULFAK-50",               "52_SULFA K 50",             None),
    ("15", "15_RVF13751_SOLURAIFOS",              None,  # fuente especial legacy
           "_SOLURAIFOS_LEGACY"),  # marker
    ("16", "16_RVF13790_PRODUCCION_17",           "45_PRODUCCION 17",          None),
    ("17", "17_RVF13801_K2K",                     "29_K2K",                    None),
    ("18", "18_RVF13824_CALFER_LLENADO",          "20_CALFER LLENADO",         None),
    ("19", "19_RVF13859_2-AVANCE",                "02_2-AVANCE",               None),
    ("20", "20_RVF13860_CALFER_MENORES",          "22_CALFER MENORES",         None),
    ("21", "21_RVF13867_3-PRODUCTOR",             "03_3-PRODUCTOR",            None),
    ("22", "22_RVF13871_CALFER_FLORACION",        "19_CALFER FLORACION",       None),
    ("23", "23_RVF13872_1-CRECIMIENTO",           "01_1-CRECIMIENTO",          None),
    ("24", "24_RVF13883_MAGNE-3",                 "31_MAGNE-3",                None),
    ("25", "25_RVF13918_ORGANIC-M",               "61_ORGANIC_M",              None),
    ("26", "26_RVF14125_CALFERCORRECTIVO",        "17_CALFERCORRECTIVO",       None),
]

# Carpetas huérfanas en 08 actuales que deben archivarse
CARPETAS_HUERFANAS = [
    "21_NUCLEO MAGNESIO-SILICIO",
    "26_NUCLEO MAGNESIO-AZUFRE",
    "41_ORGANIC_M",
    "63_CALFERMAGNESIO",
    "x review",
    "xx_AFOS-K_0-40-50",
    "xx_BIOPLANTAS",
    "xx_CALFERCOBRE",
    "xx_FOSFORITA_NEIVA",
    "xx_SULFAK-50",
]

log_lines = []
errors = []

def log(msg):
    ts = datetime.datetime.now().strftime("%H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line)
    log_lines.append(line)

def copy_tree_safe(src, dst, label=""):
    """Copia src a dst. Si dst existe, lo reemplaza."""
    if not os.path.exists(src):
        errors.append(f"FUENTE NO ENCONTRADA: {src}")
        log(f"  ERROR: Fuente no encontrada: {src}")
        return False
    if os.path.exists(dst):
        log(f"  INFO: Destino ya existe, se sobreescribe: {dst}")
        shutil.rmtree(dst)
    shutil.copytree(src, dst, dirs_exist_ok=False)
    count = sum(len(files) for _, _, files in os.walk(dst))
    log(f"  OK: Copiados {count} archivos de '{label}' → {os.path.basename(dst)}")
    return True

def archive_folder(folder_name):
    """Mueve una carpeta de 08 a _Archivo_Previo."""
    src = os.path.join(DIR_08, folder_name)
    if not os.path.exists(src):
        log(f"  SKIP: No existe (ya limpio): {folder_name}")
        return
    dst = os.path.join(DIR_ARCHIVO, folder_name)
    if os.path.exists(dst):
        # si ya existe en archivo, agregar timestamp
        ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        dst = dst + f"_{ts}"
    shutil.move(src, dst)
    log(f"  ARCHIVADO: '{folder_name}' → _Archivo_Previo/")

def main():
    log("=" * 60)
    log("INICIO: Reconstrucción de 08_Dossier_Productos_Registrados")
    log(f"Fecha: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}")
    log("=" * 60)

    # Paso 1: Crear directorio de archivo si no existe
    os.makedirs(DIR_ARCHIVO, exist_ok=True)
    log(f"\n[PASO 1] Carpeta _Archivo_Previo creada/verificada.")

    # Paso 2: Archivar carpetas huérfanas / temporales actuales
    log(f"\n[PASO 2] Archivando carpetas huérfanas/temporales existentes en 08...")
    for carpeta in CARPETAS_HUERFANAS:
        archive_folder(carpeta)

    # Paso 3: Copiar cada dossier registrado desde su fuente
    log(f"\n[PASO 3] Poblando 08 con dossiers desde 05_Dossier_Productos y Legacy...")
    for entry in MAPEO_RVF:
        if len(entry) == 4:
            orden, nombre_dest, nombre_05, override = entry
        else:
            # Caso legacy SOLURAIFOS (3 elementos)
            orden, nombre_dest, nombre_05 = entry
            override = None

        dst = os.path.join(DIR_08, nombre_dest)

        # Caso especial: SOLURAIFOS viene del Legacy
        if nombre_05 == "_SOLURAIFOS_LEGACY":
            src = os.path.join(DIR_LEGACY, "37_SOLURAIFOS")
            log(f"\n  [{orden}] {nombre_dest}  (fuente: Legacy)")
            copy_tree_safe(src, dst, label="37_SOLURAIFOS (Legacy)")
        elif nombre_05 is not None:
            src = os.path.join(DIR_05, nombre_05)
            log(f"\n  [{orden}] {nombre_dest}  (fuente: 05/{nombre_05})")
            copy_tree_safe(src, dst, label=nombre_05)

    # Paso 4: Agregar el PDF del RVF a cada carpeta 01_Registro_Venta que no lo tenga
    log(f"\n[PASO 4] Vinculando PDFs RVF a subcarpetas 01_Registro_Venta...")
    rvf_pdfs = {
        "01": "01 RVF 2812 FOSFORITA NEIVA.pdf",
        "02": "02 RVF 2949 CALFERZINC-P 030.pdf",
        "03": "03 RVF 3537 CALFERQUIM 15-15-15.pdf",
        "04": "04 RVF 3601 SILIMAGRAN 30.PDF",
        "05": "05 RVF 4415 AFOS-K 0-40-50.pdf",
        "06": "06 RVF 4533 CALFERQUIM 18-18-18.PDF",
        "07": "07 RVF 5060 CALFERQUIM 17-6-18-2(MgO).PDF",
        "08": "08 RVF 5791 CALFERCOBRE.PDF",
        "09": "09 RVF 5867 CALFERMAGNESIO.PDF",
        "10": "10 RVF 5884 BIOPLANTAS.PDF",
        "11": "11 RVF 9386 25-4-24.PDF",
        "12": "12 RVF 13446 RAIFOS 20.pdf",
        "13": "13 RVF 13702 ZUELOCA.pdf",
        "14": "14 RVF 13749 SULFAK-50.pdf",
        "15": "15 RVF 13751 SOLURAIFOS.pdf",
        "16": "16 RVF 13790 PRODUCCION 17.pdf",
        "17": "17 RVF 13801 K2K.pdf",
        "18": "18 RVF 13824 CALFER LLENADO.pdf",
        "19": "20 RVF 13859_2- AVANCE 20-31-10_2024_20241122063.pdf",
        "20": "21 RVF 13860_CALFER MENORES_2024_20241122064.pdf",
        "21": "22 RVF 13867_3 PRODUCTOR_2024_20241122062 (1).pdf",
        "22": "23 RVF 13871_CAFER FLORACION_2024_20241120787.pdf",
        "23": "24 RVF 13872_1 CRECIMIENTO 30_2024_20241122061.pdf",
        "24": "25 RVF 13883_MAGNE 3_2024_20231118030 (1).pdf",
        "25": "26 RVF 13918_ORGANIC-M_2024_20241122065.pdf",
        "26": "27 RVF 14125 CALFERCORRECTIVO.pdf",
    }

    rvf_dir_source = os.path.join(DIR_08, "RVF")

    for entry in MAPEO_RVF:
        if len(entry) == 4:
            orden, nombre_dest, _, _ = entry
        else:
            orden, nombre_dest, _ = entry

        if orden not in rvf_pdfs:
            continue

        pdf_name = rvf_pdfs[orden]
        pdf_src = os.path.join(rvf_dir_source, pdf_name)
        rv_dir = os.path.join(DIR_08, nombre_dest, "01_Registro_Venta")

        if not os.path.exists(pdf_src):
            log(f"  SKIP [{orden}]: PDF RVF no encontrado: {pdf_name}")
            continue

        os.makedirs(rv_dir, exist_ok=True)
        pdf_dst = os.path.join(rv_dir, pdf_name)

        if not os.path.exists(pdf_dst):
            shutil.copy2(pdf_src, pdf_dst)
            log(f"  PDF copiado [{orden}]: {pdf_name} → {nombre_dest}/01_Registro_Venta/")
        else:
            log(f"  SKIP [{orden}]: PDF ya presente en {nombre_dest}/01_Registro_Venta/")

    # Paso 5: Limpiar PENDIENTES_CARGA.md sobrantes en 08 (son del 05)
    log(f"\n[PASO 5] Resumen final...")
    total_carpetas = 0
    total_archivos = 0
    for d in sorted(os.listdir(DIR_08)):
        full = os.path.join(DIR_08, d)
        if os.path.isdir(full) and d not in ("RVF", "_Archivo_Previo"):
            total_carpetas += 1
            n = sum(len(files) for _, _, files in os.walk(full))
            total_archivos += n
            log(f"    {d}: {n} archivo(s)")

    log(f"\n  Total carpetas de dossier: {total_carpetas}")
    log(f"  Total archivos en dossiers: {total_archivos}")

    # Paso 6: Errores
    if errors:
        log(f"\n[ERRORES] {len(errors)} error(es) encontrado(s):")
        for e in errors:
            log(f"  !! {e}")
    else:
        log(f"\n[OK] Sin errores.")

    # Guardar log
    with open(LOG_FILE, "w", encoding="utf-8") as f:
        f.write("\n".join(log_lines))
    log(f"\nLog guardado en: {LOG_FILE}")
    log("=" * 60)
    log("FIN: Reconstrucción completada.")

if __name__ == "__main__":
    main()
