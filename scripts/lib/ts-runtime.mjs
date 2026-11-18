/**
 * Lets maintenance scripts import the app's TypeScript modules (e.g. lib/db/models) with
 * Node's built-in type stripping (Node >= 22.6; run with --experimental-strip-types).
 *
 *   node --env-file=.env --experimental-strip-types --import ./scripts/lib/ts-runtime.mjs scripts/x.mjs
 *
 * The resolve hook:
 *  - turns `import "server-only"` into an empty module (outside Next.js there is no client
 *    bundle to protect; the guard still applies inside the app);
 *  - maps the "@/..." path alias to the project root;
 *  - adds the .ts / .tsx / index.ts extension to extensionless relative imports.
 */

import { register } from "node:module";

const hooks = `
import { existsSync, statSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
const ROOT = ${JSON.stringify(process.cwd())};
const probe = (base) => {
  for (const c of [base, base + ".ts", base + ".tsx", path.join(base, "index.ts")]) {
    if (existsSync(c) && statSync(c).isFile()) return pathToFileURL(c).href;
  }
  return null;
};
export async function resolve(specifier, context, next) {
  if (specifier === "server-only") return { url: "data:text/javascript,export{}", shortCircuit: true };
  if (specifier.startsWith("@/")) {
    const url = probe(path.join(ROOT, specifier.slice(2)));
    if (url) return { url, shortCircuit: true };
  }
  if ((specifier.startsWith("./") || specifier.startsWith("../")) && context.parentURL?.startsWith("file:") && !path.extname(specifier)) {
    const url = probe(path.resolve(path.dirname(fileURLToPath(context.parentURL)), specifier));
    if (url) return { url, shortCircuit: true };
  }
  return next(specifier, context);
}
`;

register(`data:text/javascript,${encodeURIComponent(hooks)}`);
