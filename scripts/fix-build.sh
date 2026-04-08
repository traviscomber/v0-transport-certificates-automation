#!/bin/bash

# Build Fix Diagnostic and Recovery Script
echo "=== Transport Certificates Build Diagnostic ==="
echo ""

# Step 1: Remove Next.js cache
echo "Step 1: Clearing Next.js cache..."
rm -rf .next
echo "✓ .next cache cleared"
echo ""

# Step 2: Remove node_modules cache
echo "Step 2: Clearing node_modules cache..."
rm -rf node_modules/.cache
echo "✓ node_modules cache cleared"
echo ""

# Step 3: Verify configuration files
echo "Step 3: Verifying configuration files..."
if grep -q "devIndicators\|transitionIndicator\|turbopack" next.config.js; then
  echo "✗ Found deprecated config options in next.config.js"
  exit 1
else
  echo "✓ next.config.js is clean"
fi

if grep -q 'export const config' app/api/conductor/upload-document/route.ts; then
  echo "✗ Found deprecated config export in API route"
  exit 1
else
  echo "✓ API route uses modern syntax"
fi
echo ""

# Step 4: Verify client directives
echo "Step 4: Verifying 'use client' directives..."
files=(
  "app/conductor/upload/page.tsx"
  "app/conductor/upload/page-interactive.tsx"
  "components/admin/executive-staff-manager.tsx"
)

for file in "${files[@]}"; do
  if grep -q '"use client"\|'"'"'use client'"'"'' "$file"; then
    echo "✓ $file has 'use client' directive"
  else
    echo "✗ $file missing 'use client' directive"
    exit 1
  fi
done
echo ""

echo "=== All Checks Passed ==="
echo "Ready to run: npm run dev"
