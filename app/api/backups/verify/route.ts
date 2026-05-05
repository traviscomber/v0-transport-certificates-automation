import { verifyBackupStatus, formatBackupStatus } from '@/lib/backup-verification';
import { NextResponse } from 'next/server';

/**
 * GET /api/backups/verify
 * 
 * Returns current backup status and health information
 * Used by monitoring systems to verify backup system is operational
 */
export async function GET() {
  try {
    const backupStatus = await verifyBackupStatus();

    // Log backup status for monitoring
    console.log('[BACKUP_VERIFICATION]', formatBackupStatus(backupStatus));

    // Return status with appropriate HTTP code
    const statusCode = backupStatus.status === 'healthy' ? 200 : 
                      backupStatus.status === 'warning' ? 206 : 500;

    return NextResponse.json(backupStatus, { status: statusCode });
  } catch (error) {
    console.error('[BACKUP_VERIFICATION_ERROR]', error);

    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to verify backup status',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
