import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Catalog from "./pages/Catalog";
import Formulador from "./pages/Formulador";
import History from "./pages/History";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="catalog" element={<Catalog />} />
        <Route path="formulador" element={<Formulador />} />
        <Route path="history" element={<History />} />
        <Route path="admin" element={<Admin />} />
      </Route>
    </Routes>
  );
}
