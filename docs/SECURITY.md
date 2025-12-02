# 🔒 Security Documentation

## Overview

OphthalmoSim+ implements comprehensive security measures to protect medical training data and ensure compliance with healthcare regulations.

## Role-Based Access Control (RBAC)

### User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| `guest` | Unauthenticated user | Read-only public content |
| `trainee` | Resident/Fellow | Own data, simulations, OKAP games |
| `supervisor` | Attending/Program Director | Trainee progress, schedules |
| `admin` | System Administrator | Full access, user management |

### Permission Matrix

| Resource | Guest | Trainee | Supervisor | Admin |
|----------|-------|---------|------------|-------|
| Own Profile | ❌ | ✅ | ✅ | ✅ |
| Other Profiles | ❌ | ❌ | ✅ (trainees) | ✅ |
| Simulations | ❌ | Own only | All | All |
| OKAP Results | ❌ | Own only | All | All |
| Schedules | ❌ | Read | Read/Write | Full |
| Audit Logs | ❌ | ❌ | ❌ | ✅ |
| Analytics | ❌ | ❌ | ✅ | ✅ |

## Firebase Security Rules

Located in `firestore.rules`, our security rules implement:

1. **Authentication Required**: All data access requires authentication
2. **User Isolation**: Users can only access their own data
3. **Role Validation**: Actions validated against user role
4. **Data Validation**: Input validation for all writes
5. **Immutability**: Results and audit logs cannot be modified/deleted

### Key Security Functions

```javascript
// Check if user is authenticated
function isAuthenticated() {
  return request.auth != null;
}

// Check if user owns the document
function isOwner(userId) {
  return isAuthenticated() && request.auth.uid == userId;
}

// Check if user is supervisor or higher
function isSupervisorOrHigher() {
  return isAuthenticated() && (getUserRole() in ['admin', 'supervisor']);
}
```

## Audit Logging

All sensitive operations are logged to the `audit_logs` collection:

### Logged Events

- **Authentication**: Login, logout, failed attempts, registration
- **Data Access**: Profile views, simulation results access
- **Modifications**: Profile updates, preference changes
- **Scheduling**: Schedule creation, swap requests
- **Security**: Alerts, errors, admin actions

### Log Entry Structure

```typescript
interface AuditLogEntry {
  timestamp: Timestamp;
  userId: string;
  userEmail: string;
  action: AuditAction;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  resource: string;
  resourceId?: string;
  details: Record<string, unknown>;
  success: boolean;
  errorMessage?: string;
}
```

### Usage

```typescript
import { audit } from '$lib/auditLog';

// Log authentication
audit.login(true, { method: 'email' });

// Log simulation completion
audit.simulationComplete('capsulorhexis', 92, 300);

// Log security alert
audit.securityAlert('multiple_failed_logins', { attempts: 5 });
```

## Data Protection

### Sensitive Data Handling

1. **Passwords**: Never stored, handled by Firebase Auth
2. **Personal Info**: Encrypted at rest in Firestore
3. **Medical Data**: Isolated per user, audit logged
4. **API Keys**: Environment variables, never in code

### Data Sanitization

All audit log details are sanitized to remove sensitive fields:

```typescript
const sensitiveKeys = ['password', 'token', 'secret', 'apiKey'];
```

## Compliance Considerations

### HIPAA

- ✅ Access controls implemented
- ✅ Audit logging enabled
- ✅ Data encryption (Firebase default)
- ⚠️ BAA required with Firebase
- ⚠️ Staff training needed

### GDPR

- ✅ User data isolation
- ✅ Audit trail
- ⚠️ Data export feature needed
- ⚠️ Data deletion process needed

## Security Best Practices

### For Developers

1. Never log sensitive data
2. Always validate user input
3. Use parameterized queries
4. Keep dependencies updated
5. Review security rules before deploy

### For Deployment

1. Enable Firebase App Check
2. Configure rate limiting
3. Set up monitoring alerts
4. Regular security audits
5. Penetration testing

## Incident Response

### Security Alert Levels

| Level | Response Time | Action |
|-------|--------------|--------|
| CRITICAL | Immediate | Page on-call, investigate |
| ERROR | 1 hour | Review logs, fix issue |
| WARNING | 24 hours | Monitor, plan fix |
| INFO | Weekly review | Aggregate analysis |

### Contact

Security issues should be reported to the development team immediately.

## Deployment Checklist

- [ ] Firebase security rules deployed
- [ ] Environment variables configured
- [ ] App Check enabled
- [ ] Rate limiting configured
- [ ] Monitoring alerts set up
- [ ] Backup procedures verified
- [ ] Access logs reviewed
