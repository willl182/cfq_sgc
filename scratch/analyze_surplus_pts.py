import pandas as pd

def main():
    csv_path = "/home/w182/w421/cfq_sgc/SGC_CALFERQUIM/FORMULADOR - PROD.csv"
    df = pd.read_csv(csv_path)
    df.columns = [c.strip() for c in df.columns]
    
    pt_df = df[df['CLASE'] == 'PT']
    
    # We already know which dossiers matched. Let's load the matched CSV IDs
    matches_df = pd.read_csv("/home/w182/w421/cfq_sgc/scratch/dossier_matches.csv")
    matched_ids = set(matches_df['csv_id'])
    
    unmatched_pts = pt_df[~pt_df['ID_PROD'].isin(matched_ids)]
    
    print(f"Total PT in CSV: {len(pt_df)}")
    print(f"Matched PT in CSV: {len(matched_ids & set(pt_df['ID_PROD']))}")
    print(f"Unmatched PT in CSV: {len(unmatched_pts)}")
    
    # Let's see their suppliers/proveedores
    print("\n--- PROVEEDORES OF UNMATCHED PTs ---")
    print(unmatched_pts['PROVEEDOR'].value_counts(dropna=False).head(10))
    
    # Let's see some naming patterns
    print("\n--- SAMPLE PRODUCTS BY PREFIX ---")
    # Group by name patterns: MF, MFE, CGC, etc.
    prefixes = {}
    for idx, r in unmatched_pts.iterrows():
        prod = str(r['PRODUCTO'])
        parts = prod.split()
        if parts:
            pref = parts[0]
            prefixes[pref] = prefixes.get(pref, 0) + 1
            
    sorted_pref = sorted(prefixes.items(), key=lambda x: x[1], reverse=True)
    print("Top Product Name Prefixes in Unmatched PTs:")
    for p, c in sorted_pref[:15]:
        print(f"  - {p}: {c} products")
        
    # Let's print some examples for each prefix
    print("\n--- SAMPLE SPECIFIC UNMATCHED PTs ---")
    for pref, _ in sorted_pref[:6]:
        sample = unmatched_pts[unmatched_pts['PRODUCTO'].str.startswith(pref, na=False)].head(3)
        print(f"Prefix '{pref}':")
        for _, r in sample.iterrows():
            print(f"  - ID: {r['ID_PROD']} | Product: {r['PRODUCTO']}")

if __name__ == "__main__":
    main()
