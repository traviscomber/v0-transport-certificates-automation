#!/usr/bin/env node

/**
 * Stress Test - Tests system under heavy load
 * 
 * This test gradually increases load to find system breaking point
 * Run: k6 run load-tests/stress.js
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/api`;

export const options = {
  stages: [
    { duration: '2m', target: 50 }, // Ramp-up to 50 users
    { duration: '2m', target: 100 }, // Increase to 100 users
    { duration: '2m', target: 200 }, // Increase to 200 users
    { duration: '1m', target: 0 }, // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests must complete below 1s
    http_req_failed: ['rate<0.25'], // Allow up to 25% failure under stress
  },
};

export default function () {
  // Simulate multiple concurrent operations
  const responses = http.batch([
    ['GET', `${API_URL}/health`],
    ['GET', `${API_URL}/backups/verify`],
    ['GET', `${API_URL}/health`],
  ]);

  responses.forEach((response) => {
    check(response, {
      'status is 200 or 206': (r) => r.status === 200 || r.status === 206,
      'response time < 1000ms': (r) => r.timings.duration < 1000,
    });
  });

  sleep(1);
}

/**
 * Stress test results indicate:
 * - When error rate starts climbing above 25%
 * - When response times exceed 1000ms consistently
 * - System breaking point and capacity limits
 */
