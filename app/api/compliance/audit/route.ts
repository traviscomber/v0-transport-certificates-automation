/**
 * API endpoint: /api/compliance/audit
 * Triggers daily compliance audit for all conductors and companies
 * Should be called via Vercel Cron Jobs
 */
export async function POST(request: Request) {
  // Verify request is from Vercel Cron
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('[v0] Starting compliance audit...')

    const startTime = Date.now()

    // Lazy import to avoid build errors
    const { complianceAuditSystem } = await import('@/lib/compliance/audit-system')

    // Run audits
    const [conductorResults, companyResults] = await Promise.all([
      complianceAuditSystem.auditAllConductors(),
      complianceAuditSystem.auditAllCompanies(),
    ])

    const duration = Date.now() - startTime

    console.log('[v0] Audit complete in', duration, 'ms')

    return Response.json({
      success: true,
      conductorsAudited: conductorResults.length,
      companiesAudited: companyResults.length,
      totalAlertsCreated: (conductorResults.reduce((sum, r) => sum + r.alertsCreated, 0) + companyResults.reduce((sum, r) => sum + r.alertsCreated, 0)),
      duration,
    })
  } catch (error) {
    console.error('[v0] Audit error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Audit failed' },
      { status: 500 }
    )
  }
}
