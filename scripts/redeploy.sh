#!/bin/bash
set -e

cd /vercel/share/v0-project

# Configure git
git config user.email "v0[bot]@users.noreply.github.com"
git config user.name "v0[bot]"

# Add all changes
git add -A

# Commit with message
git commit -m "fix: resolve duplicate email constraints and build errors

- Check for existing profiles by email before inserting to prevent unique constraint violations
- Remove invalid 'enabled' option from Supabase realtime configuration
- Fix apellidos field mapping in sync-drivers and upload routes
- Fix estado type casting in updateDocumentStatus hook" || echo "No changes to commit"

# Push to the current branch
git push origin HEAD

echo "✅ Redeploy triggered successfully"
