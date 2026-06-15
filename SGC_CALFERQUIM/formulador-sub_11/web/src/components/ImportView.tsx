import React, { useState } from "react";
import { useQuery } from "../hooks/useConvex.ts";
import { api } from "../../convex/_generated/api";
import { calculateCompositionAndEvaluation, ComponentInput, Nutrients } from "../../convex/calculations.ts";

interface ImportViewProps {
  user: any;
  onImportSuccess: () => void;
}

interface ImportRow {
  productoObjetivoId: string; // internalId of target (e.g. PT0008)
  listaAlias: string;
  componenteId: string; // internalId of component (e.g. MP0001)
  cantidad: number;
  rowNum: number;
}

interface ParsedRecipe {
  targetId: string;
  targetName: string;
  targetNutrients: Nutrients | null;
  alias: string;
  totalKg: number;
  components: {
    internalId: string;
    producto: string;
    quantity: number;
    nutrients: Nutrients;
    isValid: boolean;
  }[];
  calculatedGrade: Nutrients;
  evaluationStatus: string;
  warnings: string[];
}

export default function ImportView({ user, onImportSuccess }: ImportViewProps) {
  const catalog = useQuery(api.catalog.getItems) || [];

  const [fileSelected, setFileSelected] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [recipes, setRecipes] = useState<ParsedRecipe[]>([]);
  const [globalErrors, setGlobalErrors] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileSelected(e.target.files[0]);
      setRecipes([]);
      setGlobalErrors([]);
    }
  };

  const handleParse = async () => {
    if (!fileSelected) return;
    setParsing(true);
    setGlobalErrors([]);
    setRecipes([]);

    try {
      const text = await fileSelected.text();
      const lines = text.split(/\r?\n/);
      if (lines.length < 2) {
        throw new Error("El archivo CSV no contiene suficientes líneas.");
      }

      // Detect separator
      const separator = lines[0].includes(";") ? ";" : ",";
      
      // Parse header
      const headers = lines[0].split(separator).map(h => h.trim().toLowerCase());
      
      const targetIdx = headers.indexOf("productoobjetivoid");
      const aliasIdx = headers.indexOf("listaalias");
      const componentIdx = headers.indexOf("componenteid");
      const quantityIdx = headers.indexOf("cantidad");

      if (targetIdx === -1 || aliasIdx === -1 || componentIdx === -1 || quantityIdx === -1) {
        throw new Error(
          `Formato de cabeceras inválido. Debe contener columnas: 'productoObjetivoId', 'listaAlias', 'componenteId', 'cantidad'. Separador detectado: '${separator}'`
        );
      }

      const parsedRows: ImportRow[] = [];
      const localErrors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const cells = line.split(separator).map(c => c.trim().replace(/^"|"$/g, ""));
        const rowNum = i + 1;

        const targetId = cells[targetIdx] || "";
        const alias = cells[aliasIdx] || "";
        const compId = cells[componentIdx] || "";
        const qtyStr = cells[quantityIdx] || "";

        if (!alias) {
          localErrors.push(`Fila ${rowNum}: El alias de la lista ('listaAlias') está vacío.`);
          continue;
        }

        if (!compId) {
          localErrors.push(`Fila ${rowNum}: El ID del componente ('componenteId') está vacío.`);
          continue;
        }

        const qtyClean = qtyStr.replace(",", ".");
        const quantity = parseFloat(qtyClean);
        if (isNaN(quantity)) {
          localErrors.push(`Fila ${rowNum}: La cantidad '${qtyStr}' no es numérica.`);
          continue;
        }

        parsedRows.push({
          productoObjetivoId: targetId.toUpperCase(),
          listaAlias: alias,
          componenteId: compId.toUpperCase(),
          cantidad: quantity,
          rowNum,
        });
      }

      if (localErrors.length > 0) {
        setGlobalErrors(localErrors);
        setParsing(false);
        return;
      }

      // Group rows by unique list identifier: targetProductId + listAlias
      const groups: Record<string, ImportRow[]> = {};
      parsedRows.forEach(row => {
        const key = `${row.productoObjetivoId || "BORRADOR"}_${row.listaAlias}`;
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(row);
      });

      // Process each group into a recipe preview
      const previewRecipes: ParsedRecipe[] = [];

      for (const [key, rows] of Object.entries(groups)) {
        const firstRow = rows[0];
        const targetId = firstRow.productoObjetivoId;
        const alias = firstRow.listaAlias;

        // Find target product in catalog
        const targetItem = catalog.find(item => item.internalId === targetId && item.class === "PT");
        const targetNutrients = targetItem ? targetItem.nutrients : null;
        const targetName = targetItem ? targetItem.producto : targetId ? `PT Desconocido (${targetId})` : "Borrador (Sin Objetivo)";

        const warnings: string[] = [];
        if (targetId && !targetItem) {
          warnings.push(`El producto objetivo '${targetId}' no se encuentra en el catálogo.`);
        }

        // Reconstruct components
        const recipeComponents = rows.map(r => {
          const catItem = catalog.find(item => item.internalId === r.componenteId);
          if (!catItem) {
            warnings.push(`El componente '${r.componenteId}' no existe en el catálogo.`);
          }
          
          return {
            internalId: r.componenteId,
            producto: catItem ? catItem.producto : `Desconocido (${r.componenteId})`,
            quantity: r.cantidad,
            nutrients: catItem ? catItem.nutrients : createEmptyNutrients(),
            isValid: !!catItem,
          };
        });

        // Run math calculation
        const inputs: ComponentInput[] = recipeComponents
          .filter(c => c.isValid)
          .map(c => ({
            internalId: c.internalId,
            producto: c.producto,
            quantity: c.quantity,
            nutrients: c.nutrients,
          }));

        const calc = calculateCompositionAndEvaluation(inputs, targetNutrients);
        
        // Add total weight warning if not 1000 kg
        if (Math.abs(calc.totalKg - 1000) > 0.01) {
          warnings.push(`El peso total de la mezcla es ${calc.totalKg} kg. Debe ser exactamente 1000 kg.`);
        }

        previewRecipes.push({
          targetId,
          targetName,
          targetNutrients,
          alias,
          totalKg: calc.totalKg,
          components: recipeComponents,
          calculatedGrade: calc.calculatedComposition,
          evaluationStatus: calc.evaluation.status,
          warnings,
        });
      }

      setRecipes(previewRecipes);
    } catch (e: any) {
      setGlobalErrors([e.message]);
    } finally {
      setParsing(false);
    }
  };

  return (
    <div>
      <div className="view-header">
        <div className="view-header-left">
          <h2 className="view-title">Importación de Recetas Batch</h2>
          <span className="badge">Modo Simulación (Sin Persistencia)</span>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Cargar Archivo de Recetas</div>
        <p style={{ fontSize: "var(--fs-sm)", color: "var(--text-secondary)", marginTop: 0 }}>
          Seleccione un archivo CSV para validar su estructura y previsualizar las recetas resultantes contra el catálogo activo.
        </p>

        <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "16px" }}>
          <input
            type="file"
            accept=".csv"
            className="form-input"
            style={{ display: "none" }}
            id="batch-csv-file"
            onChange={handleFileChange}
          />
          <label className="btn btn-secondary" htmlFor="batch-csv-file" style={{ cursor: "pointer" }}>
            📂 Seleccionar archivo CSV
          </label>
          <span style={{ fontSize: "var(--fs-sm)", color: "var(--text-secondary)" }}>
            {fileSelected ? fileSelected.name : "Ningún archivo seleccionado"}
          </span>

          {fileSelected && (
            <button className="btn btn-primary" onClick={handleParse} disabled={parsing}>
              {parsing ? "Procesando..." : "Validar y Previsualizar"}
            </button>
          )}
        </div>

        <div style={{ marginTop: "16px", padding: "12px", background: "var(--bg-base)", borderRadius: "var(--radius-sm)", border: "1px dashed var(--border)" }}>
          <strong style={{ fontSize: "var(--fs-xs)", textTransform: "uppercase", color: "var(--amber-400)" }}>
            Formato de columnas esperado:
          </strong>
          <code style={{ display: "block", marginTop: "6px", fontSize: "var(--fs-xs)", fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>
            productoObjetivoId;listaAlias;componenteId;cantidad
            <br />
            PT0008;Lote001;MP0001;600
            <br />
            PT0008;Lote001;MZR0002;400
          </code>
        </div>
      </div>

      {/* Parsing errors */}
      {globalErrors.length > 0 && (
        <div className="card" style={{ borderLeft: "4px solid var(--red-500)", background: "var(--red-muted)" }}>
          <h4 style={{ color: "var(--red-400)", margin: 0 }}>Errores de validación estructural</h4>
          <ul style={{ margin: "8px 0 0 0", paddingLeft: "16px", fontSize: "var(--fs-sm)", color: "var(--text-secondary)" }}>
            {globalErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Preview results */}
      {recipes.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "20px" }}>
          <h3>Previsualización de recetas ({recipes.length})</h3>
          
          {recipes.map((recipe, idx) => (
            <div key={idx} className="card" style={{ borderLeft: recipe.warnings.length > 0 ? "4px solid var(--amber-500)" : "4px solid var(--green-400)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", borderBottom: "1px solid var(--border)", paddingBottom: "10px", marginBottom: "12px" }}>
                <div>
                  <h4 style={{ margin: 0 }}>
                    {recipe.targetName} — <span style={{ color: "var(--green-400)" }}>{recipe.alias}</span>
                  </h4>
                  <span style={{ fontSize: "var(--fs-xs)", color: "var(--text-secondary)" }}>
                    Peso total: <strong>{recipe.totalKg} kg</strong>
                  </span>
                </div>
                
                <div style={{ textAlign: "right" }}>
                  <span className="badge" style={{
                    backgroundColor: recipe.evaluationStatus === "CUMPLE" ? "var(--green-950)"
                      : recipe.evaluationStatus === "CUMPLE_S" ? "var(--green-900)"
                      : recipe.evaluationStatus === "NO_CUMPLE" ? "var(--red-muted)"
                      : "var(--bg-elevated)",
                    color: recipe.evaluationStatus === "CUMPLE" ? "var(--green-400)"
                      : recipe.evaluationStatus === "CUMPLE_S" ? "var(--amber-400)"
                      : recipe.evaluationStatus === "NO_CUMPLE" ? "var(--red-400)"
                      : "var(--text-secondary)"
                  }}>
                    {recipe.evaluationStatus}
                  </span>
                </div>
              </div>

              {recipe.warnings.length > 0 && (
                <div style={{ fontSize: "var(--fs-xs)", color: "var(--amber-400)", background: "rgba(245,158,11,0.05)", padding: "8px 12px", borderRadius: "var(--radius-xs)", marginBottom: "12px" }}>
                  <strong>Advertencias de receta:</strong>
                  <ul style={{ margin: "4px 0 0 0", paddingLeft: "16px" }}>
                    {recipe.warnings.map((w, wIdx) => (
                      <li key={wIdx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                {/* Ingredients list */}
                <div>
                  <h5 style={{ margin: "0 0 6px 0", fontSize: "var(--fs-xs)", color: "var(--text-secondary)", textTransform: "uppercase" }}>
                    Ingredientes
                  </h5>
                  <table style={{ width: "100%", fontSize: "var(--fs-xs)" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left" }}>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th style={{ textAlign: "right" }}>Peso</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recipe.components.map((c, cIdx) => (
                        <tr key={cIdx} style={{ color: c.isValid ? "var(--text-primary)" : "var(--red-400)" }}>
                          <td style={{ fontFamily: "var(--font-mono)" }}>{c.internalId}</td>
                          <td>{c.producto}</td>
                          <td style={{ textAlign: "right" }}>{c.quantity} kg</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Grade list */}
                <div>
                  <h5 style={{ margin: "0 0 6px 0", fontSize: "var(--fs-xs)", color: "var(--text-secondary)", textTransform: "uppercase" }}>
                    Grado Resultante
                  </h5>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                    {["N", "P", "K", "CaO", "MgO", "S"].map(nut => (
                      <div key={nut} style={{ padding: "6px", background: "var(--bg-base)", borderRadius: "var(--radius-xs)", textAlign: "center" }}>
                        <div style={{ fontSize: "var(--fs-2xs)", color: "var(--text-secondary)" }}>{nut}</div>
                        <strong style={{ fontSize: "var(--fs-sm)" }}>
                          {recipe.calculatedGrade[nut as keyof Nutrients]?.toFixed(2)}%
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function createEmptyNutrients(): Nutrients {
  const keys = [
    "C", "N", "N_NH4", "N_NO3", "N_org", "N_ur", "P", "K", "CaO", "MgO", 
    "S", "B", "Co", "Cu", "Fe", "Mn", "Mo", "SiO2", "Zn", "Na"
  ] as const;
  const nutrients = {} as Nutrients;
  for (const k of keys) {
    nutrients[k] = 0;
  }
  return nutrients;
}
