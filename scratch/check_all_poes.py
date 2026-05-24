import os

proc_dir = "z:/cfq_sgc/SGC_CALFERQUIM/03_Procedimientos"
subfolders = sorted([f for f in os.listdir(proc_dir) if os.path.isdir(os.path.join(proc_dir, f)) and f.startswith("3.")])

print(f"Auditing {len(subfolders)} procedure directories under {proc_dir}:\n")

for folder in subfolders:
    folder_path = os.path.join(proc_dir, folder)
    poe_dir = os.path.join(folder_path, "POE")
    
    # Check if POE directory exists
    if not os.path.exists(poe_dir):
        # Look if there are md/docx in the folder root itself
        files = os.listdir(folder_path)
        md_files = [f for f in files if f.endswith(".md") and "poe" in f.lower()]
        docx_files = [f for f in files if f.endswith(".docx") and "poe" in f.lower()]
        print(f"Folder: {folder} | NO 'POE' SUBFOLDER | Root MDs: {md_files} | Root DOCXs: {docx_files}")
    else:
        files = os.listdir(poe_dir)
        md_files = [f for f in files if f.endswith(".md")]
        docx_files = [f for f in files if f.endswith(".docx")]
        print(f"Folder: {folder} | POE folder exists | MDs: {md_files} | DOCXs: {docx_files}")
