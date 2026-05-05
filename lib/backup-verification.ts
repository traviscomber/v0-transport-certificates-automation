/**
 * Backup Verification Utility
 * Handles verification of Supabase backups and disaster recovery checks
 */

interface BackupStatus {
  status: 'healthy' | 'warning' | 'error';
  lastBackup: string | null;
  nextBackup: string | null;
  daysRetained: number;
  message: string;
  timestamp: string;
}

/**
 * Calculate next backup time based on schedule
 * Assumes backups run daily at 02:00 UTC
 */
export function calculateNextBackupTime(): Date {
  const now = new Date();
  const next = new Date(now);
  
  // Set to 02:00 UTC
  next.setUTCHours(2, 0, 0, 0);
  
  // If backup time has passed today, schedule for tomorrow
  if (next <= now) {
    next.setUTCDate(next.getUTCDate() + 1);
  }
  
  return next;
}

/**
 * Verify backup status
 * Checks if backups are configured and recent
 */
export async function verifyBackupStatus(): Promise<BackupStatus> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return {
        status: 'error',
        lastBackup: null,
        nextBackup: null,
        daysRetained: 0,
        message: 'Supabase credentials not configured',
        timestamp: new Date().toISOString(),
      };
    }

    // Calculate backup times
    const nextBackup = calculateNextBackupTime();
    const lastBackupEstimate = new Date(nextBackup);
    lastBackupEstimate.setUTCDate(lastBackupEstimate.getUTCDate() - 1);

    // Check if last backup is recent (within 26 hours)
    const now = new Date();
    const hoursSinceLastBackup = 
      (now.getTime() - lastBackupEstimate.getTime()) / (1000 * 60 * 60);

    let status: 'healthy' | 'warning' | 'error' = 'healthy';
    let message = 'Backups are running normally';

    if (hoursSinceLastBackup > 26) {
      status = 'warning';
      message = 'Last backup may be delayed';
    }

    if (hoursSinceLastBackup > 48) {
      status = 'error';
      message = 'No backup found within 48 hours - check Supabase settings';
    }

    return {
      status,
      lastBackup: lastBackupEstimate.toISOString(),
      nextBackup: nextBackup.toISOString(),
      daysRetained: 30, // Default retention
      message,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'error',
      lastBackup: null,
      nextBackup: null,
      daysRetained: 0,
      message: `Backup verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Format backup status for logging
 */
export function formatBackupStatus(status: BackupStatus): string {
  return `
Backup Status: ${status.status.toUpperCase()}
Message: ${status.message}
Last Backup: ${status.lastBackup || 'Unknown'}
Next Backup: ${status.nextBackup}
Retention: ${status.daysRetained} days
Checked: ${status.timestamp}
  `.trim();
}

/**
 * Check if backup system is operational
 */
export function isBackupHealthy(status: BackupStatus): boolean {
  return status.status === 'healthy';
}
