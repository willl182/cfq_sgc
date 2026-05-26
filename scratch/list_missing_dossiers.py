import pandas as pd
import os
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
    dossier_dir = "/home/w182/w421/cfq_sgc/SGC_CALFERQUIM/05_Dossier_Productos"
    csv_path = "/home/w182/w421/cfq_sgc/SGC_CALFERQUIM/FORMULADOR - PROD.csv"
    
    # 1. Load dossiers and get set of normalized folder names
    dossier_folders = [d for d in os.listdir(dossier_dir) 
                       if os.path.isdir(os.path.join(dossier_dir, d)) and not d.startswith('_')]
    
    norm_folders = set()
    for f in dossier_folders:
        clean = clean_folder_name(f)
        norm_folders.add(normalize_string(clean))
        
    # We will also load the matches we computed previously to be 100% precise
    matches_csv = "/home/w182/w421/cfq_sgc/scratch/dossier_matches.csv"
    matched_csv_ids = set()
    if os.path.exists(matches_csv):
        df_matches = pd.read_csv(matches_csv)
        matched_csv_ids = set(df_matches['csv_id'])
        
    # 2. Load CSV
    df_csv = pd.read_csv(csv_path)
    df_csv.columns = [c.strip() for c in df_csv.columns]
    
    pt_df = df_csv[df_csv['CLASE'] == 'PT']
    
    missing_pts = []
    
    for idx, row in pt_df.iterrows():
        csv_id = row['ID_PROD']
        prod_name = row['PRODUCTO']
        norm_prod = normalize_string(prod_name)
        norm_id = normalize_string(csv_id)
        norm_nombre = normalize_string(row['NOMBRE']) if 'NOMBRE' in row and pd.notna(row['NOMBRE']) else ""
        
        # Check if matched by previous precise matching script
        is_matched = csv_id in matched_csv_ids
        
        # Double check with normalized folder set just in case
        if not is_matched:
            if norm_prod in norm_folders or norm_id in norm_folders or (norm_nombre and norm_nombre in norm_folders):
                is_matched = True
                
        if not is_matched:
            # Determine category
            category = "Otros / Comerciales"
            prod_upper = str(prod_name).upper()
            if prod_upper.startswith("MFE "):
                category = "MFE (Mezclas Físicas Especiales)"
            elif prod_upper.startswith("MF "):
                category = "MF (Mezclas Físicas)"
            elif prod_upper.startswith("POLVILLO "):
                category = "POLVILLO (Subproductos en Polvo)"
            elif prod_upper.startswith("FE "):
                category = "FE (Fórmulas Especiales)"
                
            missing_pts.append({
                "id": csv_id,
                "producto": prod_name,
                "tipo": row['TIPO'] if 'TIPO' in row and pd.notna(row['TIPO']) else "",
                "proveedor": row['PROVEEDOR'] if 'PROVEEDOR' in row and pd.notna(row['PROVEEDOR']) else "",
                "category": category
            })
            
    df_missing = pd.DataFrame(missing_pts)
    print(f"Total missing PT records: {len(df_missing)}")
    print("Missing by Category:")
    print(df_missing['category'].value_counts())
    
    # Save the full markdown report
    output_md = "/home/w182/w421/cfq_sgc/scratch/dossiers_faltantes_maestro.md"
    
    with open(output_md, "w") as f:
        f.write("# INVENTARIO COMPLETO DE DOSSIERS FALTANTES (CATÁLOGO OPERATIVO)\n\n")
        f.write(f"Este archivo contiene la lista completa de los **{len(df_missing)}** registros de Producto Terminado (PT) en `FORMULADOR - PROD.csv` que **no tienen una carpeta física de dossier** en `05_Dossier_Productos/`.\n\n")
        
        f.write("## 1. Resumen por Categoría\n\n")
        counts = df_missing['category'].value_counts()
        for cat, val in counts.items():
            f.write(f"* **{cat}**: {val} productos faltantes\n")
        f.write("\n---\n\n")
        
        # Write tables per category
        for cat in sorted(df_missing['category'].unique()):
            cat_df = df_missing[df_missing['category'] == cat].sort_values(by="producto")
            f.write(f"## {cat} (Total: {len(cat_df)})\n\n")
            f.write("| # | ID en Formulador | Nombre de Producto | Tipo | Proveedor |\n")
            f.write("|---|---|---|---|---|\n")
            for idx, (_, row) in enumerate(cat_df.iterrows(), 1):
                f.write(f"| {idx} | `{row['id']}` | **{row['producto']}** | {row['tipo']} | {row['proveedor']} |\n")
            f.write("\n---\n\n")
            
    print(f"Generated complete report at: {output_md}")

if __name__ == "__main__":
    main()
