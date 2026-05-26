import os

dossiers_dir = "/home/w182/w421/cfq_sgc/SGC_CALFERQUIM/08_Dossier_Productos_Registrados"

# Vamos a encontrar todas las subcarpetas de primer nivel que existen en los dossiers
folders = sorted([f for f in os.listdir(dossiers_dir) if f.startswith(tuple(f"{i:02d}_" for i in range(1, 27)))])

all_subdirs = set()
for folder in folders:
    folder_path = os.path.join(dossiers_dir, folder)
    if os.path.isdir(folder_path):
        for entry in os.listdir(folder_path):
            if os.path.isdir(os.path.join(folder_path, entry)):
                all_subdirs.add(entry)

print("Subcarpetas detectadas:", sorted(list(all_subdirs)))

# Vamos a definir la lista a escanear en base a lo que se detectó
subdirs_to_check = sorted(list(all_subdirs))

header = "| Dossier | " + " | ".join(subdirs_to_check) + " | Total Archivos |"
separator = "| :--- | " + " :---: | " * len(subdirs_to_check) + " :---: |"
print(header)
print(separator)

for folder in folders:
    folder_path = os.path.join(dossiers_dir, folder)
    status = {}
    
    total_files = 0
    for root, dirs, files in os.walk(folder_path):
        total_files += len(files)
        
    for sd in subdirs_to_check:
        sd_path = os.path.join(folder_path, sd)
        if not os.path.exists(sd_path):
            status[sd] = "✗"
            continue
            
        sd_files = []
        for root, dirs, files in os.walk(sd_path):
            for file in files:
                sd_files.append(file)
                
        if len(sd_files) > 0:
            status[sd] = "✓"
        else:
            status[sd] = "✗"
            
    row = f"| {folder} | " + " | ".join(status[sd] for sd in subdirs_to_check) + f" | {total_files} |"
    print(row)
