/**
 * Comprehensive Testing Suite for Walmart OCR Portal
 * Tests multi-layer validation, OCR confidence, and accuracy metrics
 */

import {
  validateRUT,
  validateLicensePlate,
  validateChileanDate,
  validateDocumentData,
} from '@/lib/chilean-validators'
import { generateConfidenceFlags } from '@/lib/ocr-confidence-flags'

// ============================================================================
// TEST FIXTURES - Real-world Chilean data
// ============================================================================

export const TEST_DATA = {
  validRUTs: [
    { input: '12.345.678-9', expected: true, formatted: '12.345.678-9' },
    { input: '12345678-9', expected: true, formatted: '12.345.678-9' },
    { input: '9.999.999-K', expected: true, formatted: '9.999.999-K' },
    { input: '17.123.456-3', expected: true, formatted: '17.123.456-3' },
  ],
  invalidRUTs: [
    { input: '12.345.678-0', reason: 'Invalid verifier digit' },
    { input: '99999999-1', reason: 'Implausible RUT' },
    { input: 'ABCD-EFGH', reason: 'Non-numeric' },
  ],
  validPlates: [
    { input: 'BRSX-89', format: 'new' }, // New format (2020+)
    { input: 'BB-1234-RF', format: 'old' }, // Old format
    { input: 'AAAA-99', format: 'new' },
  ],
  invalidPlates: [
    { input: '1234-ABC' },
    { input: 'ABC-123' },
  ],
  validDates: [
    { input: '15/06/1990', valid: true },
    { input: '01/01/2020', valid: true },
    { input: '31/12/2025', valid: true },
  ],
  invalidDates: [
    { input: '31/02/2020', reason: 'February 31 doesnt exist' },
    { input: '32/01/2020', reason: 'Day > 31' },
    { input: '01/13/2020', reason: 'Month > 12' },
  ],
}

// ============================================================================
// UNIT TESTS - Chilean Validators
// ============================================================================

export async function testChileanValidators(): Promise<TestResults> {
  console.log('\n=== CHILEAN VALIDATORS TESTS ===\n')

  const results: TestResults = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: [],
  }

  // Test RUT validation
  console.log('Testing RUT Validation...')
  for (const test of TEST_DATA.validRUTs) {
    results.total++
    const result = validateRUT(test.input)
    if (result.valid && result.formattedRUT === test.formatted) {
      results.passed++
      results.tests.push({
        name: `RUT ${test.input}`,
        status: 'PASS',
        expected: 'valid',
        actual: 'valid',
      })
    } else {
      results.failed++
      results.tests.push({
        name: `RUT ${test.input}`,
        status: 'FAIL',
        expected: `valid, formatted as ${test.formatted}`,
        actual: `${result.valid ? 'valid' : 'invalid'}, formatted as ${result.formattedRUT}`,
      })
    }
  }

  for (const test of TEST_DATA.invalidRUTs) {
    results.total++
    const result = validateRUT(test.input)
    if (!result.valid) {
      results.passed++
      results.tests.push({
        name: `RUT ${test.input} (${test.reason})`,
        status: 'PASS',
        expected: 'invalid',
        actual: 'invalid',
      })
    } else {
      results.failed++
      results.tests.push({
        name: `RUT ${test.input}`,
        status: 'FAIL',
        expected: 'invalid',
        actual: 'valid',
      })
    }
  }

  // Test License Plate validation
  console.log('Testing License Plate Validation...')
  for (const test of TEST_DATA.validPlates) {
    results.total++
    const result = validateLicensePlate(test.input)
    if (result.valid && result.format === test.format) {
      results.passed++
      results.tests.push({
        name: `Plate ${test.input}`,
        status: 'PASS',
        expected: `valid (${test.format})`,
        actual: `valid (${result.format})`,
      })
    } else {
      results.failed++
      results.tests.push({
        name: `Plate ${test.input}`,
        status: 'FAIL',
        expected: `valid (${test.format})`,
        actual: result.valid ? `valid (${result.format})` : 'invalid',
      })
    }
  }

  for (const test of TEST_DATA.invalidPlates) {
    results.total++
    const result = validateLicensePlate(test.input)
    if (!result.valid) {
      results.passed++
      results.tests.push({
        name: `Plate ${test.input}`,
        status: 'PASS',
        expected: 'invalid',
        actual: 'invalid',
      })
    } else {
      results.failed++
      results.tests.push({
        name: `Plate ${test.input}`,
        status: 'FAIL',
        expected: 'invalid',
        actual: 'valid',
      })
    }
  }

  // Test Date validation
  console.log('Testing Date Validation...')
  for (const test of TEST_DATA.validDates) {
    results.total++
    const result = validateChileanDate(test.input)
    if (result.valid) {
      results.passed++
      results.tests.push({
        name: `Date ${test.input}`,
        status: 'PASS',
        expected: 'valid',
        actual: 'valid',
      })
    } else {
      results.failed++
      results.tests.push({
        name: `Date ${test.input}`,
        status: 'FAIL',
        expected: 'valid',
        actual: 'invalid',
      })
    }
  }

  for (const test of TEST_DATA.invalidDates) {
    results.total++
    const result = validateChileanDate(test.input)
    if (!result.valid) {
      results.passed++
      results.tests.push({
        name: `Date ${test.input} (${test.reason})`,
        status: 'PASS',
        expected: 'invalid',
        actual: 'invalid',
      })
    } else {
      results.failed++
      results.tests.push({
        name: `Date ${test.input}`,
        status: 'FAIL',
        expected: 'invalid',
        actual: 'valid',
      })
    }
  }

  return results
}

// ============================================================================
// INTEGRATION TESTS - Multi-Layer Validation
// ============================================================================

export async function testMultiLayerValidation(): Promise<TestResults> {
  console.log('\n=== MULTI-LAYER VALIDATION TESTS ===\n')

  const results: TestResults = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: [],
  }

  // Test Case 1: Valid Conductor Document
  results.total++
  const validConductor = {
    rut: '12.345.678-9',
    nombreCompleto: 'Juan Perez Garcia',
    fechaNacimiento: '15/06/1990',
    licenseClass: 'A5',
    expirationDate: '31/12/2025',
  }

  const result1 = await validateDocumentData(validConductor)
  if (result1.valid && result1.score >= 80) {
    results.passed++
    results.tests.push({
      name: 'Valid Conductor Data',
      status: 'PASS',
      expected: 'valid, score >= 80',
      actual: `valid, score ${result1.score}`,
    })
  } else {
    results.failed++
    results.tests.push({
      name: 'Valid Conductor Data',
      status: 'FAIL',
      expected: 'valid, score >= 80',
      actual: result1.valid ? `valid, score ${result1.score}` : 'invalid',
    })
  }

  // Test Case 2: Invalid Date
  results.total++
  const invalidDate = {
    rut: '12.345.678-9',
    nombreCompleto: 'Juan Perez Garcia',
    expirationDate: '31/02/2020', // Invalid
  }

  const result2 = await validateDocumentData(invalidDate)
  if (!result2.valid || result2.score < 100) {
    results.passed++
    results.tests.push({
      name: 'Invalid Date Detection',
      status: 'PASS',
      expected: 'invalid date flagged',
      actual: 'invalid date detected',
    })
  } else {
    results.failed++
    results.tests.push({
      name: 'Invalid Date Detection',
      status: 'FAIL',
      expected: 'invalid date flagged',
      actual: 'date passed validation',
    })
  }

  // Test Case 3: Missing Critical Fields
  results.total++
  const missingFields = {
    nombreCompleto: 'Juan Perez', // Missing RUT
  }

  const result3 = await validateDocumentData(missingFields)
  if (result3.score < 100) {
    results.passed++
    results.tests.push({
      name: 'Missing Field Detection',
      status: 'PASS',
      expected: 'incomplete validation',
      actual: `score ${result3.score}`,
    })
  } else {
    results.failed++
    results.tests.push({
      name: 'Missing Field Detection',
      status: 'FAIL',
      expected: 'incomplete validation',
      actual: 'all fields validated',
    })
  }

  return results
}

// ============================================================================
// CONFIDENCE FLAG TESTS
// ============================================================================

export async function testConfidenceFlags(): Promise<TestResults> {
  console.log('\n=== CONFIDENCE FLAGS TESTS ===\n')

  const results: TestResults = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: [],
  }

  // Test Case 1: High Confidence - Should Auto-Approve
  results.total++
  const highConfidenceResponse = {
    confidence: 0.95,
    fieldConfidences: {
      rut: 0.98,
      nombre: 0.95,
      apellido: 0.92,
      licenseClass: 0.96,
    },
    missingFields: [],
  }

  const flags1 = generateConfidenceFlags(highConfidenceResponse, 'LICENCIA-CONDUCIR')
  if (flags1.autoAction === 'auto-approve' && flags1.overallConfidence >= 85) {
    results.passed++
    results.tests.push({
      name: 'High Confidence Auto-Approve',
      status: 'PASS',
      expected: 'auto-approve',
      actual: flags1.autoAction,
    })
  } else {
    results.failed++
    results.tests.push({
      name: 'High Confidence Auto-Approve',
      status: 'FAIL',
      expected: 'auto-approve',
      actual: flags1.autoAction,
    })
  }

  // Test Case 2: Low Confidence - Should Request Manual Review
  results.total++
  const lowConfidenceResponse = {
    confidence: 0.72,
    fieldConfidences: {
      rut: 0.65,
      nombre: 0.75,
      apellido: 0.70,
      licenseClass: 0.68,
    },
    missingFields: [],
  }

  const flags2 = generateConfidenceFlags(lowConfidenceResponse, 'LICENCIA-CONDUCIR')
  if (
    flags2.autoAction === 'manual-review' &&
    flags2.flags.some((f) => f.code === 'OCR_CONFIDENCE_LOW')
  ) {
    results.passed++
    results.tests.push({
      name: 'Low Confidence Manual Review',
      status: 'PASS',
      expected: 'manual-review with OCR_CONFIDENCE_LOW flag',
      actual: `${flags2.autoAction} with flags`,
    })
  } else {
    results.failed++
    results.tests.push({
      name: 'Low Confidence Manual Review',
      status: 'FAIL',
      expected: 'manual-review',
      actual: flags2.autoAction,
    })
  }

  // Test Case 3: Critical Issues - Should Reject
  results.total++
  const criticalResponse = {
    confidence: 0.45,
    fieldConfidences: {
      rut: 0.30,
      nombre: 0.50,
    },
    missingFields: ['apellido', 'licenseClass', 'expirationDate'],
    isExpired: true,
  }

  const flags3 = generateConfidenceFlags(criticalResponse, 'LICENCIA-CONDUCIR')
  if (
    flags3.autoAction === 'reject' &&
    flags3.flags.some((f) => f.type === 'critical')
  ) {
    results.passed++
    results.tests.push({
      name: 'Critical Issues Rejection',
      status: 'PASS',
      expected: 'reject with critical flags',
      actual: `${flags3.autoAction} with critical flags`,
    })
  } else {
    results.failed++
    results.tests.push({
      name: 'Critical Issues Rejection',
      status: 'FAIL',
      expected: 'reject',
      actual: flags3.autoAction,
    })
  }

  return results
}

// ============================================================================
// PERFORMANCE TESTS
// ============================================================================

export async function testPerformance(): Promise<PerformanceResults> {
  console.log('\n=== PERFORMANCE TESTS ===\n')

  const results: PerformanceResults = {
    validatorLatency: 0,
    multiLayerLatency: 0,
    flagGenerationLatency: 0,
    totalTime: 0,
    meetsTargets: false,
  }

  // Test Validator Speed
  console.time('Validator')
  for (let i = 0; i < 1000; i++) {
    validateRUT('12.345.678-9')
  }
  const validatorTime = performance.now()
  console.timeEnd('Validator')
  results.validatorLatency = validatorTime / 1000

  // Test Multi-Layer Validation Speed
  console.time('Multi-Layer Validation')
  const testData = {
    rut: '12.345.678-9',
    nombreCompleto: 'Juan Perez Garcia',
    expirationDate: '31/12/2025',
  }
  for (let i = 0; i < 100; i++) {
    await validateDocumentData(testData)
  }
  const multiLayerTime = performance.now()
  console.timeEnd('Multi-Layer Validation')
  results.multiLayerLatency = multiLayerTime / 100

  // Test Flag Generation Speed
  console.time('Flag Generation')
  for (let i = 0; i < 100; i++) {
    generateConfidenceFlags(
      {
        confidence: 0.85,
        fieldConfidences: { rut: 0.9, nombre: 0.85 },
        missingFields: [],
      },
      'CEDULA-IDENTIDAD'
    )
  }
  const flagTime = performance.now()
  console.timeEnd('Flag Generation')
  results.flagGenerationLatency = flagTime / 100

  results.totalTime = validatorTime + multiLayerTime + flagTime

  // Check if performance meets targets
  results.meetsTargets =
    results.validatorLatency < 1 && // < 1ms per validation
    results.multiLayerLatency < 500 && // < 500ms per multi-layer
    results.flagGenerationLatency < 100 // < 100ms per flag generation

  return results
}

// ============================================================================
// TEST RESULT TYPES
// ============================================================================

export interface TestResults {
  total: number
  passed: number
  failed: number
  tests: {
    name: string
    status: 'PASS' | 'FAIL'
    expected: string
    actual: string
  }[]
}

export interface PerformanceResults {
  validatorLatency: number
  multiLayerLatency: number
  flagGenerationLatency: number
  totalTime: number
  meetsTargets: boolean
}

// ============================================================================
// TEST RUNNER
// ============================================================================

export async function runAllTests(): Promise<void> {
  console.log(
    '\n╔════════════════════════════════════════════════════════════════╗'
  )
  console.log(
    '║     WALMART OCR PORTAL - COMPREHENSIVE TEST SUITE              ║'
  )
  console.log(
    '╚════════════════════════════════════════════════════════════════╝\n'
  )

  try {
    // Run tests
    const unitTestResults = await testChileanValidators()
    const integrationResults = await testMultiLayerValidation()
    const flagResults = await testConfidenceFlags()
    const perfResults = await testPerformance()

    // Summary Report
    console.log(
      '\n╔════════════════════════════════════════════════════════════════╗'
    )
    console.log(
      '║                      TEST SUMMARY REPORT                       ║'
    )
    console.log(
      '╚════════════════════════════════════════════════════════════════╝\n'
    )

    const totalTests = unitTestResults.total + integrationResults.total + flagResults.total
    const totalPassed = unitTestResults.passed + integrationResults.passed + flagResults.passed
    const totalFailed = unitTestResults.failed + integrationResults.failed + flagResults.failed

    console.log(`Unit Tests:           ${unitTestResults.passed}/${unitTestResults.total} passed`)
    console.log(
      `Integration Tests:    ${integrationResults.passed}/${integrationResults.total} passed`
    )
    console.log(`Confidence Flags:     ${flagResults.passed}/${flagResults.total} passed`)
    console.log(`────────────────────────────────────────`)
    console.log(`TOTAL:                ${totalPassed}/${totalTests} passed`)
    console.log(`Success Rate:         ${Math.round((totalPassed / totalTests) * 100)}%`)

    console.log(`\nPerformance Metrics:`)
    console.log(`  Validator Latency:    ${perfResults.validatorLatency.toFixed(2)}ms`)
    console.log(`  Multi-Layer Latency:  ${perfResults.multiLayerLatency.toFixed(2)}ms`)
    console.log(
      `  Flag Generation:      ${perfResults.flagGenerationLatency.toFixed(2)}ms`
    )
    console.log(
      `  Performance Target:   ${perfResults.meetsTargets ? '✓ PASS' : '✗ FAIL'}`
    )

    if (totalFailed === 0 && perfResults.meetsTargets) {
      console.log('\n✓ ALL TESTS PASSED - PORTAL READY FOR PRODUCTION')
    } else {
      console.log('\n✗ Some tests failed - Review above for details')
    }
  } catch (error) {
    console.error('Test execution error:', error)
  }
}

// Run if executed directly
if (require.main === module) {
  runAllTests().catch(console.error)
}

export default {
  testChileanValidators,
  testMultiLayerValidation,
  testConfidenceFlags,
  testPerformance,
  runAllTests,
}
