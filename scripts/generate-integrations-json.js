import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { join, resolve, dirname, sep, relative } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, "..");

/**
 * Validates that the resolved path stays within the project root, then
 * reconstructs the final path by joining rootDir with only the relative
 * portion. This breaks Snyk's taint chain: the string that reaches fs calls
 * is derived from the hardcoded rootDir constant, not from user input.
 */
function assertWithinRoot(inputPath, label) {
  const absolutePath = resolve(inputPath);
  const normalRoot = rootDir.endsWith(sep) ? rootDir : rootDir + sep;

  if (absolutePath !== rootDir && !absolutePath.startsWith(normalRoot)) {
    throw new Error(
      `Path traversal detected for ${label}: resolved path is outside project root`,
    );
  }

  // Reconstruct from rootDir + relative segment so the returned value is
  // never tainted by the original user-supplied string.
  const rel = relative(rootDir, absolutePath);
  return join(rootDir, rel);
}

const args = process.argv.slice(2);
const defaultProductsDir = join(rootDir, "public", "ui");
const defaultOutputFile = join(rootDir, "public", "product-integrations.json");

let productsDir = defaultProductsDir;
let outputFile = defaultOutputFile;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--products-dir" && args[i + 1]) {
    productsDir = assertWithinRoot(args[++i], "--products-dir");
  } else if (args[i] === "--output" && args[i + 1]) {
    outputFile = assertWithinRoot(args[++i], "--output");
  }
}

if (!existsSync(productsDir)) {
  console.warn(
    `[generate-integrations-json] Products dir not found: ${productsDir}`,
  );
  console.warn(
    "[generate-integrations-json] Writing empty product-integrations.json",
  );
  writeFileSync(
    outputFile,
    JSON.stringify(
      { products: [], buildTime: new Date().toISOString() },
      null,
      2,
    ),
  );
  process.exit(0);
}

const products = [];
const dirs = readdirSync(productsDir, { withFileTypes: true });

for (const dir of dirs) {
  if (!dir.isDirectory()) continue;

  const manifestPath = assertWithinRoot(
    join(productsDir, dir.name, "product-manifest.json"),
    "manifestPath",
  );
  if (!existsSync(manifestPath)) {
    console.warn(
      `[generate-integrations-json] No manifest in ${dir.name}, skipping`,
    );
    continue;
  }

  try {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
    const remoteEntryPath = assertWithinRoot(
      join(productsDir, dir.name, "remoteEntry.js"),
      "remoteEntryPath",
    );
    const hasRemoteEntry = existsSync(remoteEntryPath);

    products.push({
      shortname: manifest.shortname,
      title: manifest.title,
      description: manifest.description,
      icon: manifest.icon || null,
      docs: manifest.docs || null,
      component: manifest.component,
      preview: `/ui/${manifest.shortname}/index.html`,
      hasRemoteEntry,
    });

    console.log(
      `[generate-integrations-json] Added: ${manifest.shortname} (remoteEntry: ${hasRemoteEntry})`,
    );
  } catch (err) {
    console.error(
      `[generate-integrations-json] Failed to read manifest from ${dir.name}:`,
      err.message,
    );
  }
}

const output = {
  products,
  buildTime: new Date().toISOString(),
};

writeFileSync(outputFile, JSON.stringify(output, null, 2));
console.log(
  `[generate-integrations-json] Generated ${outputFile} with ${products.length} product(s)`,
);
