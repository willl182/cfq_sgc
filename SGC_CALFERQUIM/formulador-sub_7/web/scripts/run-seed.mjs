import { readFileSync } from "fs";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const csvPath = path.resolve(__dirname, "../../insumos_ref/mp-pt_mzr.csv");
const csvText = readFileSync(csvPath, "utf-8");
const args = JSON.stringify({ csvText, actor: "admin-local" });
const cmd = `pnpm exec convex run seed:seedFromCsv '${args.replace(/'/g, "'\"'\"'")}'`;
console.log("Ejecutando seed...");
try {
  const result = execSync(cmd, { cwd: path.resolve(__dirname, ".."), encoding: "utf-8", shell: "/bin/bash" });
  console.log(result);
} catch (e) {
  console.error((e).stderr || (e).stdout || (e).message);
  process.exit(1);
}
