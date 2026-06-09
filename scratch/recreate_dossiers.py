#!/usr/bin/env python3
import os
import csv
import re

def clean_folder_name(name):
    if '_' in name:
        parts = name.split('_', 1)
        return parts[1].strip()
    return name.strip()

def normalize_string(s):
    if not isinstance(s, str):
        return ""
    s = s.upper()
    replacements = {
        'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U',
        'Ñ': 'N', 'Ü': 'U'
    }
    for k, v in replacements.items():
        s = s.replace(k, v)
    s = re.sub(r'[-_/\(\)]', ' ', s)
    s = re.sub(r'[^A-Z0-9 ]', '', s)
    return ' '.join(s.split())

def main():
    base_dir = "/home/w182/w421/cfq_sgc"
    dossier_dir = os.path.join(base_dir, "SGC_CALFERQUIM/05_Dossier_Productos")
    csv_path = os.path.join(base_dir, "SGC_CALFERQUIM/prod_dep.csv")
    
    # 1. Map existing folders
    existing_folders = [d for d in os.listdir(dossier_dir) 
                        if os.path.isdir(os.path.join(dossier_dir, d)) and not d.startswith('_')]
    
    norm_existing = {}
    for f in existing_folders:
        cleaned = clean_folder_name(f)
        norm_existing[normalize_string(cleaned)] = f
        
    print(f"Total carpetas existentes mapeadas: {len(norm_existing)}")

    # 2. Parse prod_dep.csv
    created_count = 0
    skipped_count = 0
    
    with open(csv_path, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            clase = row['CLASE']
            if clase not in ('PT', 'MF'):
                continue
                
            cod = row['COD'].strip()
            producto = row['PRODUCTO'].strip()
            norm_prod = normalize_string(producto)
            
            # Check if it already exists
            if norm_prod in norm_existing:
                skipped_count += 1
                continue
            
            # Safe folder name creation
            safe_prod = re.sub(r'[\\/*?:"<>|]', '-', producto) # Replace characters unsafe for filesystems
            folder_name = f"{cod}_{safe_prod}"
            folder_path = os.path.join(dossier_dir, folder_name)
            
            # Create folder and PENDIENTES_CARGA.md file
            os.makedirs(folder_path, exist_ok=True)
            file_path = os.path.join(folder_path, "PENDIENTES_CARGA.md")
            
            with open(file_path, "w", encoding="utf-8") as out_f:
                out_f.write("# Pendientes de carga\n\n- Sin pendientes de estructura para esta fase inicial\n")
                
            created_count += 1
            # Register in mapped existing to avoid duplicate creations if the CSV has duplicate products
            norm_existing[norm_prod] = folder_name
            
    print(f"\nProceso Completado:")
    print(f"- Carpetas recreadas: {created_count}")
    print(f"- Carpetas omitidas (ya existentes): {skipped_count}")

if __name__ == "__main__":
    main()
