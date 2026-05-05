#!/usr/bin/env node

/**
 * Performance Testing & Load Testing Setup Guide
 * 
 * This script provides recommendations for setting up k6 load testing
 * and creating performance test scenarios for the Anomaly Dashboard.
 * 
 * Installation: npm install -g k6
 * Run baseline: k6 run load-tests/baseline.js
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';

// Configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/api`;

export const options = {
  stages: [
    { duration: '30s', target: 10 }, // Ramp-up to 10 users
    { duration: '1m30s', target: 10 }, // Stay at 10 users
    { duration: '20s', target: 0 }, // Ramp-down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.1'], // Error rate must be below 10%
  },
};

/**
 * Test health endpoint
 */
function testHealthEndpoint() {
  group('Health Check', () => {
    const response = http.get(`${API_URL}/health`);
    check(response, {
      'health status is 200': (r) => r.status === 200,
      'health response time < 100ms': (r) => r.timings.duration < 100,
    });
  });
}

/**
 * Test backup verification endpoint
 */
function testBackupStatus() {
  group('Backup Verification', () => {
    const response = http.get(`${API_URL}/backups/verify`);
    check(response, {
      'backup endpoint status is 200': (r) => r.status === 200,
      'backup response includes status': (r) => r.body.includes('status'),
      'backup response time < 200ms': (r) => r.timings.duration < 200,
    });
  });
}

/**
 * Main test
 */
export default function () {
  testHealthEndpoint();
  sleep(1);

  testBackupStatus();
  sleep(1);
}

/**
 * Run with: k6 run load-tests/baseline.js
 * 
 * Expected results:
 * - Response time: < 500ms
 * - Error rate: < 10%
 * - Throughput: > 5 req/s
 */
