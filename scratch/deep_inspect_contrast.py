import os
import pandas as pd
import json
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
    
    dossier_folders = sorted([d for d in os.listdir(dossier_dir) 
                              if os.path.isdir(os.path.join(dossier_dir, d)) and not d.startswith('_')])
    
    df_csv = pd.read_csv(csv_path)
    df_csv.columns = [c.strip() for c in df_csv.columns]
    
    df_csv['norm_PRODUCTO'] = df_csv['PRODUCTO'].apply(normalize_string)
    df_csv['norm_NOMBRE'] = df_csv['NOMBRE'].apply(normalize_string)
    df_csv['norm_ID_PROD'] = df_csv['ID_PROD'].apply(normalize_string)
    
    # Let's inspect the 15 unmatched folders and search for close matches in CSV
    unmatched_folders = [
        "11_AFOSK", "16_CALFERCOBRE", "18_CAL DESARROLLO", "19_CALFER FLORACION", 
        "25_FERTICORRECTIVO", "26_FOLLAJE", "28_GANADERO", "40_NUCLEO MAGNE3", 
        "47_R-VITAL 17", "51_SUELO-Ca", "52_SULFA K 50", "56_TODERO", 
        "57_YESO EN POLVO", "58_YESO GRANULADO", "61_ORGANIC_M"
    ]
    
    print("--- DEEP SEARCH FOR UNMATCHED DOSSIERS ---")
    
    fuzzy_results = {}
    for folder in unmatched_folders:
        clean = clean_folder_name(folder)
        norm = normalize_string(clean)
        
        # Tokenize
        tokens = norm.split()
        
        matches = []
        # Look for partial overlaps in CSV
        for idx, row in df_csv.iterrows():
            prod_norm = row['norm_PRODUCTO']
            id_norm = row['norm_ID_PROD']
            name_norm = row['norm_NOMBRE']
            
            score = 0
            # Check for token subset or high similarity
            for token in tokens:
                if len(token) > 2: # ignore small tokens
                    if token in prod_norm or token in id_norm or token in name_norm:
                        score += 1
            
            # Additional heuristic: check if name is abbreviation
            # e.g., "AFOSK" vs "AFOS-K"
            if not score and len(tokens) == 1:
                t = tokens[0]
                # If we remove non-alphanumeric, is it the same?
                clean_csv_prod = re.sub(r'[^A-Z0-9]', '', prod_norm)
                if t == clean_csv_prod:
                    score += 2
                    
            if score > 0:
                matches.append({
                    "id": row['ID_PROD'],
                    "product": row['PRODUCTO'],
                    "clase": row['CLASE'],
                    "tipo": row['TIPO'],
                    "proveedor": row['PROVEEDOR'],
                    "score": score
                })
        
        # Sort by score descending
        matches = sorted(matches, key=lambda x: x['score'], reverse=True)
        fuzzy_results[folder] = matches[:5] # Keep top 5
        
        print(f"\nDossier: {folder} (Clean: {clean})")
        if matches:
            for m in matches[:3]:
                print(f"  -> Match (Score {m['score']}): {m['id']} | {m['product']} ({m['clase']})")
        else:
            print("  -> NO MATCH FOUND")
            
    # Let's inspect the surplus in PT
    # Why are there 344 PT rows in the CSV? Let's check some duplication or naming.
    # Group PT products by clean name to see if there are multiple entries for the same product
    print("\n--- ANALYZING PT DUPLICATES IN CSV ---")
    pt_df = df_csv[df_csv['CLASE'] == 'PT']
    prod_counts = pt_df['PRODUCTO'].value_counts()
    print(f"Number of unique product names in PT: {len(prod_counts)}")
    print("Top duplicated product names in PT:")
    print(prod_counts.head(10))
    
    # Let's see some examples of duplicates
    sample_dupes = prod_counts[prod_counts > 1].index[:3]
    for p in sample_dupes:
        print(f"\nDuplicate product: '{p}'")
        rows = pt_df[pt_df['PRODUCTO'] == p]
        for _, r in rows.iterrows():
            print(f"  - ID_PROD: {r['ID_PROD']} | Prov: {r['PROVEEDOR']} | Tipo: {r['TIPO']}")
            
    # Let's see what is inside "12_AZUFREA MALLA 100", "53_SULFATO DE POTASIO", "54_SULFATO DE ZINC AL 35%", "55_SULFATO ZINC 22"
    # Why did 53_SULFATO DE POTASIO match MP: SULFATO DE ZINC 35%? That seems like an error!
    # Let's check how the matching went for that folder
    print("\n--- RETRYING SULFATO DE POTASIO MATCH ---")
    potasio_folder = "53_SULFATO DE POTASIO"
    clean_pot = clean_folder_name(potasio_folder)
    norm_pot = normalize_string(clean_pot)
    print(f"Normalized Potasio: '{norm_pot}'")
    pot_matches = []
    for idx, row in df_csv.iterrows():
        np = row['norm_PRODUCTO']
        if "POTASIO" in np or "POTASIO" in row['norm_ID_PROD']:
            pot_matches.append((row['ID_PROD'], row['PRODUCTO'], row['CLASE']))
    print("Potasio matches in CSV:")
    for pm in pot_matches:
        print(f"  - {pm[0]} | {pm[1]} ({pm[2]})")
        
    # Write full analysis data to a JSON file so we can read it to compile the final report
    analysis_results = {
        "fuzzy_results": fuzzy_results,
        "pot_matches": pot_matches,
        "clase_counts": df_csv['CLASE'].value_counts().to_dict(),
        "total_pt": len(pt_df),
        "total_mp": len(df_csv[df_csv['CLASE'] == 'MP']),
        "unique_pt_names": len(prod_counts),
        "top_duplicated_pt": prod_counts.head(15).to_dict(),
    }
    
    with open("/home/w182/w421/cfq_sgc/scratch/deep_contrast_results.json", "w") as f:
        json.dump(analysis_results, f, indent=4)

if __name__ == "__main__":
    main()
