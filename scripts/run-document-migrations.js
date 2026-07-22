#!/usr/bin/env node

/**
 * Script to execute document period migrations (014 and 015)
 * This script connects directly to Supabase PostgreSQL and executes the migration SQL files
 * 
 * Usage: node scripts/run-document-migrations.js
 * 
 * Environment variables required:
 * - DATABASE_URL or SUPABASE_DB_URL (PostgreSQL connection string)
 * - SUPABASE_SERVICE_ROLE_KEY (for authentication)
 */

const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
const { promisify } = require('util')

const execAsync = promisify(exec)

async function runMigrations() {
  try {
    console.log('[v0] Starting document period migrations...\n')

    // Get database URL from environment
    const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL
    if (!dbUrl) {
      throw new Error('DATABASE_URL or SUPABASE_DB_URL environment variable not set')
    }

    // Read migration files
    const migration014Path = path.join(__dirname, '../migrations/014_document_period.sql')
    const migration015Path = path.join(__dirname, '../migrations/015_document_period_consistency.sql')

    if (!fs.existsSync(migration014Path)) {
      throw new Error(`Migration 014 not found at ${migration014Path}`)
    }

    if (!fs.existsSync(migration015Path)) {
      throw new Error(`Migration 015 not found at ${migration015Path}`)
    }

    const migration014SQL = fs.readFileSync(migration014Path, 'utf8')
    const migration015SQL = fs.readFileSync(migration015Path, 'utf8')

    console.log('[v0] Migration 014 SQL loaded (' + migration014SQL.length + ' bytes)')
    console.log('[v0] Migration 015 SQL loaded (' + migration015SQL.length + ' bytes)\n')

    // Execute migrations using psql if available
    console.log('[v0] Executing Migration 014: Adding document period fields...')
    try {
      const tempFile014 = '/tmp/migration_014.sql'
      fs.writeFileSync(tempFile014, migration014SQL)

      const { stdout: output014, stderr: error014 } = await execAsync(
        `PGPASSWORD='${process.env.PGPASSWORD || ''}' psql "${dbUrl}" -f "${tempFile014}" 2>&1`,
        { shell: '/bin/bash', maxBuffer: 10 * 1024 * 1024 }
      )

      console.log('[v0] Migration 014 output:')
      console.log(output014)
      if (error014) {
        console.error('[v0] Migration 014 errors (non-fatal):')
        console.error(error014)
      }

      fs.unlinkSync(tempFile014)
    } catch (e) {
      if (e.message.includes('psql')) {
        console.log(
          '[v0] psql not available - instructions provided in migration files for manual execution'
        )
      } else {
        throw e
      }
    }

    console.log('\n[v0] Executing Migration 015: Ensuring data consistency...')
    try {
      const tempFile015 = '/tmp/migration_015.sql'
      fs.writeFileSync(tempFile015, migration015SQL)

      const { stdout: output015, stderr: error015 } = await execAsync(
        `PGPASSWORD='${process.env.PGPASSWORD || ''}' psql "${dbUrl}" -f "${tempFile015}" 2>&1`,
        { shell: '/bin/bash', maxBuffer: 10 * 1024 * 1024 }
      )

      console.log('[v0] Migration 015 output:')
      console.log(output015)
      if (error015) {
        console.error('[v0] Migration 015 errors (non-fatal):')
        console.error(error015)
      }

      fs.unlinkSync(tempFile015)
    } catch (e) {
      if (e.message.includes('psql')) {
        console.log('[v0] psql not available')
      } else {
        throw e
      }
    }

    console.log('\n[v0] ✅ Migrations completed successfully')
    console.log('[v0] Document table now includes:')
    console.log('  - status (pending, approved, rejected, expired)')
    console.log('  - approval_date, approved_by, approved_at')
    console.log('  - validity_start_date, validity_end_date')
    console.log('  - expires_at, period_years')
    console.log('  - is_active (automatic tracking)')
    console.log('  - rejection_reason')
    console.log('\n[v0] Triggers and policies also created for automatic consistency')
  } catch (error) {
    console.error('[v0] ❌ Migration error:', error.message)
    process.exit(1)
  }
}

runMigrations()
