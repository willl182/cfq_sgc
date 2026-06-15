import { useState, useEffect } from "react";
import { useQuery as useConvexQuery, useMutation as useConvexMutation } from "convex/react";
import { calculateCompositionAndEvaluation, ComponentInput, Nutrients } from "../../convex/calculations";

const MOCK_UPDATE_EVENT = "convex-mock-update";

// Helper to notify all query hooks to re-fetch from localStorage
function notifyMockUpdate() {
  window.dispatchEvent(new Event(MOCK_UPDATE_EVENT));
}

// Check if Convex server is offline (by checking if WebSocket failed)
// For simplicity, we can default to offline if no connection, or let the user choose.
// We will auto-detect: if we can't connect, we fallback to localStorage.
// We will store a flag "use_offline_db" in localStorage which defaults to true if Convex fails.
let isConvexConnected = false;

// We will let the client toggle offline mode
export function setOfflineMode(offline: boolean) {
  localStorage.setItem("use_offline_db", offline ? "true" : "false");
  notifyMockUpdate();
}

export function getOfflineMode(): boolean {
  const saved = localStorage.getItem("use_offline_db");
  if (saved === "false") return false;
  return true; // Default to offline database so it works instantly without Convex Cloud
}

// ── LOCAL STORAGE DATABASE SIMULATION ───────────────────────────
const DB = {
  get(table: string): any[] {
    const data = localStorage.getItem(`convex_mock_${table}`);
    return data ? JSON.parse(data) : [];
  },
  set(table: string, data: any[]) {
    localStorage.setItem(`convex_mock_${table}`, JSON.stringify(data));
  }
};

const NUTRIENT_KEYS = [
  "C", "N", "N_NH4", "N_NO3", "N_org", "N_ur", "P", "K", "CaO", "MgO", 
  "S", "B", "Co", "Cu", "Fe", "Mn", "Mo", "SiO2", "Zn", "Na"
] as const;

function parseDecimal(val: string): number {
  if (!val) return 0;
  const clean = val.trim().replace(/\s/g, "").replace(",", ".");
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}

function isMZRCode(code: string): boolean {
  const clean = code.trim().toUpperCase();
  return clean === "R" || /^R\d+$/.test(clean);
}

const localMutations: Record<string, (args: any) => any> = {
  "catalog:seedCatalog": (args: { csvText: string }) => {
    const existing = DB.get("catalogItems");
    if (existing.length > 0) {
      throw new Error("El catálogo ya contiene elementos.");
    }

    const report = {
      readCount: 0,
      insertedCount: 0,
      rejectedCount: 0,
      rejectedRows: [] as any[],
    };

    const rawLines = args.csvText.split(/\r?\n/);
    if (rawLines.length < 2) throw new Error("CSV muy corto.");

    const headerLine = rawLines[0];
    const separator = headerLine.includes(";") ? ";" : ",";
    const cellsSplit = (line: string) => {
      const res: string[] = [];
      let cur = "";
      let inQ = false;
      let i = 0;
      while (i < line.length) {
        const char = line[i];
        if (inQ) {
          if (char === '"') {
            if (i + 1 < line.length && line[i + 1] === '"') {
              cur += '"'; i += 2;
            } else {
              inQ = false; i++;
            }
          } else {
            cur += char; i++;
          }
        } else {
          if (char === '"') {
            inQ = true; i++;
          } else if (char === separator) {
            res.push(cur); cur = ""; i++;
          } else {
            cur += char; i++;
          }
        }
      }
      res.push(cur);
      return res;
    };

    const headers = cellsSplit(headerLine).map(h => h.trim().toUpperCase());
    const codIdx = headers.indexOf("COD");
    const nameIdx = headers.indexOf("PRODUCTO");
    const classIdx = headers.indexOf("CLASE");
    const typeIdx = headers.indexOf("TIPO");
    const provIdx = headers.indexOf("PROVEEDOR");

    if (codIdx === -1 || nameIdx === -1 || classIdx === -1) {
      throw new Error("CSV inválido.");
    }

    const items: any[] = [];
    let mpCounter = 1, ptCounter = 1, mzrCounter = 1;

    for (let r = 1; r < rawLines.length; r++) {
      const line = rawLines[r].trim();
      if (!line) continue;
      report.readCount++;
      const cells = cellsSplit(line);

      const cod = (cells[codIdx] || "").trim();
      const name = (cells[nameIdx] || "").trim();
      const cls = (cells[classIdx] || "").trim().toUpperCase();
      const type = typeIdx !== -1 ? (cells[typeIdx] || "").trim().toUpperCase() : "G";
      const provider = provIdx !== -1 ? (cells[provIdx] || "").trim() : "";

      if (!name) {
        report.rejectedCount++;
        report.rejectedRows.push({ row: r + 1, reason: "Nombre vacío" });
        continue;
      }
      if (!cod) {
        report.rejectedCount++;
        report.rejectedRows.push({ row: r + 1, reason: "Código vacío", name });
        continue;
      }

      let finalClass: "MP" | "PT" | "MZR" = "MP";
      if (cls === "MP") finalClass = "MP";
      else if (cls === "PT") {
        finalClass = isMZRCode(cod) ? "MZR" : "PT";
      }

      let internalId = "";
      if (finalClass === "MP") internalId = `MP${String(mpCounter++).padStart(4, "0")}`;
      else if (finalClass === "PT") internalId = `PT${String(ptCounter++).padStart(4, "0")}`;
      else internalId = `MZR${String(mzrCounter++).padStart(4, "0")}`;

      const nutrients: any = {};
      let hasError = false;
      for (const k of NUTRIENT_KEYS) {
        const csvCol = k.replace("_", "-");
        let idx = headers.indexOf(csvCol);
        if (idx === -1) idx = headers.indexOf(k);

        if (idx === -1 || idx >= cells.length) {
          nutrients[k] = 0;
        } else {
          const val = cells[idx].trim();
          if (val) {
            const parsed = parseDecimal(val);
            if (isNaN(parsed)) {
              hasError = true;
              break;
            }
            nutrients[k] = parsed;
          } else {
            nutrients[k] = 0;
          }
        }
      }

      if (hasError) {
        report.rejectedCount++;
        report.rejectedRows.push({ row: r + 1, reason: "Nutrientes inválidos", name });
        continue;
      }

      items.push({
        _id: `mock_item_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        internalId,
        class: finalClass,
        externalCode: cod,
        originalCode: cod,
        producto: name,
        tipo: type || "G",
        nutrients,
        archivedAt: null,
        provider,
        origen: "BASE_CSV",
      });
      report.insertedCount++;
    }

    DB.set("catalogItems", items);
    return report;
  },

  "catalog:updateItem": (args: any) => {
    const items = DB.get("catalogItems");
    const idx = items.findIndex(i => i._id === args.id);
    if (idx === -1) throw new Error("No encontrado");

    const item = items[idx];
    const before = { ...item };
    const fieldsChanged: string[] = [];

    const fields = ["producto", "tipo", "provider", "nutrients"];
    fields.forEach(f => {
      if (args[f] !== undefined && JSON.stringify(item[f]) !== JSON.stringify(args[f])) {
        fieldsChanged.push(f);
        item[f] = args[f];
      }
    });

    if (fieldsChanged.length > 0) {
      items[idx] = item;
      DB.set("catalogItems", items);

      // Audit Log
      const history = DB.get("catalogChangeHistory");
      history.unshift({
        _id: `log_${Date.now()}`,
        catalogItemId: args.id,
        internalId: item.internalId,
        changedAt: Date.now(),
        actor: args.actor,
        fields: fieldsChanged,
        before,
        after: item,
        reason: args.reason,
        origin: "WEB"
      });
      DB.set("catalogChangeHistory", history);
    }
    return item;
  },

  "catalog:archiveItem": (args: any) => {
    const items = DB.get("catalogItems");
    const idx = items.findIndex(i => i._id === args.id);
    if (idx === -1) throw new Error("No encontrado");

    const item = items[idx];
    item.archivedAt = Date.now();
    items[idx] = item;
    DB.set("catalogItems", items);

    // Warning lists check
    const activeLists = DB.get("productLists").filter(l => l.archivedAt === null);
    const usages = activeLists.filter((l: any) => l.components.some((c: any) => c.catalogItemId === args.id));
    const warning = usages.length > 0 
      ? `Elemento archivado, usado en ${usages.length} listas activas: ${usages.map((u: any) => u.displayCode).join(", ")}.`
      : undefined;

    return { success: true, warning };
  },

  "catalog:deleteItem": (args: any) => {
    let items = DB.get("catalogItems");
    items = items.filter(i => i._id !== args.id);
    DB.set("catalogItems", items);
    return { success: true };
  },

  "lists:saveList": (args: any) => {
    const catalog = DB.get("catalogItems");
    const resolvedComponents: ComponentInput[] = [];
    const dbComponents: any[] = [];

    for (const comp of args.components) {
      const item = catalog.find(i => i._id === comp.catalogItemId);
      if (!item) throw new Error("Componente no encontrado.");
      resolvedComponents.push({
        internalId: item.internalId,
        producto: item.producto,
        quantity: comp.quantity,
        nutrients: item.nutrients,
      });
      dbComponents.push({
        catalogItemId: comp.catalogItemId,
        internalId: item.internalId,
        quantity: comp.quantity,
      });
    }

    let targetNutrients: Nutrients | null = null;
    let targetInternalId = "";
    if (args.targetProductId) {
      const target = catalog.find(i => i._id === args.targetProductId);
      if (target) {
        targetNutrients = target.nutrients;
        targetInternalId = target.internalId;
      }
    }

    const calc = calculateCompositionAndEvaluation(resolvedComponents, targetNutrients);

    let listId = args.id;
    let displayCode = "";
    let version = 1;
    const lists = DB.get("productLists");

    if (listId) {
      const idx = lists.findIndex(l => l._id === listId);
      if (idx === -1) throw new Error("No encontrado");
      const existing = lists[idx];
      displayCode = existing.displayCode;
      
      existing.targetProductId = args.targetProductId;
      existing.name = args.name;
      existing.components = dbComponents;
      existing.updatedAt = Date.now();
      lists[idx] = existing;
      DB.set("productLists", lists);

      const snapshots = DB.get("productListSnapshots").filter(s => s.productListId === listId);
      version = snapshots.length + 1;
    } else {
      listId = `mock_list_${Date.now()}`;
      let prefix = targetInternalId || "BORRADOR";
      const count = lists.filter((l: any) => {
        if (args.targetProductId) return l.targetProductId === args.targetProductId;
        return l.targetProductId === null;
      }).length;
      displayCode = `${prefix}-L${String(count + 1).padStart(3, "0")}`;

      lists.push({
        _id: listId,
        targetProductId: args.targetProductId,
        displayCode,
        name: args.name,
        components: dbComponents,
        archivedAt: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      DB.set("productLists", lists);
    }

    // Freeze snapshot
    const snapshots = DB.get("productListSnapshots");
    snapshots.unshift({
      _id: `snap_${Date.now()}`,
      productListId: listId,
      targetProductId: args.targetProductId,
      snapshotVersion: version,
      totalKg: calc.totalKg,
      components: resolvedComponents.map((c, idx) => ({
        catalogItemId: dbComponents[idx].catalogItemId,
        internalId: c.internalId,
        producto: c.producto,
        quantity: c.quantity,
        nutrients: c.nutrients,
      })),
      calculatedComposition: calc.calculatedComposition,
      evaluation: {
        status: calc.evaluation.status,
        nutrientStatuses: calc.evaluation.nutrientStatuses,
      },
      alerts: calc.alerts,
      user: args.actor,
      createdAt: Date.now(),
    });
    DB.set("productListSnapshots", snapshots);

    return { listId, displayCode, version };
  },

  "lists:archiveList": (args: any) => {
    const lists = DB.get("productLists");
    const idx = lists.findIndex(l => l._id === args.id);
    if (idx === -1) throw new Error("No encontrado");
    lists[idx].archivedAt = Date.now();
    DB.set("productLists", lists);
    return { success: true };
  },

  "lists:deleteList": (args: any) => {
    let lists = DB.get("productLists");
    lists = lists.filter(l => l._id !== args.id);
    DB.set("productLists", lists);

    let snapshots = DB.get("productListSnapshots");
    snapshots = snapshots.filter(s => s.productListId !== args.id);
    DB.set("productListSnapshots", snapshots);
    return { success: true };
  }
};

const localQueries: Record<string, (args: any) => any> = {
  "catalog:getItems": (args: { includeArchived?: boolean }) => {
    const items = DB.get("catalogItems");
    if (!args.includeArchived) {
      return items.filter(i => i.archivedAt === null);
    }
    return items;
  },

  "catalog:getHistory": (args: { catalogItemId?: string; limit?: number }) => {
    let logs = DB.get("catalogChangeHistory");
    if (args.catalogItemId) {
      logs = logs.filter(l => l.catalogItemId === args.catalogItemId);
    }
    if (args.limit) {
      logs = logs.slice(0, args.limit);
    }
    return logs;
  },

  "lists:getLists": () => {
    const lists = DB.get("productLists").filter(l => l.archivedAt === null);
    const catalog = DB.get("catalogItems");

    return lists.map(list => {
      let targetProductInternalId = "";
      let targetProductName = "";
      let targetNutrients: Nutrients | null = null;

      if (list.targetProductId) {
        const target = catalog.find(i => i._id === list.targetProductId);
        if (target) {
          targetProductInternalId = target.internalId;
          targetProductName = target.producto;
          targetNutrients = target.nutrients;
        }
      }

      const resolved: ComponentInput[] = list.components.map((c: any) => {
        const item = catalog.find(i => i._id === c.catalogItemId);
        return {
          internalId: item?.internalId || c.internalId,
          producto: item?.producto || "Eliminado",
          quantity: c.quantity,
          nutrients: item?.nutrients || {} as any,
        };
      });

      const calc = calculateCompositionAndEvaluation(resolved, targetNutrients);

      return {
        ...list,
        targetProductInternalId,
        targetProductName,
        liveComposition: calc.calculatedComposition,
        liveEvaluation: calc.evaluation,
        liveTotalKg: calc.totalKg,
        liveAlerts: calc.alerts,
        hasMissingComponent: resolved.some(r => r.producto === "Eliminado"),
      };
    });
  },

  "lists:getList": (args: { id: string }) => {
    const lists = DB.get("productLists");
    const list = lists.find(l => l._id === args.id);
    if (!list) return null;

    const catalog = DB.get("catalogItems");
    let targetProductInternalId = "";
    let targetProductName = "";
    let targetNutrients: Nutrients | null = null;

    if (list.targetProductId) {
      const target = catalog.find(i => i._id === list.targetProductId);
      if (target) {
        targetProductInternalId = target.internalId;
        targetProductName = target.producto;
        targetNutrients = target.nutrients;
      }
    }

    const resolvedComponents = list.components.map((c: any) => {
      const item = catalog.find(i => i._id === c.catalogItemId);
      return {
        catalogItemId: c.catalogItemId,
        internalId: item?.internalId || c.internalId,
        producto: item?.producto || "Eliminado",
        quantity: c.quantity,
        nutrients: item?.nutrients || {} as any,
        isArchived: item ? item.archivedAt !== null : false,
      };
    });

    const calc = calculateCompositionAndEvaluation(
      resolvedComponents.map((c: any) => ({
        internalId: c.internalId,
        producto: c.producto,
        quantity: c.quantity,
        nutrients: c.nutrients,
      })),
      targetNutrients
    );

    return {
      ...list,
      targetProductInternalId,
      targetProductName,
      targetNutrients,
      resolvedComponents,
      liveComposition: calc.calculatedComposition,
      liveEvaluation: calc.evaluation,
      liveTotalKg: calc.totalKg,
      liveAlerts: calc.alerts,
    };
  },

  "lists:getSnapshots": (args: { productListId?: string; targetProductId?: string }) => {
    let snaps = DB.get("productListSnapshots");
    if (args.productListId) {
      snaps = snaps.filter(s => s.productListId === args.productListId);
    }
    if (args.targetProductId) {
      snaps = snaps.filter(s => s.targetProductId === args.targetProductId);
    }
    return snaps;
  },

  "lists:getSnapshot": (args: { id: string }) => {
    const snaps = DB.get("productListSnapshots");
    return snaps.find(s => s._id === args.id) || null;
  }
};

// ── CUSTOM REACT HOOKS WRAPPERS ────────────────────────────────
export function useQuery(apiFunction: any, args?: any) {
  const isOffline = getOfflineMode();
  
  // Real Convex query hook (run unconditionally inside React to obey hook rules, but we ignore output if offline)
  const convexResult = useConvexQuery(apiFunction, isOffline ? "skip" : args || {});

  // Local storage query state
  const [localResult, setLocalResult] = useState<any>(undefined);

  // Retrieve function path string (e.g. catalog:getItems)
  const functionPath = apiFunction._path || (apiFunction.toString && apiFunction.toString()) || "";

  const loadLocalData = () => {
    if (!isOffline) return;
    const queryFn = localQueries[functionPath];
    if (queryFn) {
      try {
        setLocalResult(queryFn(args || {}));
      } catch (e) {
        console.error("Mock query error:", e);
      }
    }
  };

  useEffect(() => {
    loadLocalData();

    // Listen to updates
    window.addEventListener(MOCK_UPDATE_EVENT, loadLocalData);
    return () => {
      window.removeEventListener(MOCK_UPDATE_EVENT, loadLocalData);
    };
  }, [functionPath, JSON.stringify(args), isOffline]);

  return isOffline ? localResult : convexResult;
}

export function useMutation(apiFunction: any) {
  const isOffline = getOfflineMode();
  
  // Real Convex mutation hook (unconditional to satisfy hook rules)
  const convexMutate = useConvexMutation(apiFunction);

  const functionPath = apiFunction._path || (apiFunction.toString && apiFunction.toString()) || "";

  const localMutate = async (args: any) => {
    const mutateFn = localMutations[functionPath];
    if (!mutateFn) {
      throw new Error(`Mock mutation ${functionPath} no definida.`);
    }
    // Artificial small latency for realistic UI state changes
    await new Promise(resolve => setTimeout(resolve, 300));
    const res = mutateFn(args);
    notifyMockUpdate();
    return res;
  };

  return isOffline ? localMutate : convexMutate;
}
