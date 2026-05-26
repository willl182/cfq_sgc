import os
import re

# Configuración de rutas
BASE_DIR = "/home/w182/w421/cfq_sgc"
PROCEDIMIENTOS_DIR = os.path.join(BASE_DIR, "SGC_CALFERQUIM", "03_Procedimientos")

# 1. Renombrar las carpetas físicas
mapping_names = {
    "POE": "01_POE",
    "Formatos": "02_Formatos",
    "Registros": "03_Registros"
}

renamed_directories = []

print("=== INICIANDO RENOMBRADO DE CARPETAS OPERATIVAS ===")

# Recorremos el directorio de procedimientos
if os.path.exists(PROCEDIMIENTOS_DIR):
    for entry in os.listdir(PROCEDIMIENTOS_DIR):
        entry_path = os.path.join(PROCEDIMIENTOS_DIR, entry)
        # Nos enfocamos en los directorios de procedimientos 3.01 a 3.20
        if os.path.isdir(entry_path) and re.match(r"^3\.\d{2}_", entry):
            print(f"\nProcesando procedimiento: {entry}")
            for old_name, new_name in mapping_names.items():
                old_folder_path = os.path.join(entry_path, old_name)
                new_folder_path = os.path.join(entry_path, new_name)
                
                if os.path.exists(old_folder_path) and os.path.isdir(old_folder_path):
                    try:
                        os.rename(old_folder_path, new_folder_path)
                        print(f"  [RENOMBRADO OK] {old_name} -> {new_name}")
                        renamed_directories.append((entry, old_name, new_name))
                    except Exception as e:
                        print(f"  [ERROR RENOMBRANDO] {old_name} -> {new_name}: {e}")
                else:
                    # Verificar si ya existe el nuevo nombre para evitar reportar errores falsos
                    if os.path.exists(new_folder_path):
                        print(f"  [YA EXISTE] {new_name}")
                    else:
                        print(f"  [NO EXISTE/N/A] {old_name}")
else:
    print(f"ERROR: No se encontró el directorio {PROCEDIMIENTOS_DIR}")

print("\n=== INICIANDO ACTUALIZACIÓN DE REFERENCIAS EN DOCUMENTOS ===")

# Expresiones regulares para buscar y reemplazar
# Buscaremos patrones del tipo: 3.XX_Nombre/POE -> 3.XX_Nombre/01_POE
patterns = [
    (re.compile(r"(3\.\d{2}_[^/]+)/POE(?!\w)"), r"\1/01_POE"),
    (re.compile(r"(3\.\d{2}_[^/]+)/Formatos(?!\w)"), r"\1/02_Formatos"),
    (re.compile(r"(3\.\d{2}_[^/]+)/Registros(?!\w)"), r"\1/03_Registros")
]

# También manejamos referencias directas con "/" que a veces omiten el subnombre largo pero no es común.
# Ej. 3.01/POE -> 3.01/01_POE (por si acaso existieran)
extra_patterns = [
    (re.compile(r"(3\.\d{2})/POE(?!\w)"), r"\1/01_POE"),
    (re.compile(r"(3\.\d{2})/Formatos(?!\w)"), r"\1/02_Formatos"),
    (re.compile(r"(3\.\d{2})/Registros(?!\w)"), r"\1/03_Registros")
]

all_patterns = patterns + extra_patterns

ignored_dirs = {".git", ".antigravitycli", ".claude", "logs", "scratch"}
valid_extensions = {".md", ".csv", ".txt", ".xml", ".html"}

modified_files_count = 0

for root, dirs, files in os.walk(BASE_DIR):
    # Filtrar directorios ignorados
    dirs[:] = [d for d in dirs if d not in ignored_dirs]
    
    for file in files:
        file_ext = os.path.splitext(file)[1].lower()
        if file_ext in valid_extensions:
            file_path = os.path.join(root, file)
            
            # Leer el archivo
            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
            except Exception as e:
                print(f"Error leyendo {file_path}: {e}")
                continue
                
            # Aplicar reemplazos
            new_content = content
            made_changes = False
            
            for pattern, replacement in all_patterns:
                temp_content, count = pattern.subn(replacement, new_content)
                if count > 0:
                    new_content = temp_content
                    made_changes = True
            
            if made_changes:
                # Escribir de vuelta el archivo
                try:
                    with open(file_path, "w", encoding="utf-8") as f:
                        f.write(new_content)
                    # Mostrar la ruta relativa para limpieza visual
                    rel_path = os.path.relpath(file_path, BASE_DIR)
                    print(f"  [MODIFICADO OK] {rel_path}")
                    modified_files_count += 1
                except Exception as e:
                    print(f"Error escribiendo {file_path}: {e}")

print(f"\n=== PROCESO COMPLETADO ===")
print(f"Carpetas renombradas: {len(renamed_directories)}")
print(f"Archivos de texto modificados: {modified_files_count}")
