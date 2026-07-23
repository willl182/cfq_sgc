import os
import re
import csv
import glob

# Rutas
base_dir = "/home/w182/w421/cfq_sgc/SGC_CALFERQUIM/08_Dossier_Productos_Registrados"
pattern = os.path.join(base_dir, "*/01_Registro_Venta/RVF_*.md")

def parse_md(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    data = {
        "RVF": "",
        "Producto": "",
        "Fecha_Vigencia": "",
        "Clasificacion": "",
        "Composicion_Completa": "",
        "Limites_Microbiologicos": [],
        "Fuentes": "",
        "Aditivos_Inertes": "",
        "Nutrientes_Dict": {}
    }
    
    # 1. Título: ## PRODUCTO (RVF NRO)
    title_match = re.search(r"^##\s+(.+?)\s+\(RVF\s+(\d+)\)", content, re.MULTILINE)
    if title_match:
        data["Producto"] = title_match.group(1).strip()
        data["RVF"] = title_match.group(2).strip()
        
    # 2. Registro de venta y vigencia: • Registro de Venta: No. 13918 (Vigente desde 29/Oct/2024)
    reg_match = re.search(r"•\s+Registro de\s+Venta:\s+No\.\s+(\d+)\s+\(Vigente\s+desde\s+(.*?)\)", content)
    if reg_match:
        data["Fecha_Vigencia"] = reg_match.group(2).strip()
        if not data["RVF"]:
            data["RVF"] = reg_match.group(1).strip()
            
    # 3. Clasificación: • Clasificación: ...
    clas_match = re.search(r"•\s+Clasificación:\s*(.*)", content)
    if clas_match:
        data["Clasificacion"] = clas_match.group(1).strip()
        
    # 4. Composición Garantizada
    comp_section = re.search(r"###\s+Composición\s+Garantizada\s*\n(.*?)(?=\n###|$)", content, re.DOTALL)
    if comp_section:
        comp_text = comp_section.group(1).strip()
        lines = comp_text.split("\n")
        nutrientes_list = []
        for line in lines:
            if "|" in line and "Nutriente" not in line and "---" not in line:
                parts = line.split("|")
                if len(parts) >= 2:
                    nutr = parts[0].strip()
                    val = parts[1].strip()
                    
                    # Remover guiones iniciales o caracteres especiales raros del nutriente
                    nutr_clean = re.sub(r"^[—\-\s\•\*\+]+", "", nutr).strip()
                    # Si no está vacío
                    if nutr_clean and val:
                        data["Nutrientes_Dict"][nutr_clean] = val
                        nutrientes_list.append(f"{nutr_clean}: {val}")
        data["Composicion_Completa"] = "; ".join(nutrientes_list)
        
    # 5. Límites Microbiológicos
    lim_section = re.search(r"###\s+Límites\s+Microbiológicos.*?\n(.*?)(?=\n###|$)", content, re.DOTALL)
    if lim_section:
        lim_text = lim_section.group(1).strip()
        for line in lim_text.split("\n"):
            line = line.strip()
            if line.startswith("•"):
                lim_val = line[1:].strip()
                # Excluir metales pesados genéricos de la lista si queremos mantener sólo microbios,
                # o dejarlos. Los dejamos para que sea completo.
                data["Limites_Microbiologicos"].append(lim_val)
                
    # 6. Fuentes y Aditivos
    fuentes_section = re.search(r"###\s+Fuentes\s*\n(.*?)(?=\n###|$)", content, re.DOTALL)
    if fuentes_section:
        fuentes_text = fuentes_section.group(1).strip()
        fuentes_lines = []
        for line in fuentes_text.split("\n"):
            line = line.strip()
            if line.startswith("Aditivos e inertes:"):
                data["Aditivos_Inertes"] = line[len("Aditivos e inertes:"):].strip()
            elif line.startswith("Aditivos:"):
                data["Aditivos_Inertes"] = line[len("Aditivos:"):].strip()
            elif line:
                fuentes_lines.append(line)
        data["Fuentes"] = " ".join(fuentes_lines).strip()
        
    return data

def main():
    md_files = glob.glob(pattern)
    md_files.sort()
    
    print(f"Encontrados {len(md_files)} archivos Markdown para consolidar.")
    
    all_data = []
    all_nutrients = set()
    
    for file_path in md_files:
        try:
            data = parse_md(file_path)
            if data["RVF"]:
                all_data.append(data)
                all_nutrients.update(data["Nutrientes_Dict"].keys())
                print(f"Procesado RVF {data['RVF']} - {data['Producto']}")
            else:
                print(f"Advertencia: No se pudo extraer RVF de {file_path}")
        except Exception as e:
            print(f"Error procesando {file_path}: {e}")
            
    # Ordenar por número de RVF
    all_data.sort(key=lambda x: int(x["RVF"]) if x["RVF"].isdigit() else 99999)
    
    # Nutrientes ordenados para columnas específicas (NPK, CaMgS, B, Co, Cu, Zn, etc.)
    def get_nutrient_rank(name):
        groups = [
            ("Nitrógeno", 10),
            ("Fósforo", 20),
            ("Potasio", 30),
            ("Calcio", 40),
            ("Magnesio", 50),
            ("Azufre", 60),
            ("Boro", 70),
            ("Cobalto", 80),
            ("Cobre", 90),
            ("Hierro", 100),
            ("Manganeso", 110),
            ("Molibdeno", 120),
            ("Zinc", 130),
            ("Silicio", 140),
            ("Sílice", 140),
            ("Sodio", 150)
        ]
        
        for prefix, base_rank in groups:
            if name.startswith(prefix):
                sub_rank = 9
                if "Total" in name:
                    sub_rank = 1
                elif "Asimilable" in name:
                    sub_rank = 2
                elif "Soluble en Agua" in name or "Soluble en agua" in name:
                    sub_rank = 3
                elif "Soluble en HCl" in name:
                    sub_rank = 4
                elif "Amoniacal" in name:
                    sub_rank = 5
                elif "Nítrico" in name:
                    sub_rank = 6
                elif "Ureico" in name:
                    sub_rank = 7
                elif "Orgánico" in name:
                    sub_rank = 8
                return (base_rank + sub_rank / 10.0, name)
                
        organic_groups = [
            ("Carbono Orgánico", 160),
            ("Relación Carbono", 170),
            ("Cenizas", 180),
            ("Humedad", 190),
            ("pH", 200),
            ("Conductividad", 210),
            ("Densidad", 220),
            ("Capacidad de Intercambio", 230),
            ("Capacidad de Retención", 240),
            ("Solubilidad", 250),
            ("Residuo Insoluble", 260)
        ]
        for prefix, base_rank in organic_groups:
            if name.startswith(prefix):
                return (base_rank, name)
                
        return (999, name)

    sorted_nutrients = sorted(list(all_nutrients), key=get_nutrient_rank)
    
    # Columnas base del CSV
    fieldnames = [
        "RVF", "Producto", "Fecha_Vigencia", "Clasificacion", 
        "Fuentes", "Aditivos_Inertes", "Limites_Microbiologicos", 
        "Composicion_Completa"
    ] + sorted_nutrients
    
    # Rutas de salida
    out_path_1 = "/home/w182/w421/cfq_sgc/SGC_CALFERQUIM/10_Base_Datos_Tecnica/RVF_CONSOLIDADO.csv"
    out_path_2 = "/home/w182/w421/cfq_sgc/SGC_CALFERQUIM/08_Dossier_Productos_Registrados/RVF/RVF_CONSOLIDADO.csv"
    
    for out_path in [out_path_1, out_path_2]:
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        with open(out_path, "w", newline="", encoding="utf-8") as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            
            for d in all_data:
                row = {
                    "RVF": d["RVF"],
                    "Producto": d["Producto"],
                    "Fecha_Vigencia": d["Fecha_Vigencia"],
                    "Clasificacion": d["Clasificacion"],
                    "Fuentes": d["Fuentes"],
                    "Aditivos_Inertes": d["Aditivos_Inertes"],
                    "Limites_Microbiologicos": "; ".join(d["Limites_Microbiologicos"]),
                    "Composicion_Completa": d["Composicion_Completa"]
                }
                # Rellenar columnas de nutrientes
                for nutr in sorted_nutrients:
                    row[nutr] = d["Nutrientes_Dict"].get(nutr, "")
                    
                writer.writerow(row)
                
        print(f"Consolidado guardado en: {out_path}")

if __name__ == "__main__":
    main()
