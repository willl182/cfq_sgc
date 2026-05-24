#!/usr/bin/env python3
"""
Script para organizar Hojas de Seguridad en Dossiers de Productos
Crea estructura de dossiers y copia HS correspondientes a cada producto
"""

import shutil
from pathlib import Path
import re

# Configuración
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
HS_INDICE = PROJECT_ROOT / "SGC_CALFERQUIM" / "05_Dossier_Productos" / "_Indice_HS"
DOSSIER_BASE = PROJECT_ROOT / "SGC_CALFERQUIM" / "05_Dossier_Productos"

# Lista de productos con sus nombres normalizados
productos = {
    '35': {'nombre': '62_SILIMAGRAN 30', 'hs_file': 'HS_SILIMAGRAN_Item35.docx'},
    '62': {'nombre': '02_NUCLEO CAMASI', 'hs_file': 'HS_NUCLEO_CAMASI_GRIS_Item62.docx'},
    '65': {'nombre': '03_NUCLEO 4', 'hs_file': 'HS_NUCLEO_4_OWN.docx'},  # HS propia existente
    '141': {'nombre': '57_YESO EN POLVO', 'hs_file': 'HS_SULFATO_DE_CALCIO_Item141.pdf'},
    '155': {'nombre': '46_RAIFOS 20', 'hs_file': 'HS_RAIFOS_20_OWN.docx'},  # HS propia existente
    '160': {'nombre': '59_ZUELOCa', 'hs_file': 'HS_ZUELO_CA_OWN.docx'},  # HS propia existente
    '161': {'nombre': '24_FERTIMENORES', 'hs_file': 'HS_FERTIMENORES_OWN.docx'},  # HS propia existente
    '208': {'nombre': '40_NUCLEO MAGNE3', 'hs_file': 'HS_NUCLEO_MAGNESIO_Item208.pdf'},
    '300': {'nombre': '29_K2K', 'hs_file': 'HS_K2K_OWN.docx'},  # HS propia existente
    '452': {'nombre': '02_NUCLEO CAMASI', 'hs_file': 'HS_NUCLEO_CAMASI_ROJO_Item452.docx'},
    '558': {'nombre': '42_NUCLEO MAGNESIO-SILICIO', 'hs_file': 'HS_NUCLEO_MAGNESIO-SILICIO_EM_Item558.pdf'},
    '563': {'nombre': '38_NUCLEO CAMASI YARA', 'hs_file': 'HS_NUCLEO_CAMASI_YARA_Item563.docx'},
    '574': {'nombre': '39_NUCLEO FOSFORO-1', 'hs_file': 'HS_NUCLEO_FOSFORO_1_Item574.docx'},
    '643': {'nombre': '55_SULFATO ZINC 22', 'hs_file': 'HS_FE_SULFATO_ZINC_22_Item643.docx'},
    '679': {'nombre': '39_NUCLEO FOSFORO-1', 'hs_file': 'HS_NUCLEO_FOSFORO_10_Item679.docx'},
    '803': {'nombre': '43_NUCLEO MAGNESIO-S', 'hs_file': 'HS_NUCLEO_MAGNESIO-S_Item803.pdf'},
    '997': {'nombre': '55_SULFATO ZINC 22', 'hs_file': 'HS_SULFATO_ZINC_22_Item997.docx'},
}

# Mapeo para productos con HS propias existentes
hs_propias = {
    '65': 'Hoja de Seguridad Nucleo 4.docx',
    '155': 'HOJA SEGURIDAD RaiFOS 20.docx',
    '160': 'HOJA SEGURIDAD ZUELOCa.docx',
    '161': 'HOJA DE SEGURIDAD - FERTIMENORES.docx',
    '300': 'HOJA DE SEGURIDAD - K2K.docx',
}

print("=" * 80)
print("SCRIPT: ORGANIZAR HS EN DOSSIERS DE PRODUCTOS")
print("=" * 80)

# Leer archivos HS del índice
hs_archivos = list(HS_INDICE.glob("*.*"))
hs_mapa = {}
for hs in hs_archivos:
    hs_mapa[hs.name] = hs

creados = []
existentes = []
no_encontrados = []

# Crear estructura de dossiers
for item, info in productos.items():
    nombre = info['nombre']
    hs_file = info['hs_file']
    
    # Crear estructura de carpetas
    dossier_path = DOSSIER_BASE / nombre
    hs_subdir = dossier_path / "04_Hoja_Seguridad"
    
    # Verificar si el dossier ya existe
    if dossier_path.exists():
        # Verificar si HS ya está en el dossier
        if hs_subdir.exists():
            archivos_hs = list(hs_subdir.glob("HS_*"))
            if archivos_hs:
                existentes.append({'item': item, 'nombre': nombre, 'hs': archivos_hs[0].name})
                print(f"  [INFO] {nombre} (Item {item}): HS ya existe")
                continue
    
    # Crear directorio HS
    hs_subdir.mkdir(parents=True, exist_ok=True)
    
    # Buscar archivo HS correspondiente
    archivo_hs = None
    if '_OWN' in hs_file:
        # HS propia existente en directorio de MP
        hs_mp = hs_propias.get(item)
        if hs_mp:
            mp_path = PROJECT_ROOT / "_Legacy_y_Otros" / "202_CALFERQUIM" / "07 Hojas de Seguridad" / hs_mp
            if mp_path.exists():
                archivo_hs = mp_path
    
    if not archivo_hs:
        # Buscar en el índice
        for key, path in hs_mapa.items():
            if f"Item{item}" in key:
                archivo_hs = path
                break
    
    if archivo_hs and archivo_hs.exists():
        # Determinar nombre destino
        ext = archivo_hs.suffix
        if '_OWN' in hs_file:
            nombre_destino = f"HS_{nombre}{ext}"
        else:
            nombre_destino = archivo_hs.name
        
        destino = hs_subdir / nombre_destino
        
        try:
            shutil.copy2(archivo_hs, destino)
            creados.append({
                'item': item,
                'nombre': nombre,
                'origen': archivo_hs.name,
                'destino': str(destino)
            })
            print(f"  [OK] {nombre} (Item {item}): HS copiada")
            print(f"  Origen: {archivo_hs.name}")
            print(f"  Destino: {destino}\n")
        except Exception as e:
            print(f"  [ERR] {nombre} (Item {item}): Error al copiar - {e}\n")
            no_encontrados.append({'item': item, 'nombre': nombre})
    else:
        print(f"  [ERR] {nombre} (Item {item}): No se encontró HS\n")
        no_encontrados.append({'item': item, 'nombre': nombre})

# Resumen
print("=" * 80)
print("RESUMEN")
print("=" * 80)
print(f"HS copiadas a dossiers: {len(creados)}")
print(f"HS ya existentes en dossiers: {len(existentes)}")
print(f"HS no encontradas: {len(no_encontrados)}")

if creados:
    print(f"\n=== PRODUCTOS CON HS CREADAS ===")
    for prod in creados:
        print(f"Item {prod['item']} - {prod['nombre']}")
        print(f"  {prod['destino']}")

if existentes:
    print(f"\n=== PRODUCTOS CON HS YA EXISTENTES ===")
    for prod in existentes:
        print(f"Item {prod['item']} - {prod['nombre']}: {prod['hs']}")

if no_encontrados:
    print(f"\n=== PRODUCTOS SIN HS ===")
    for prod in no_encontrados:
        print(f"Item {prod['item']} - {prod['nombre']}")

print(f"\nDossiers creados en: {DOSSIER_BASE}")

