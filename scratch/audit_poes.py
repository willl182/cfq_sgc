import os
import json

base_dir = "/home/w182/w421/cfq_sgc/SGC_CALFERQUIM/03_Procedimientos"
subfolders = sorted([f for f in os.listdir(base_dir) if os.path.isdir(os.path.join(base_dir, f)) and f.startswith("3.")])

report = []

for folder in subfolders:
    folder_path = os.path.join(base_dir, folder)
    
    # We want to inspect: POE, Formatos, Registros, Anexos, and other contents
    item = {
        "folder": folder,
        "poe_subfolder_exists": os.path.exists(os.path.join(folder_path, "POE")),
        "formatos_subfolder_exists": os.path.exists(os.path.join(folder_path, "Formatos")),
        "registros_subfolder_exists": os.path.exists(os.path.join(folder_path, "Registros")),
        "anexos_subfolder_exists": os.path.exists(os.path.join(folder_path, "Anexos")),
        "poe_files": [],
        "formatos_files": [],
        "registros_files": [],
        "anexos_files": [],
        "root_files": []
    }
    
    # Check root of folder
    for f in os.listdir(folder_path):
        f_path = os.path.join(folder_path, f)
        if os.path.isfile(f_path):
            item["root_files"].append(f)
            
    # Check POE folder
    if item["poe_subfolder_exists"]:
        poe_path = os.path.join(folder_path, "POE")
        for f in os.listdir(poe_path):
            if os.path.isfile(os.path.join(poe_path, f)):
                item["poe_files"].append(f)
                
    # Check Formatos folder
    if item["formatos_subfolder_exists"]:
        fmt_path = os.path.join(folder_path, "Formatos")
        for f in os.listdir(fmt_path):
            if os.path.isfile(os.path.join(fmt_path, f)):
                item["formatos_files"].append(f)
                
    # Check Registros folder
    if item["registros_subfolder_exists"]:
        reg_path = os.path.join(folder_path, "Registros")
        for f in os.listdir(reg_path):
            if os.path.isfile(os.path.join(reg_path, f)):
                item["registros_files"].append(f)
                
    # Check Anexos folder
    if item["anexos_subfolder_exists"]:
        anx_path = os.path.join(folder_path, "Anexos")
        for f in os.listdir(anx_path):
            if os.path.isfile(os.path.join(anx_path, f)):
                item["anexos_files"].append(f)
                
    report.append(item)

with open("/home/w182/w421/cfq_sgc/scratch/audit_results.json", "w") as f:
    json.dump(report, f, indent=2)

print("Saved audit report to /home/w182/w421/cfq_sgc/scratch/audit_results.json")

