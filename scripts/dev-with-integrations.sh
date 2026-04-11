#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
UIV2_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
WORKSPACE_ROOT="$(cd "$UIV2_DIR/.." && pwd)"

declare -A ALL_PRODUCTS=(
  ["tak"]="takintegration/ui"
  ["mtx"]="mtxauthz/ui"
)

SKIP_BUILD=false
PREVIEW_MODE=false
SELECTED_PRODUCTS=""
PORT=4173

while [[ $# -gt 0 ]]; do
  case $1 in
    --products)    SELECTED_PRODUCTS="$2"; shift 2 ;;
    --skip-build)  SKIP_BUILD=true; shift ;;
    --preview)     PREVIEW_MODE=true; shift ;;
    --port)        PORT="$2"; shift 2 ;;
    *)             echo "Unknown option: $1"; echo "Run with no args for defaults."; exit 1 ;;
  esac
done

# Resolve which products to build
declare -A PRODUCT_MAP
if [ -z "$SELECTED_PRODUCTS" ]; then
  for k in "${!ALL_PRODUCTS[@]}"; do PRODUCT_MAP["$k"]="${ALL_PRODUCTS[$k]}"; done
else
  IFS=',' read -ra requested <<< "$SELECTED_PRODUCTS"
  for shortname in "${requested[@]}"; do
    shortname="${shortname// /}"
    if [ -n "${ALL_PRODUCTS[$shortname]+_}" ]; then
      PRODUCT_MAP["$shortname"]="${ALL_PRODUCTS[$shortname]}"
    else
      echo "WARNING: Unknown product '$shortname', ignoring"
    fi
  done
fi

# ------------------------------------------------------------------ Build step
if [ "$SKIP_BUILD" = false ]; then
  echo "=== Building product integrations ==="
  mkdir -p "$UIV2_DIR/public/ui"

  for shortname in "${!PRODUCT_MAP[@]}"; do
    product_ui_dir="$WORKSPACE_ROOT/${PRODUCT_MAP[$shortname]}"
    if [ ! -d "$product_ui_dir" ]; then
      echo "  Skipping $shortname (directory not found: $product_ui_dir)"
      continue
    fi

    echo "  Building $shortname..."
    (cd "$product_ui_dir" && pnpm install && VITE_MOCK=true pnpm build:mock)

    target_dir="$UIV2_DIR/public/ui/$shortname"
    rm -rf "$target_dir"
    mkdir -p "$target_dir"
    cp -r "$product_ui_dir/dist/"* "$target_dir/"
    if [ -f "$product_ui_dir/public/product-manifest.json" ]; then
      cp "$product_ui_dir/public/product-manifest.json" "$target_dir/"
    fi
    echo "  Done: $shortname"
  done

  echo ""
  echo "=== Generating product-integrations.json ==="
  node "$UIV2_DIR/scripts/generate-integrations-json.js"
  echo ""
else
  echo "=== Skipping integration builds (--skip-build set) ==="
  if [ ! -f "$UIV2_DIR/public/product-integrations.json" ]; then
    echo "  No product-integrations.json found — generating from existing public/ui/..."
    node "$UIV2_DIR/scripts/generate-integrations-json.js"
  fi
  echo ""
fi

# ------------------------------------------------------------------ Run step
cd "$UIV2_DIR"

if [ "$PREVIEW_MODE" = true ]; then
  echo "=== Building uiv2 mock app ==="
  VITE_MOCK=true VITE_THEME=default pnpm build:mock

  echo ""
  echo "=== Starting static preview server on http://localhost:$PORT ==="
  echo "    (Ctrl+C to stop)"
  echo ""
  exec pnpm preview:mock -- --port "$PORT"
else
  echo "=== Starting uiv2 live dev server (mock mode) ==="
  echo "    (hot-reload enabled, Ctrl+C to stop)"
  echo ""
  exec pnpm dev:mock
fi
