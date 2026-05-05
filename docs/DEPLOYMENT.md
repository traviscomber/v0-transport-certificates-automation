# Deployment Guide

## Production Readiness Checklist

Before deploying to production, ensure:

- [ ] All tests passing (18/18)
- [ ] Build compiles without errors
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] RLS policies enabled
- [ ] Error boundaries in place
- [ ] Authentication enabled on all APIs
- [ ] Request validation implemented
- [ ] Error tracking configured

---

## Environment Variables

### Required for Production

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email Service
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password

# Application
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

---

## Deployment Steps

### 1. Pre-Deployment Verification

```bash
# Run all tests
pnpm test

# Build the application
pnpm build

# Check for TypeScript errors
npm run build

# Check deployed environment
vercel env list
```

### 2. Deploy to Production

```bash
# Deploy to Vercel
vercel deploy --prod --scope team_OZTpx87yFUvdvneuoNbJeYS1

# Verify deployment
vercel inspect
```

### 3. Post-Deployment Checks

1. **Health Check**: Verify API endpoints respond
2. **Database Connection**: Confirm data access
3. **Authentication**: Test login functionality
4. **Alerts**: Verify email notifications send
5. **Monitoring**: Check error logs and metrics

---

## Database Migrations

Apply migrations in order:

```bash
# These are auto-applied by Supabase on schema sync
1. 001_initial_setup.sql
2. 002_document_types.sql
3. 003_company_structure.sql
4. 004_auth_setup.sql
5. 005_anomaly_tracking.sql
6. 006_document_status_audit.sql
7. 007_enhanced_rls_policies.sql
```

---

## Monitoring

### Key Metrics to Monitor

- API response times (target: <200ms)
- Error rate (target: <0.1%)
- Database query performance
- Email delivery rate
- User authentication success rate

### Alerting

Configure alerts for:
- High error rate (>1%)
- Database connection failures
- Email delivery failures
- Deployment failures

---

## Rollback Procedure

If issues are detected after deployment:

```bash
# Rollback to previous deployment
vercel rollback

# Or redeploy previous commit
git checkout <previous-commit>
vercel deploy --prod
```

---

## Performance Optimization

### Caching Strategy

- API responses: 5 minutes
- Static assets: 1 year
- Database queries: Use Supabase caching

### Database Optimization

- All queries use proper indexes
- RLS policies enable row-level filtering
- Audit logs are separate for performance

### Frontend Optimization

- Code splitting enabled
- Image optimization with Next.js
- CSS-in-JS minimization

---

## Security Considerations

### Production Security Checklist

- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS protection (CSP headers)
- [ ] CSRF protection
- [ ] Secrets not committed to repository
- [ ] Database backups configured
- [ ] Audit logging enabled

### Security Scanning

```bash
# Run security audit
npm audit

# Check for vulnerabilities
pnpm audit
```

---

## Backup and Disaster Recovery

### Backup Strategy

- Daily automated backups to S3
- Point-in-time recovery enabled
- Backup retention: 30 days

### Disaster Recovery Plan

- **RTO**: 1 hour
- **RPO**: 15 minutes
- Failover process documented
- Regular DR drills scheduled

---

## Troubleshooting

### Common Issues

**Issue**: API returns 401 Unauthorized
- **Solution**: Check JWT token validity and user authentication status

**Issue**: Database connection timeout
- **Solution**: Verify Supabase connection string and network connectivity

**Issue**: Email alerts not sending
- **Solution**: Check SMTP configuration and email queue

**Issue**: High database query latency
- **Solution**: Review query performance, check index usage

---

## Support and Escalation

For production issues:

1. Check error logs in Vercel dashboard
2. Review database performance metrics
3. Check error tracking system
4. Contact support if issue persists

**Support Contact**: support@yourdomain.com
**On-Call Escalation**: ops-team@yourdomain.com
