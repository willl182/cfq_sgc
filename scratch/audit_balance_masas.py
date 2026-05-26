import os
import glob
import pandas as pd
import json

def audit_balance_masas():
    base_dir = "/home/w182/w421/cfq_sgc/SGC_CALFERQUIM/05_Dossier_Productos"
    products = []
    
    # List all subdirectories
    subdirs = sorted([d for d in os.listdir(base_dir) if os.path.isdir(os.path.join(base_dir, d)) and not d.startswith('_')])
    
    # We will also read the consolidado to see if the product is in the CSV
    consolidado_path = "/home/w182/w421/cfq_sgc/balance_masas_consolidado.csv"
    consolidado_products = set()
    if os.path.exists(consolidado_path):
        try:
            df = pd.read_csv(consolidado_path)
            if 'producto' in df.columns:
                consolidado_products = set(df['producto'].unique())
        except Exception as e:
            print(f"Error reading consolidado: {e}")
            
    print(f"Loaded {len(consolidado_products)} products from consolidado.")
    
    results = []
    
    for subdir in subdirs:
        prod_path = os.path.join(base_dir, subdir)
        balance_dir = os.path.join(prod_path, "05_Balance_Masas")
        
        has_folder = os.path.exists(balance_dir)
        xlsx_files = []
        has_balance_file = False
        
        if has_folder:
            # Search for xlsx/xls files
            xlsx_files = glob.glob(os.path.join(balance_dir, "*.xlsx")) + glob.glob(os.path.join(balance_dir, "*.xls"))
            # Filter out lock files
            xlsx_files = [f for f in xlsx_files if not os.path.basename(f).startswith('.~lock')]
            
            # Check if any file looks like a balance of masses
            for f in xlsx_files:
                fname = os.path.basename(f).lower()
                if "balance" in fname or "materia" in fname or "masa" in fname or "formula" in fname:
                    has_balance_file = True
        
        # Determine product clean name
        # Subdir names are usually like "01_1-CRECIMIENTO" or "11_AFOSK"
        clean_name = subdir
        if '_' in subdir:
            parts = subdir.split('_', 1)
            # e.g., "01_1-CRECIMIENTO" -> prefix = "01", clean_name = "1-CRECIMIENTO"
            prefix = parts[0]
            clean_name = parts[1]
        
        # Check if matched in consolidado (using various matches)
        in_consolidado = clean_name in consolidado_products
        if not in_consolidado:
            # Try matching without prefix numbers if any
            # e.g. "1-CRECIMIENTO" -> "CRECIMIENTO" or just check substrings
            for cp in consolidado_products:
                if cp.lower() in clean_name.lower() or clean_name.lower() in cp.lower():
                    in_consolidado = True
                    break
        
        results.append({
            "dir_name": subdir,
            "clean_name": clean_name,
            "has_folder": has_folder,
            "files": [os.path.basename(f) for f in xlsx_files],
            "has_balance_file": has_balance_file or (len(xlsx_files) > 0), # if there is an xlsx in the folder, count it as a candidate
            "in_consolidado": in_consolidado
        })
        
    # Write report
    report_lines = []
    report_lines.append("# AUDITORÍA DE BALANCES DE MATERIA POR PRODUCTO")
    report_lines.append(f"**Total Productos en Dossier:** {len(results)}\n")
    
    # Products with balance file
    with_balance = [r for r in results if r['has_balance_file']]
    without_balance = [r for r in results if not r['has_balance_file']]
    
    report_lines.append(f"## Resumen de Cobertura\n")
    report_lines.append(f"- **Con Balance de Materias Primas:** {len(with_balance)} / {len(results)} ({len(with_balance)/len(results)*100:.1f}%)")
    report_lines.append(f"- **FALTAN Balance de Materias Primas:** {len(without_balance)} / {len(results)} ({len(without_balance)/len(results)*100:.1f}%)\n")
    
    report_lines.append("## Productos que FALTAN de Balance de Materia (Dossier)\n")
    report_lines.append("| # | Directorio del Producto | Estado Carpeta 05_Balance_Masas | Archivos xlsx en carpeta | ¿En balance_masas_consolidado.csv? |")
    report_lines.append("|---|-------------------------|--------------------------------|-------------------------|------------------------------------|")
    
    for idx, r in enumerate(without_balance, 1):
        folder_status = "Existe" if r['has_folder'] else "**FALTA CARPETA**"
        files_str = ", ".join(r['files']) if r['files'] else "Ninguno"
        in_cons_str = "Sí" if r['in_consolidado'] else "No"
        report_lines.append(f"| {idx} | `{r['dir_name']}` | {folder_status} | {files_str} | {in_cons_str} |")
        
    report_lines.append("\n## Productos que TIENEN Balance de Materia en Dossier\n")
    report_lines.append("| # | Directorio del Producto | Archivos de Balance | ¿En balance_masas_consolidado.csv? |")
    report_lines.append("|---|-------------------------|---------------------|------------------------------------|")
    
    for idx, r in enumerate(with_balance, 1):
        files_str = ", ".join(f"`{f}`" for f in r['files'])
        in_cons_str = "Sí" if r['in_consolidado'] else "No"
        report_lines.append(f"| {idx} | `{r['dir_name']}` | {files_str} | {in_cons_str} |")
        
    with open("/home/w182/w421/cfq_sgc/scratch/reporte_auditoria_balances.md", "w") as f_out:
        f_out.write("\n".join(report_lines))
        
    print(f"Audit completed. Report written to scratch/reporte_auditoria_balances.md")
    print(f"Total missing: {len(without_balance)}")

if __name__ == "__main__":
    audit_balance_masas()
