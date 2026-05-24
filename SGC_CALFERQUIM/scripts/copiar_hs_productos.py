#!/usr/bin/env python3
"""
Script para copiar Hojas de Seguridad de Materia Prima a Productos Terminados
Basado en análisis de correspondencia de productos de producción
"""

import shutil
from pathlib import Path
import re

# Configuración
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
HS_DIR = PROJECT_ROOT / "_Legacy_y_Otros" / "202_CALFERQUIM" / "07 Hojas de Seguridad"
DEST_DIR = PROJECT_ROOT / "SGC_CALFERQUIM" / "05_Dossier_Productos" / "_Indice_HS"

# Crear directorio destino si no existe
DEST_DIR.mkdir(parents=True, exist_ok=True)

# Leer archivos HS disponibles
hs_archivos = []
for ext in ['*.pdf', '*.docx', '*.doc']:
    hs_archivos.extend(HS_DIR.glob(ext))

# Crear mapa de archivos HS
hs_rutas = {}
for hs in hs_archivos:
    nombre_normalizado = hs.stem.upper().replace(' ', '')
    hs_rutas[nombre_normalizado] = str(hs)

# Mapeo de productos a HS fuente
mapeo_productos = {
    '141': {
        'producto': 'SULFATO_DE_CALCIO',
        'item': '141',
        'hs_fuente': 'YESOAGRICOLANATURALSANTAROSA',  # 15) Yeso Agricola Natural Santa Rosa .pdf
        'hs_alterna': 'YESOAGRICOLA',
        'nota': 'Sulfato de calcio = Yeso agrícola'
    },
    '35': {
        'producto': 'SILIMAGRAN',
        'item': '35',
        'hs_fuente': 'HOJADESEGURIDADNUCLEO4',  # Hoja de Seguridad Nucleo 4.docx
        'hs_alterna': 'NUCLEO4',
        'nota': 'Usar HS de NUCLEO 4'
    },
    '208': {
        'producto': 'NUCLEO_MAGNESIO',
        'item': '208',
        'hs_fuente': 'KIESERITA-SULFATODEMAGNESIOMONOHIDRATADO,KIESERITE',  # 29. Ficha de datos de seguridad de Kieserita
        'hs_alterna': 'KIESERITA',
        'nota': 'Núcleo magnesio = Kieserita (Sulfato de magnesio)'
    },
    '563': {
        'producto': 'NUCLEO_CAMASI_YARA',
        'item': '563',
        'hs_fuente': 'HSDENUCLEOCAMASIYARA',  # HS DE NÚCLEO CAMASI YARA.docx
        'hs_alterna': 'CAMASI',
        'nota': 'HS propia existente'
    },
    '643': {
        'producto': 'FE_SULFATO_ZINC_22',
        'item': '643',
        'hs_fuente': 'HOJADESEGURIDADSULFATOZINC22',  # Hoja de Seguridad SulfatoZinc22.pdf
        'hs_alterna': 'SULFATOZINC22',
        'nota': 'Usar HS de materia prima Sulfato de Zinc 22%'
    },
    '997': {
        'producto': 'SULFATO_ZINC_22',
        'item': '997',
        'hs_fuente': 'HOJADESEGURIDADSULFATOZINC22',  # Mismo que 643
        'hs_alterna': 'SULFATOZINC22',
        'nota': 'Duplicado de Item 643'
    },
    '62': {
        'producto': 'NUCLEO_CAMASI_GRIS',
        'item': '62',
        'hs_fuente': 'HDSNUCLEOCAMASI2',  # HDS NÚCLEO CAMASI 2 (1).docx
        'hs_alterna': 'CAMASI',
        'nota': 'Usar HS de NUCLEO CAMASI 2'
    },
    '452': {
        'producto': 'NUCLEO_CAMASI_ROJO',
        'item': '452',
        'hs_fuente': 'HDSNUCLEOCAMASI2',  # Mismo que CAMASI GRIS
        'hs_alterna': 'CAMASI',
        'nota': 'Usar HS de NUCLEO CAMASI 2'
    },
    '574': {
        'producto': 'NUCLEO_FOSFORO_1',
        'item': '574',
        'hs_fuente': 'HOJADESEGURIDADNUCLEOFOSFORO',  # HOJA DE SEGURIDAD -NUCLEO FOSFORO.docx
        'hs_alterna': 'NUCLEOFOSFORO',
        'nota': 'Usar HS de NÚCLEO FOSFORO'
    },
    '679': {
        'producto': 'NUCLEO_FOSFORO_10',
        'item': '679',
        'hs_fuente': 'HOJADESEGURIDADNUCLEOFOSFORO',  # Mismo que NUCLEO FOSFORO 1
        'hs_alterna': 'NUCLEOFOSFORO',
        'nota': 'Usar HS de NÚCLEO FOSFORO'
    },
    '803': {
        'producto': 'NUCLEO_MAGNESIO-S',
        'item': '803',
        'hs_fuente': 'KIESERITA-SULFATODEMAGNESIOMONOHIDRATADO,KIESERITE',  # Mismo que NUCLEO MAGNESIO
        'hs_alterna': 'KIESERITA',
        'nota': 'Usar HS de Kieserita (igual que Item 208)'
    },
    '558': {
        'producto': 'NUCLEO_MAGNESIO-SILICIO_EM',
        'item': '558',
        'hs_fuente': 'KIESERITA-SULFATODEMAGNESIOMONOHIDRATADO,KIESERITE',  # Mismo que NUCLEO MAGNESIO
        'hs_alterna': 'KIESERITA',
        'nota': 'Usar HS de Kieserita (igual que Item 208)'
    },
}

print("=" * 80)
print("SCRIPT: COPIAR HOJAS DE SEGURIDAD A PRODUCTOS")
print("=" * 80)

copiados = []
no_encontrados = []

for item, info in mapeo_productos.items():
    producto = info['producto']
    hs_fuente = info['hs_fuente']
    nota = info['nota']
    
    # Buscar archivo fuente exacto
    archivo_fuente = None
    for key, ruta in hs_rutas.items():
        if hs_fuente in key:
            archivo_fuente = ruta
            break
    
    # Si no encuentra exacto, buscar alternativo
    if not archivo_fuente:
        for key, ruta in hs_rutas.items():
            if info['hs_alterna'] in key:
                archivo_fuente = ruta
                break
    
    if archivo_fuente:
        # Crear nombre destino
        fuente_path = Path(HS_DIR / archivo_fuente)
        ext = fuente_path.suffix
        nombre_destino = f"HS_{producto}_Item{item}{ext}"
        destino_path = DEST_DIR / nombre_destino
        
        # Copiar archivo
        try:
            shutil.copy2(fuente_path, destino_path)
            copiados.append({
                'item': item,
                'producto': producto,
                'origen': archivo_fuente,
                'destino': nombre_destino,
                'nota': nota
            })
            print(f"  [OK] Copiado: {nombre_destino}")
            print(f"  Desde: {archivo_fuente}")
            print(f"  Nota: {nota}\n")
        except Exception as e:
            print(f"  [ERR] Error al copiar {producto}: {e}\n")
            no_encontrados.append(item)
    else:
        print(f"  [ERR] No se encontró HS para {producto} (Item {item})")
        print(f"  Buscaba: {hs_fuente} o {info['hs_alterna']}\n")
        no_encontrados.append(item)

# Resumen
print("=" * 80)
print("RESUMEN")
print("=" * 80)
print(f"HS copiadas exitosamente: {len(copiados)}/{len(mapeo_productos)}")
print(f"HS no encontradas: {len(no_encontrados)}")

if no_encontrados:
    print(f"\nItems sin HS: {', '.join(no_encontrados)}")

print(f"\nArchivos creados en: {DEST_DIR}")

