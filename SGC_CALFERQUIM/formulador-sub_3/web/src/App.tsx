import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import CatalogPage from "./pages/CatalogPage";
import FormulatePage from "./pages/FormulatePage";
import SnapshotsPage from "./pages/SnapshotsPage";
import AdminPage from "./pages/AdminPage";
import ImportPage from "./pages/ImportPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/catalogo" element={<CatalogPage />} />
          <Route path="/formular" element={<FormulatePage />} />
          <Route path="/historico" element={<SnapshotsPage />} />
          <Route path="/importar" element={<ImportPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
