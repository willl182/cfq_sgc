import pandas as pd

def main():
    csv_path = "/home/w182/w421/cfq_sgc/scratch/dossier_matches.csv"
    df = pd.read_csv(csv_path)
    
    print(f"Total rows in matches: {len(df)}")
    
    # Let's see some samples of matches grouped by PT and MP
    pt_matches = df[df['csv_clase'] == 'PT']
    mp_matches = df[df['csv_clase'] == 'MP']
    
    print("\n--- PT MATCHES (First 20) ---")
    for idx, row in pt_matches.head(20).iterrows():
        print(f"Dossier: {row['folder']} -> PT: {row['csv_product']} ({row['csv_id']}) [{row['match_type']}]")
        
    print("\n--- MP MATCHES ---")
    for idx, row in mp_matches.iterrows():
        print(f"Dossier: {row['folder']} -> MP: {row['csv_product']} ({row['csv_id']}) [{row['match_type']}]")

if __name__ == "__main__":
    main()
