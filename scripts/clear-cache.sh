#!/bin/bash
# Clear Next.js and webpack build caches
rm -rf .next
rm -rf node_modules/.cache
rm -rf node_modules/.pnpm
find . -name "*.cache" -type f -delete 2>/dev/null || true
find . -name ".webpack" -type d -exec rm -rf {} + 2>/dev/null || true
echo "Cache cleared successfully"
