import os
import csv
import json

csv_path = "/home/w182/w421/cfq_sgc/SGC_CALFERQUIM/10_Base_Datos_Tecnica/RVF_CONSOLIDADO.csv"
html_out = "/home/w182/w421/cfq_sgc/SGC_CALFERQUIM/08_Dossier_Productos_Registrados/RVF/visor_composicion.html"

def build_html():
    if not os.path.exists(csv_path):
        print(f"Error: No se encontró el archivo CSV en {csv_path}")
        return
        
    products_data = []
    
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            products_data.append(row)
            
    print(f"Cargados {len(products_data)} productos del CSV.")
    
    # Serializar datos a JSON para incrustarlos en el HTML
    products_json = json.dumps(products_data, indent=2, ensure_ascii=False)
    
    # Plantilla HTML
    html_content = f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visor de Composición de Registros de Venta (RVF)</title>
    <!-- Google Fonts: Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <style>
        :root {{
            --bg-main: #f8fafc;
            --bg-card: #ffffff;
            --text-main: #1e293b;
            --text-muted: #64748b;
            --primary: #1e5f38; /* Verde corporativo de CALFERQUIM */
            --primary-hover: #154528;
            --border: #e2e8f0;
            --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
            --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.05);
            --radius: 12px;
            --radius-input: 8px;
            --accent-green: #eaf5ee;
            --green-text: #1b4d31;
        }}

        * {{
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }}

        body {{
            font-family: 'Inter', sans-serif;
            background-color: var(--bg-main);
            color: var(--text-main);
            padding: 40px 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-height: 100vh;
        }}

        .container {{
            max-width: 1100px;
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 24px;
        }}

        header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid var(--border);
            padding-bottom: 16px;
            margin-bottom: 8px;
        }}

        .logo-section {{
            display: flex;
            flex-direction: column;
            gap: 4px;
        }}

        .logo-section h1 {{
            font-size: 24px;
            font-weight: 700;
            color: var(--primary);
            letter-spacing: -0.5px;
        }}

        .logo-section p {{
            font-size: 14px;
            color: var(--text-muted);
        }}

        .selector-box {{
            display: flex;
            align-items: center;
            gap: 12px;
            background-color: var(--bg-card);
            padding: 8px 16px;
            border-radius: var(--radius);
            border: 1px solid var(--border);
            box-shadow: var(--shadow);
            width: 100%;
            max-width: 450px;
        }}

        .selector-box label {{
            font-size: 14px;
            font-weight: 600;
            color: var(--text-muted);
            white-space: nowrap;
        }}

        .selector-box select {{
            width: 100%;
            padding: 8px 12px;
            border-radius: var(--radius-input);
            border: 1px solid var(--border);
            background-color: #f1f5f9;
            font-family: inherit;
            font-size: 14px;
            font-weight: 500;
            color: var(--text-main);
            outline: none;
            cursor: pointer;
            transition: all 0.2s;
        }}

        .selector-box select:focus {{
            border-color: var(--primary);
            background-color: #ffffff;
            box-shadow: 0 0 0 2px rgba(30, 95, 56, 0.15);
        }}

        .main-layout {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
        }}

        @media (max-width: 850px) {{
            .main-layout {{
                grid-template-columns: 1fr;
            }}
        }}

        .card {{
            background-color: var(--bg-card);
            border-radius: var(--radius);
            border: 1px solid var(--border);
            box-shadow: var(--shadow-lg);
            padding: 30px;
            display: flex;
            flex-direction: column;
            gap: 20px;
            height: fit-content;
        }}

        .card-title {{
            font-size: 18px;
            font-weight: 600;
            color: var(--primary);
            border-bottom: 1px solid var(--border);
            padding-bottom: 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }}

        .product-info-grid {{
            display: flex;
            flex-direction: column;
            gap: 16px;
        }}

        .info-row {{
            display: flex;
            flex-direction: column;
            gap: 4px;
        }}

        .info-label {{
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            color: var(--text-muted);
            letter-spacing: 0.5px;
        }}

        .info-value {{
            font-size: 15px;
            font-weight: 500;
            color: var(--text-main);
            background-color: #f8fafc;
            padding: 10px 14px;
            border-radius: var(--radius-input);
            border: 1px solid var(--border);
            line-height: 1.5;
        }}

        .info-badge {{
            align-self: flex-start;
            background-color: var(--accent-green);
            color: var(--green-text);
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }}

        /* Estilo del Formulario / Grid de Composición */
        .form-container {{
            background-color: var(--bg-card);
            border-radius: var(--radius);
            border: 1px solid var(--border);
            box-shadow: var(--shadow-lg);
            padding: 30px;
            display: flex;
            flex-direction: column;
            gap: 24px;
        }}

        .form-grid {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            column-gap: 20px;
            row-gap: 16px;
        }}

        .field-group {{
            display: flex;
            flex-direction: column;
            gap: 6px;
        }}

        .field-group label {{
            font-size: 12px;
            font-weight: 700;
            color: var(--text-muted);
            letter-spacing: 0.5px;
        }}

        .field-group input, .field-group select {{
            width: 100%;
            padding: 10px 14px;
            font-family: inherit;
            font-size: 14px;
            font-weight: 500;
            color: var(--text-main);
            border: 1px solid var(--border);
            border-radius: var(--radius-input);
            outline: none;
            background-color: #ffffff;
            transition: all 0.2s;
        }}

        .field-group input:focus, .field-group select:focus {{
            border-color: var(--primary);
            box-shadow: 0 0 0 2px rgba(30, 95, 56, 0.15);
        }}

        .field-group input::placeholder {{
            color: #cbd5e1;
        }}

        /* Cambios Recientes */
        .recent-changes-section {{
            margin-top: 10px;
            border-top: 1px solid var(--border);
            padding-top: 20px;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }}

        .recent-changes-title {{
            font-size: 15px;
            font-weight: 600;
            color: var(--text-main);
            display: flex;
            align-items: center;
            gap: 8px;
        }}

        .recent-changes-title svg {{
            width: 18px;
            height: 18px;
            stroke: var(--text-muted);
            fill: none;
        }}

        .changes-list {{
            background-color: #f8fafc;
            border: 1px solid var(--border);
            border-radius: var(--radius-input);
            max-height: 150px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
        }}

        .change-item {{
            padding: 10px 14px;
            border-bottom: 1px solid var(--border);
            font-size: 13px;
            display: flex;
            flex-direction: column;
            gap: 4px;
        }}

        .change-item:last-child {{
            border-bottom: none;
        }}

        .change-header {{
            display: flex;
            justify-content: space-between;
            font-weight: 600;
            color: var(--primary);
        }}

        .change-time {{
            font-size: 11px;
            color: var(--text-muted);
            font-weight: 400;
        }}

        .change-detail {{
            color: var(--text-muted);
        }}

        .no-changes {{
            padding: 16px;
            text-align: center;
            color: var(--text-muted);
            font-size: 13px;
            font-style: italic;
        }}
    </style>
</head>
<body>

<div class="container">
    <header>
        <div class="logo-section">
            <h1>SGC CALFERQUIM S.A.S.</h1>
            <p>Visor de Fichas de Composición y Registro Oficial ICA</p>
        </div>
        
        <div class="selector-box">
            <label for="product-selector">Seleccionar Producto:</label>
            <select id="product-selector">
                <!-- Se poblará dinámicamente -->
            </select>
        </div>
    </header>

    <div class="main-layout">
        <!-- Panel Izquierdo: Ficha de Registro e Información ICA -->
        <div class="card">
            <div class="card-title">
                <span>Información de Registro ICA</span>
                <span id="rvf-badge" class="info-badge">RVF: -</span>
            </div>
            
            <div class="product-info-grid">
                <div class="info-row">
                    <span class="info-label">Nombre Comercial</span>
                    <div id="info-name" class="info-value">-</div>
                </div>
                
                <div class="info-row">
                    <span class="info-label">Fecha de Vigencia Oficial</span>
                    <div id="info-date" class="info-value">-</div>
                </div>
                
                <div class="info-row">
                    <span class="info-label">Clasificación Regulada</span>
                    <div id="info-class" class="info-value">-</div>
                </div>

                <div class="info-row">
                    <span class="info-label">Límites Microbiológicos</span>
                    <div id="info-micro" class="info-value">-</div>
                </div>
                
                <div class="info-row">
                    <span class="info-label">Fuentes de Materias Primas</span>
                    <div id="info-sources" class="info-value">-</div>
                </div>

                <div class="info-row">
                    <span class="info-label">Aditivos e Inertes</span>
                    <div id="info-additives" class="info-value">-</div>
                </div>
            </div>
        </div>

        <!-- Panel Derecho: Formulario de Composición Garantizada -->
        <div class="form-container">
            <div class="card-title">
                <span>Composición Garantizada</span>
            </div>
            
            <form id="composition-form">
                <div class="form-grid">
                    <!-- Fila Clase y Estado Físico -->
                    <div class="field-group">
                        <label for="input-clase">CLASE</label>
                        <select id="input-clase">
                            <option value="PT - Producto terminado" selected>PT - Producto terminado</option>
                            <option value="MP - Materia prima">MP - Materia prima</option>
                        </select>
                    </div>
                    
                    <div class="field-group">
                        <label for="input-estado">ESTADO FISICO</label>
                        <select id="input-estado">
                            <option value="Polvo (P)">Polvo (P)</option>
                            <option value="Granulado (G)">Granulado (G)</option>
                            <option value="Líquido (L)">Líquido (L)</option>
                        </select>
                    </div>

                    <!-- Nutrientes y Parámetros -->
                    <div class="field-group">
                        <label for="input-c">C</label>
                        <input type="number" step="0.01" id="input-c" placeholder="—">
                    </div>
                    <div class="field-group">
                        <label for="input-n">N</label>
                        <input type="number" step="0.01" id="input-n" placeholder="—">
                    </div>

                    <div class="field-group">
                        <label for="input-n-nh4">N-NH4</label>
                        <input type="number" step="0.01" id="input-n-nh4" placeholder="—">
                    </div>
                    <div class="field-group">
                        <label for="input-n-no3">N-NO3</label>
                        <input type="number" step="0.01" id="input-n-no3" placeholder="—">
                    </div>

                    <div class="field-group">
                        <label for="input-n-org">N-ORG</label>
                        <input type="number" step="0.01" id="input-n-org" placeholder="—">
                    </div>
                    <div class="field-group">
                        <label for="input-n-ur">N-UR</label>
                        <input type="number" step="0.01" id="input-n-ur" placeholder="—">
                    </div>

                    <div class="field-group">
                        <label for="input-p">P</label>
                        <input type="number" step="0.01" id="input-p" placeholder="—">
                    </div>
                    <div class="field-group">
                        <label for="input-k">K</label>
                        <input type="number" step="0.01" id="input-k" placeholder="—">
                    </div>

                    <div class="field-group">
                        <label for="input-cao">CAO</label>
                        <input type="number" step="0.01" id="input-cao" placeholder="—">
                    </div>
                    <div class="field-group">
                        <label for="input-mgo">MGO</label>
                        <input type="number" step="0.01" id="input-mgo" placeholder="—">
                    </div>

                    <div class="field-group">
                        <label for="input-s">S</label>
                        <input type="number" step="0.01" id="input-s" placeholder="—">
                    </div>
                    <div class="field-group">
                        <label for="input-b">B</label>
                        <input type="number" step="0.0001" id="input-b" placeholder="—">
                    </div>

                    <div class="field-group">
                        <label for="input-co">CO</label>
                        <input type="number" step="0.0001" id="input-co" placeholder="—">
                    </div>
                    <div class="field-group">
                        <label for="input-cu">CU</label>
                        <input type="number" step="0.01" id="input-cu" placeholder="—">
                    </div>

                    <div class="field-group">
                        <label for="input-fe">FE</label>
                        <input type="number" step="0.01" id="input-fe" placeholder="—">
                    </div>
                    <div class="field-group">
                        <label for="input-mn">MN</label>
                        <input type="number" step="0.01" id="input-mn" placeholder="—">
                    </div>

                    <div class="field-group">
                        <label for="input-mo">MO</label>
                        <input type="number" step="0.0001" id="input-mo" placeholder="—">
                    </div>
                    <div class="field-group">
                        <label for="input-sio2">SIO2</label>
                        <input type="number" step="0.01" id="input-sio2" placeholder="—">
                    </div>

                    <div class="field-group">
                        <label for="input-zn">ZN</label>
                        <input type="number" step="0.01" id="input-zn" placeholder="—">
                    </div>
                    <div class="field-group">
                        <label for="input-na">NA</label>
                        <input type="number" step="0.01" id="input-na" placeholder="—">
                    </div>
                </div>
            </form>

            <!-- Historial de cambios locales (dinámico) -->
            <div class="recent-changes-section">
                <div class="recent-changes-title">
                    <svg viewBox="0 0 24 24" stroke-width="2">
                        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round"></path>
                    </svg>
                    <span>Cambios recientes</span>
                </div>
                <div class="changes-list" id="changes-log">
                    <div class="no-changes">No se han realizado cambios en esta sesión</div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
    // Datos de productos consolidados incrustados desde el CSV
    const productsData = {products_json};

    // Mapeo detallado de elementos a nombres de columna del CSV
    const elementMappings = {{
        'C': ['Carbono Orgánico Oxidable', 'Carbono Orgánico Oxidable Total'],
        'N': ['Nitrógeno Total (N)'],
        'N-NH4': ['Nitrógeno Amoniacal (N)'],
        'N-NO3': ['Nitrógeno Nítrico (N)'],
        'N-ORG': ['Nitrógeno Orgánico (N)'],
        'N-UR': ['Nitrógeno Ureico (N)'],
        'P': ['Fósforo Asimilable (P₂O₅)', 'Fósforo Total (P₂O₅)', 'Fósforo Soluble en Agua (P₂O₅)', 'Fósforo de Lenta Asimilación (P₂O₅)***'],
        'K': ['Potasio Soluble en Agua (K₂O)', 'Potasio Total (K₂O)'],
        'CAO': ['Calcio Total (CaO)', 'Calcio Total (CaO)*', 'Calcio Total (CaO)***', 'Calcio Soluble en Agua (CaO)', 'Calcio Soluble en Agua (CaO)***', 'Calcio Soluble en HCl (CaO)'],
        'MGO': ['Magnesio (MgO)', 'Magnesio Total (MgO)', 'Magnesio Total (MgO)*', 'Magnesio Soluble en Agua (MgO)', 'Magnesio Soluble en Agua (MgO)*', 'Magnesio Soluble en HCl (MgO)'],
        'S': ['Azufre (S)', 'Azufre Soluble en Agua (S)', 'Azufre Total (S)'],
        'B': ['Boro (B)', 'Boro Soluble en Agua (B)'],
        'CO': ['Cobalto Soluble en Agua (Co)', 'Cobalto Soluble en Agua (Co)*'],
        'CU': ['Cobre Total (Cu)', 'Cobre Soluble en Agua (Cu)', 'Cobre Soluble en Agua (Cu)*'],
        'FE': ['Hierro Soluble en Agua (Fe)', 'Hierro Soluble en Agua (Fe)*'],
        'MN': ['Manganeso Soluble en Agua (Mn)', 'Manganeso Soluble en Agua (Mn)*'],
        'MO': ['Molibdeno Soluble en Agua (Mo)'],
        'SIO2': ['Silicio', 'Silicio Total (SiO₂)', 'Silicio Total (SiO₂)*', 'Silicio Total (SiO₂)***', 'Silicio Soluble en Agua (SiO₂)', 'Silicio Soluble en Agua (SiO₂)***', 'Sílice Total (SiO₂)'],
        'ZN': ['Zinc (Zn)', 'Zinc Soluble en Agua (Zn)', 'Zinc Soluble en Agua (Zn)*'],
        'NA': ['Sodio (Na)', 'Sodio Total (Na)']
    }};

    // Elementos del DOM
    const selector = document.getElementById('product-selector');
    const infoName = document.getElementById('info-name');
    const infoDate = document.getElementById('info-date');
    const infoClass = document.getElementById('info-class');
    const infoMicro = document.getElementById('info-micro');
    const infoSources = document.getElementById('info-sources');
    const infoAdditives = document.getElementById('info-additives');
    const rvfBadge = document.getElementById('rvf-badge');
    const changesLog = document.getElementById('changes-log');

    // Inicializar selectores
    function init() {{
        // Cargar productos en el dropdown selector
        productsData.forEach((p, index) => {{
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `RVF ${{p.RVF}} - ${{p.Producto}}`;
            selector.appendChild(option);
        }});
        
        // Escuchar cambios
        selector.addEventListener('change', (e) => {{
            loadProduct(e.target.value);
        }});
        
        // Cargar el primero por defecto
        if (productsData.length > 0) {{
            loadProduct(0);
        }}
        
        // Registrar logs de cambios interactivos
        setupInputTracking();
    }}

    // Cargar información de un producto seleccionado
    function loadProduct(index) {{
        const p = productsData[index];
        
        // 1. Llenar tarjeta de registro
        infoName.textContent = p.Producto || '—';
        infoDate.textContent = p.Fecha_Vigencia || '—';
        infoClass.textContent = p.Clasificacion || '—';
        infoMicro.textContent = p.Limites_Microbiologicos || '—';
        infoSources.textContent = p.Fuentes || '—';
        infoAdditives.textContent = p.Aditivos_Inertes || '—';
        rvfBadge.textContent = `RVF: ${{p.RVF}}`;
        
        // 2. Determinar Estado Físico
        const clasLow = (p.Clasificacion || '').toLowerCase();
        const inputEstado = document.getElementById('input-estado');
        if (clasLow.includes('granulado')) {{
            inputEstado.value = 'Granulado (G)';
        }} else if (clasLow.includes('polvo') || clasLow.includes('soluble')) {{
            inputEstado.value = 'Polvo (P)';
        }} else if (clasLow.includes('líquido') || clasLow.includes('suspen')) {{
            inputEstado.value = 'Líquido (L)';
        }} else {{
            inputEstado.value = 'Polvo (P)'; // default
        }}
        
        // 3. Rellenar campos de la cuadrícula de nutrientes
        for (const [elementKey, csvCols] of Object.entries(elementMappings)) {{
            const inputId = `input-${{elementKey.toLowerCase()}}`;
            const inputEl = document.getElementById(inputId);
            
            if (inputEl) {{
                // Buscar si alguna de las columnas mapeadas del CSV tiene valor
                let val = '';
                for (const colName of csvCols) {{
                    if (p[colName] && p[colName].trim() !== '') {{
                        // Limpiar caracteres que no sean numéricos (como %)
                        val = p[colName].replace('%', '').trim();
                        break;
                    }}
                }}
                
                if (val !== '') {{
                    // Reemplazar coma por punto para inputs numéricos HTML
                    val = val.replace(',', '.');
                    inputEl.value = parseFloat(val);
                }} else {{
                    inputEl.value = '';
                }}
            }}
        }}
    }}

    // Seguimiento de cambios interactivos del formulario
    function setupInputTracking() {{
        const inputs = document.querySelectorAll('#composition-form input, #composition-form select');
        inputs.forEach(input => {{
            let oldValue = input.value;
            
            // Guardar valor anterior al enfocar
            input.addEventListener('focus', () => {{
                oldValue = input.value;
            }});
            
            // Registrar cambio al perder el foco o cambiar select
            input.addEventListener('change', () => {{
                const label = input.previousElementSibling.textContent;
                const newValue = input.value;
                
                if (oldValue !== newValue) {{
                    addChangeLog(label, oldValue || 'Vacio', newValue || 'Vacio');
                    oldValue = newValue;
                }}
            }});
        }});
    }}

    // Añadir entrada al registro de cambios recientes
    function addChangeLog(label, oldVal, newVal) {{
        // Limpiar mensaje "No se han realizado cambios"
        const noChanges = changesLog.querySelector('.no-changes');
        if (noChanges) {{
            changesLog.innerHTML = '';
        }}
        
        const timestamp = new Date().toLocaleTimeString('es-CO', {{ hour: '2-digit', minute: '2-digit', second: '2-digit' }});
        
        const item = document.createElement('div');
        item.className = 'change-item';
        item.innerHTML = `
            <div class="change-header">
                <span>${{label}}</span>
                <span class="change-time">${{timestamp}}</span>
            </div>
            <div class="change-detail">
                ${{oldVal}} &rarr; <strong>${{newVal}}</strong>
            </div>
        `;
        
        // Insertar al inicio de la lista de cambios
        changesLog.insertBefore(item, changesLog.firstChild);
    }}

    // Arrancar la aplicación
    window.onload = init;
</script>

</body>
</html>
"""
    
    # Escribir el visor HTML
    os.makedirs(os.path.dirname(html_out), exist_ok=True)
    with open(html_out, "w", encoding="utf-8") as f:
        f.write(html_content)
        
    print(f"Visor HTML interactivo creado con éxito en: {html_out}")

if __name__ == "__main__":
    build_html()
