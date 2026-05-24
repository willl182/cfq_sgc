import os

scripts_dir = "z:/cfq_sgc/SGC_CALFERQUIM/scripts"
for file in os.listdir(scripts_dir):
    if file.endswith(".py"):
        path = os.path.join(scripts_dir, file)
        print(f"\n======================================")
        print(f"Script: {file}")
        print(f"======================================")
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            lines = f.readlines()
        for idx, line in enumerate(lines):
            # look for path indicators: "202_CALFERQUIM", "SGC_CALFERQUIM", "os.path", open(..., "w", "r", "a"), pd.read_excel, pd.read_csv, "openpyxl.load_workbook"
            l_lower = line.lower()
            if any(k in l_lower for k in ["path", "open(", "read_excel", "read_csv", "load_workbook", "to_excel", "to_csv", "202_calferquim", "sgc_calferquim", "history", "plans"]):
                print(f"  Line {idx+1}: {line.strip()}")
