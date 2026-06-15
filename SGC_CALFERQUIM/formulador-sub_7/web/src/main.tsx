import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

const root = document.getElementById("root");
if (!root) {
  document.body.innerHTML = "<div style='color:red;padding:20px'>ERROR: no div#root</div>";
} else {
  createRoot(root).render(
    <StrictMode>
      <div style={{ padding: 20, background: "red", color: "white" }}>
        REACT FUNCIONA
      </div>
    </StrictMode>
  );
}
