import os
import pandas as pd
import re
import json

def clean_folder_name(name):
    # e.g., "01_1-CRECIMIENTO" -> "1-CRECIMIENTO"
    # "08_BORO GRANULADO" -> "BORO GRANULADO"
    if '_' in name:
        parts = name.split('_', 1)
        clean = parts[1].strip()
    else:
        clean = name.strip()
    return clean

def normalize_string(s):
    if not isinstance(s, str):
        return ""
    # Convert to uppercase, replace accents, replace multiple spaces with single space, remove punctuation
    s = s.upper()
    # Replace accents
    replacements = {
        'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U',
        'Ñ': 'N', 'Ü': 'U'
    }
    for k, v in replacements.items():
        s = s.replace(k, v)
    # Replace hyphens/underscores/slashes with space
    s = re.sub(r'[-_/\(\)]', ' ', s)
    # Remove other non-alphanumeric except spaces
    s = re.sub(r'[^A-Z0-9 ]', '', s)
    # Normalize spaces
    s = ' '.join(s.split())
    return s

def main():
    dossier_dir = "/home/w182/w421/cfq_sgc/SGC_CALFERQUIM/05_Dossier_Productos"
    csv_path = "/home/w182/w421/cfq_sgc/SGC_CALFERQUIM/FORMULADOR - PROD.csv"
    
    # 1. Load dossiers
    dossier_folders = sorted([d for d in os.listdir(dossier_dir) 
                              if os.path.isdir(os.path.join(dossier_dir, d)) and not d.startswith('_')])
    
    dossier_data = []
    for folder in dossier_folders:
        clean = clean_folder_name(folder)
        norm = normalize_string(clean)
        dossier_data.append({
            "original_folder": folder,
            "clean_folder": clean,
            "norm_folder": norm
        })
    df_dossiers = pd.DataFrame(dossier_data)
    
    # 2. Load CSV
    df_csv = pd.read_csv(csv_path)
    # Clean column names just in case
    df_csv.columns = [c.strip() for c in df_csv.columns]
    
    # Let's see CLASE distribution
    print("CSV Class Distribution:")
    print(df_csv['CLASE'].value_counts(dropna=False))
    
    # Normalize CSV columns
    df_csv['norm_PRODUCTO'] = df_csv['PRODUCTO'].apply(normalize_string)
    df_csv['norm_NOMBRE'] = df_csv['NOMBRE'].apply(normalize_string)
    df_csv['norm_ID_PROD'] = df_csv['ID_PROD'].apply(normalize_string)
    
    # We want to match dossiers to CSV rows
    # We will try several matching strategies for each dossier:
    # 1. Exact match on normalized folder vs norm_PRODUCTO or norm_NOMBRE or norm_ID_PROD
    # 2. Substring match
    
    matches = []
    unmatched_dossiers = []
    
    for idx, row in df_dossiers.iterrows():
        norm_f = row['norm_folder']
        orig_f = row['original_folder']
        clean_f = row['clean_folder']
        
        # Try finding exact matches in CSV
        # Match against norm_PRODUCTO
        exact_prod = df_csv[df_csv['norm_PRODUCTO'] == norm_f]
        exact_name = df_csv[df_csv['norm_NOMBRE'] == norm_f]
        exact_id = df_csv[df_csv['norm_ID_PROD'] == norm_f]
        
        exact_matches = pd.concat([exact_prod, exact_name, exact_id]).drop_duplicates(subset=['ID_PROD'])
        
        if not exact_matches.empty:
            for _, csv_row in exact_matches.iterrows():
                matches.append({
                    "folder": orig_f,
                    "clean_folder": clean_f,
                    "csv_id": csv_row['ID_PROD'],
                    "csv_product": csv_row['PRODUCTO'],
                    "csv_clase": csv_row['CLASE'],
                    "csv_tipo": csv_row['TIPO'],
                    "csv_proveedor": csv_row['PROVEEDOR'],
                    "match_type": "Exacto"
                })
        else:
            # Let's try partial matching (substring or token overlap)
            # Find any CSV rows where the normalized folder is inside norm_PRODUCTO/norm_NOMBRE or vice versa
            partial_matches = []
            for c_idx, csv_row in df_csv.iterrows():
                np = csv_row['norm_PRODUCTO']
                nn = csv_row['norm_NOMBRE']
                nid = csv_row['norm_ID_PROD']
                
                # Check if norm_f is a substring of np/nn/nid or vice versa
                is_partial = False
                if norm_f and np and (norm_f in np or np in norm_f):
                    is_partial = True
                elif norm_f and nn and (norm_f in nn or nn in norm_f):
                    is_partial = True
                elif norm_f and nid and (norm_f in nid or nid in norm_f):
                    is_partial = True
                
                # Special check: token overlap (if high overlap)
                if not is_partial and norm_f and np:
                    f_tokens = set(norm_f.split())
                    p_tokens = set(np.split())
                    if len(f_tokens & p_tokens) >= 2 or (len(f_tokens) == 1 and len(p_tokens) == 1 and f_tokens == p_tokens):
                        is_partial = True
                
                if is_partial:
                    partial_matches.append(csv_row)
                    
            if partial_matches:
                for pm in partial_matches:
                    matches.append({
                        "folder": orig_f,
                        "clean_folder": clean_f,
                        "csv_id": pm['ID_PROD'],
                        "csv_product": pm['PRODUCTO'],
                        "csv_clase": pm['CLASE'],
                        "csv_tipo": pm['TIPO'],
                        "csv_proveedor": pm['PROVEEDOR'],
                        "match_type": "Parcial"
                    })
            else:
                unmatched_dossiers.append(row)
                
    df_matches = pd.DataFrame(matches)
    
    # Save results to review
    print(f"\nTotal Dossiers: {len(df_dossiers)}")
    print(f"Matched Dossiers (with at least one match): {len(df_matches['folder'].unique()) if not df_matches.empty else 0}")
    print(f"Unmatched Dossiers: {len(unmatched_dossiers)}")
    
    # Let's inspect unmatched dossiers
    if unmatched_dossiers:
        print("\nUnmatched Dossiers:")
        for ud in unmatched_dossiers:
            print(f"- {ud['original_folder']} (Clean: {ud['clean_folder']})")
            
    # Which finished products (PT) in CSV did NOT match any dossier?
    matched_csv_ids = set(df_matches['csv_id']) if not df_matches.empty else set()
    unmatched_pts = df_csv[(df_csv['CLASE'] == 'PT') & (~df_csv['ID_PROD'].isin(matched_csv_ids))]
    print(f"\nUnmatched PTs in CSV (CLASE=PT, total={len(df_csv[df_csv['CLASE'] == 'PT'])}): {len(unmatched_pts)}")
    
    # Let's see some unmatched PTs
    if not unmatched_pts.empty:
        print("Sample unmatched PTs:")
        for _, row in unmatched_pts.head(20).iterrows():
            print(f"- ID: {row['ID_PROD']} | Product: {row['PRODUCTO']} | Prov: {row['PROVEEDOR']}")
            
    # Let's also check MP matching
    matched_mps = df_matches[df_matches['csv_clase'] == 'MP']
    print(f"\nDossier folders matching a Raw Material (MP) in CSV (Total: {len(matched_mps['folder'].unique()) if not matched_mps.empty else 0}):")
    if not matched_mps.empty:
        for _, row in matched_mps.drop_duplicates(subset=['folder']).iterrows():
            print(f"- Folder: {row['folder']} matches MP: {row['csv_product']} ({row['csv_id']})")
            
    # We want to export detailed tables to markdown or CSV for the final report
    # Let's save a structured analysis to scratch/contrast_summary.json
    contrast_summary = {
        "total_dossiers": len(df_dossiers),
        "total_csv_records": len(df_csv),
        "csv_clase_counts": df_csv['CLASE'].value_counts(dropna=False).to_dict(),
        "matched_dossier_count": len(df_matches['folder'].unique()) if not df_matches.empty else 0,
        "unmatched_dossier_count": len(unmatched_dossiers),
        "unmatched_dossiers": [ud['original_folder'] for ud in unmatched_dossiers],
        "unmatched_pt_count": len(unmatched_pts),
        "unmatched_pts": unmatched_pts[['ID_PROD', 'PRODUCTO', 'PROVEEDOR', 'TIPO']].to_dict(orient='records'),
        "matched_mps": matched_mps[['folder', 'clean_folder', 'csv_id', 'csv_product', 'csv_proveedor', 'match_type']].to_dict(orient='records') if not matched_mps.empty else []
    }
    
    with open("/home/w182/w421/cfq_sgc/scratch/contrast_summary.json", "w") as f:
        json.dump(contrast_summary, f, indent=4)
        
    # Write details of all dossier matches
    if not df_matches.empty:
        df_matches.to_csv("/home/w182/w421/cfq_sgc/scratch/dossier_matches.csv", index=False)

if __name__ == "__main__":
    main()
