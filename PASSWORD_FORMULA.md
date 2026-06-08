# Password Generation Formula for Subcontractors

## Quick Reference

**Formula**: `labbe` + last 4 digits **BEFORE** the hyphen in the RUT

### Examples

| RUT | Last 4 Before Hyphen | Password |
|-----|----------------------|----------|
| 78315368-8 | 5368 | labbe5368 |
| 78248251-3 | 8251 | labbe8251 |
| 12345678-9 | 5678 | labbe5678 |
| 10574005-0 | 4005 | labbe4005 |

## Implementation

All password generation in the codebase uses the centralized utility function at `lib/password-utils.ts`:

```typescript
import { generateDefaultPassword } from '@/lib/password-utils'

const rut = '78315368-8'
const password = generateDefaultPassword(rut) // Returns: 'labbe5368'
```

## Where Passwords are Generated

1. **New Subcontractor Creation**: `/api/transportistas` (POST)
   - Automatically creates auth record when transportista is created
   - Password is generated using the utility function

2. **Auth Setup Migration**: `/api/admin/setup-subcontractor-auth` (POST)
   - Sets up passwords for all active subcontractors
   - Uses the same utility function

## Important Rules

✓ **ALWAYS** use the `generateDefaultPassword()` utility function
✗ **NEVER** hardcode the formula directly
✗ **NEVER** use `.slice(-4)` which includes the hyphen
✓ **ALWAYS** use `.split('-')[0].slice(-4)` to get digits before hyphen

## Validation

The formula is validated in multiple places:
- `lib/password-utils.ts` - Core implementation
- All password creation endpoints use the utility
- Test cases in scripts ensure correctness

## User Communication

When notifying users of their default password:
- Display: "labbe + last 4 digits of your RUT"
- Example: "RUT 78315368-8 → Password: labbe5368"
- Clear: The digits come BEFORE the hyphen, not after
