#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
UIV2_DIR="${UIV2_DIR:-$(cd "$SCRIPT_DIR/.." && pwd)}"
WORKSPACE_ROOT="${WORKSPACE_ROOT:-$(cd "$UIV2_DIR/.." && pwd)}"

declare -A ALL_PRODUCTS=(
  ["tak"]="takintegration/ui"
  ["mtx"]="mtxauthz/ui"
)

# Parse arguments
SELECTED_PRODUCTS=""  # empty = all

while [[ $# -gt 0 ]]; do
  case $1 in
    --products)
      SELECTED_PRODUCTS="$2"
      shift 2
      ;;
    --all)
      SELECTED_PRODUCTS=""
      shift
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--products tak,mtx] [--all]"
      exit 1
      ;;
  esac
done

# Resolve which products to build
declare -A PRODUCT_MAP
if [ -z "$SELECTED_PRODUCTS" ]; then
  for k in "${!ALL_PRODUCTS[@]}"; do
    PRODUCT_MAP["$k"]="${ALL_PRODUCTS[$k]}"
  done
else
  IFS=',' read -ra requested <<< "$SELECTED_PRODUCTS"
  for shortname in "${requested[@]}"; do
    shortname="${shortname// /}"  # trim spaces
    if [ -n "${ALL_PRODUCTS[$shortname]+_}" ]; then
      PRODUCT_MAP["$shortname"]="${ALL_PRODUCTS[$shortname]}"
    else
      echo "WARNING: Unknown product '$shortname', skipping"
    fi
  done
fi

echo "=== Build Product Integrations ==="
echo "Workspace root: $WORKSPACE_ROOT"
echo "UIv2 directory: $UIV2_DIR"
if [ -z "$SELECTED_PRODUCTS" ]; then
  echo "Products:       all (${!ALL_PRODUCTS[*]})"
else
  echo "Products:       $SELECTED_PRODUCTS"
fi
echo ""

# Ensure output directory exists
mkdir -p "$UIV2_DIR/public/ui"

BUILT_COUNT=0

for shortname in "${!PRODUCT_MAP[@]}"; do
  product_ui_dir="$WORKSPACE_ROOT/${PRODUCT_MAP[$shortname]}"

  echo "--- Building: $shortname ---"
  echo "  Source: $product_ui_dir"

  if [ ! -d "$product_ui_dir" ]; then
    echo "  WARNING: Directory not found, skipping $shortname"
    continue
  fi

  if [ ! -f "$product_ui_dir/package.json" ]; then
    echo "  WARNING: No package.json found, skipping $shortname"
    continue
  fi

  # Install dependencies
  echo "  Installing dependencies..."
  (cd "$product_ui_dir" && pnpm install --frozen-lockfile 2>/dev/null || pnpm install)

  # Build in mock mode
  echo "  Building (mock mode)..."
  (cd "$product_ui_dir" && pnpm build:mock)

  # Copy build output to uiv2/public/ui/{shortname}/
  target_dir="$UIV2_DIR/public/ui/$shortname"
  echo "  Copying dist -> $target_dir"
  rm -rf "$target_dir"
  mkdir -p "$target_dir"
  cp -r "$product_ui_dir/dist/"* "$target_dir/"

  # Copy product-manifest.json into the output dir for the generator to find
  if [ -f "$product_ui_dir/public/product-manifest.json" ]; then
    cp "$product_ui_dir/public/product-manifest.json" "$target_dir/product-manifest.json"
  else
    echo "  WARNING: No product-manifest.json found for $shortname"
  fi

  echo "  Done: $shortname"
  BUILT_COUNT=$((BUILT_COUNT + 1))
  echo ""
done

echo "=== Built $BUILT_COUNT product integration(s) ==="

# Generate aggregated product-integrations.json
echo ""
echo "=== Generating product-integrations.json ==="
node "$UIV2_DIR/scripts/generate-integrations-json.js"

echo ""
echo "=== All done ==="
