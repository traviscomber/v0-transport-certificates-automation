# Testing Guide

## Overview

This project uses Jest and React Testing Library for unit and component testing. Tests are organized by feature and type to maintain clarity and maintainability.

## Running Tests

```bash
# Run all tests
pnpm test

# Watch mode for development
pnpm test:watch

# Coverage report
pnpm test:coverage

# Run only unit tests
pnpm test:unit
```

## Test Structure

```
__tests__/
├── lib/
│   ├── validation.test.ts          # Validation schema tests
│   └── document-status-service.test.ts  # Status service tests
└── components/
    ├── anomaly-table.test.tsx      # Component tests
    └── error-boundary.test.tsx     # Error boundary tests
```

## Key Test Files

### Validation Tests (`__tests__/lib/validation.test.ts`)
- Email format validation
- Status change request validation
- Anomaly action request validation
- Email alert request validation

**Coverage:**
- Valid input acceptance
- Invalid input rejection
- Error message accuracy
- Edge cases (whitespace, case sensitivity, null values)

### Document Status Service Tests (`__tests__/lib/document-status-service.test.ts`)
- Status validation and normalization
- Spanish to English status mapping
- Case insensitivity handling
- Whitespace handling
- Invalid status rejection

**Coverage:**
- All valid status values
- All Spanish status values
- Edge cases and error conditions

## Test Coverage Goals

- **lib/** - 80%+ coverage
- **hooks/** - 75%+ coverage
- **components/** - 60%+ coverage (focus on critical paths)

## Writing New Tests

### Test Template

```typescript
describe('Feature/Component Name', () => {
  beforeEach(() => {
    // Setup
  })

  afterEach(() => {
    // Cleanup
  })

  it('should do something specific', () => {
    // Arrange
    const input = { /* ... */ }

    // Act
    const result = functionUnderTest(input)

    // Assert
    expect(result).toBe(expected)
  })
})
```

### Best Practices

1. **One assertion focus per test**
   - Each test should verify one specific behavior
   - Makes failures easier to diagnose

2. **Descriptive test names**
   - Use "should" - e.g., "should validate correct email formats"
   - Include edge cases - e.g., "should be case insensitive"

3. **Test organization**
   - Group related tests with `describe()` blocks
   - Mirror the source file structure in test file names

4. **Mocking**
   - Mock external dependencies (Supabase, API calls)
   - Mock navigation and routing (see jest.setup.js)
   - Keep mocks simple and focused

## CI/CD Integration

Tests should run automatically:
- **On PR creation** - Run full test suite
- **Before deployment** - Require passing tests
- **Coverage reporting** - Track coverage trends

## Debugging Tests

```bash
# Run with verbose output
pnpm test -- --verbose

# Run specific test file
pnpm test -- validation.test.ts

# Run tests matching pattern
pnpm test -- --testNamePattern="should validate"

# Debug in VSCode
# Add "Debug Jest Tests" configuration
```

## Future Improvements

- [ ] E2E tests with Playwright
- [ ] Performance testing
- [ ] Visual regression testing
- [ ] API integration tests
- [ ] Coverage monitoring dashboard

## References

- [Jest Documentation](https://jestjs.io)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://jestjs.io/docs/tutorial-react)
