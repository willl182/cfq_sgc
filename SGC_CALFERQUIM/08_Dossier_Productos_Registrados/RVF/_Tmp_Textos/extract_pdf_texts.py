import os
import subprocess

pdf_dir = "/home/w182/w421/cfq_sgc/SGC_CALFERQUIM/08_Dossier_Productos_Registrados/RVF"

def extract_texts():
    files = os.listdir(pdf_dir)
    pdf_files = [f for f in files if f.lower().endswith('.pdf')]
    pdf_files.sort()
    
    print(f"Encontrados {len(pdf_files)} archivos PDF para procesar.")
    
    extracted_count = 0
    scanned_count = 0
    
    for pdf_file in pdf_files:
        pdf_path = os.path.join(pdf_dir, pdf_file)
        txt_file = pdf_file[:-4] + ".txt"
        txt_path = os.path.join(pdf_dir, txt_file)
        
        try:
            # Ejecutar pdftotext
            subprocess.run(["pdftotext", pdf_path, txt_path], check=True)
            
            # Verificar si tiene contenido real
            if os.path.exists(txt_path):
                with open(txt_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read().strip()
                
                # Si el archivo está vacío o casi vacío, lo consideramos escaneado
                if len(content) < 10:
                    os.remove(txt_path)
                    print(f"[ESCANEADO] {pdf_file}")
                    scanned_count += 1
                else:
                    print(f"[TEXTO EXTRAIDO] {pdf_file} -> {txt_file} ({len(content)} caracteres)")
                    extracted_count += 1
            else:
                print(f"[FALLO] No se creó el archivo de texto para {pdf_file}")
        except Exception as e:
            print(f"[ERROR] Error al procesar {pdf_file}: {e}")
            if os.path.exists(txt_path):
                os.remove(txt_path)
                
    print(f"\nResumen: {extracted_count} archivos con texto extraído, {scanned_count} archivos identificados como escaneados.")

if __name__ == "__main__":
    extract_texts()
