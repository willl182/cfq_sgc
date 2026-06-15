import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Upload, CheckCircle, AlertCircle, FileText } from "lucide-react";
import { parseCSV } from "../lib/csv-parser";

export default function Admin() {
  const [csvContent, setCsvContent] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  const seedMutation = useMutation(api.seed.loadFromCSV);
  const isEmptyMutation = useMutation(api.seed.isEmpty);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvContent(content);
      setResult(null);
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!csvContent) {
      alert("Selecciona un archivo CSV primero");
      return;
    }

    setIsUploading(true);
    setResult(null);

    try {
      // Verificar si el catálogo está vacío
      const isEmpty = await isEmptyMutation({});
      if (!isEmpty) {
        setResult({
          success: false,
          message: "El catálogo ya tiene datos. No se puede ejecutar la carga inicial.",
        });
        setIsUploading(false);
        return;
      }

      // Parsear CSV
      const parseResult = parseCSV(csvContent);

      if (parseResult.errors.length > 0) {
        setResult({
          success: false,
          message: `Errores al parsear CSV: ${parseResult.errors.join(", ")}`,
          details: parseResult,
        });
        setIsUploading(false);
        return;
      }

      if (parseResult.rows.length === 0) {
        setResult({
          success: false,
          message: "No se encontraron filas válidas en el CSV",
        });
        setIsUploading(false);
        return;
      }

      // Cargar datos
      const seedResult = await seedMutation({ rows: parseResult.rows });

      setResult({
        success: true,
        message: `Carga completada exitosamente`,
        details: seedResult,
      });

      // Limpiar formulario
      setCsvContent("");
      setFileName("");
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : String(error)}`,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Administración</h1>
        <p className="mt-2 text-gray-600">
          Carga inicial de datos del catálogo
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Cargar CSV Inicial
        </h2>

        <div className="space-y-4">
          {/* File Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Archivo CSV
            </label>
            <div className="flex items-center gap-3">
              <label className="flex-1 cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {fileName || "Haz clic para seleccionar un archivo CSV"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Formato: COD;PRODUCTO;CLASE;TIPO;...
                  </p>
                </div>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!csvContent || isUploading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Cargando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Cargar Datos
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div
          className={`rounded-lg shadow p-6 border ${
            result.success
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex items-start">
            {result.success ? (
              <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
            ) : (
              <AlertCircle className="h-6 w-6 text-red-600 mt-0.5" />
            )}
            <div className="ml-3 flex-1">
              <h3
                className={`text-sm font-medium ${
                  result.success ? "text-green-800" : "text-red-800"
                }`}
              >
                {result.message}
              </h3>

              {result.details && (
                <div className="mt-4 space-y-3">
                  {/* Summary */}
                  {result.details.summary && (
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Resumen de Importación
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Total</p>
                          <p className="font-bold text-gray-900">
                            {result.details.summary.total || result.details.summary.mp + result.details.summary.pt + result.details.summary.mzr}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Materias Primas</p>
                          <p className="font-bold text-blue-600">
                            {result.details.summary.mp}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Productos Terminados</p>
                          <p className="font-bold text-green-600">
                            {result.details.summary.pt}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Mezclas (MZR)</p>
                          <p className="font-bold text-purple-600">
                            {result.details.summary.mzr}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Inserted */}
                  {result.details.inserted !== undefined && (
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Items insertados</span>
                        <span className="text-lg font-bold text-green-600">
                          {result.details.inserted}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Errors */}
                  {result.details.errors > 0 && (
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Errores</span>
                        <span className="text-lg font-bold text-red-600">
                          {result.details.errors}
                        </span>
                      </div>
                      {result.details.errorDetails && result.details.errorDetails.length > 0 && (
                        <div className="mt-2 max-h-32 overflow-y-auto">
                          <ul className="text-xs text-red-700 space-y-1">
                            {result.details.errorDetails.map((error: string, i: number) => (
                              <li key={i} className="flex items-start">
                                <FileText className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                                {error}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Instrucciones</h3>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>El CSV debe tener el formato: COD;PRODUCTO;CLASE;TIPO;Test;C;N;N-NH4;...</li>
          <li>Separador: punto y coma (;)</li>
          <li>La carga solo funciona si el catálogo está vacío</li>
          <li>Los IDs se asignan automáticamente: MP0001, PT0001, MZR0001</li>
          <li>Los productos con COD = "R", "R1", "R2" se clasifican como MZR</li>
        </ul>
      </div>
    </div>
  );
}
