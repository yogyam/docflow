#!/usr/bin/env node

/**
 * Configuration Test Script
 * Validates that all configuration is working properly
 */

const path = require('path');

// Load configuration
const config = require('./src/config');

console.log('🧪 Testing DocFlow Lite Configuration...\n');

// Test required environment variables
console.log('📋 Required Environment Variables:');
const requiredTests = [
  { name: 'GITHUB_TOKEN', value: config.GITHUB.TOKEN, description: 'GitHub API access' },
  { name: 'GEMINI_API_KEY', value: config.AI.API_KEY, description: 'Google Gemini AI access' },
];

let allPassed = true;

requiredTests.forEach(test => {
  const status = test.value ? '✅ PASS' : '❌ FAIL';
  console.log(`  ${status} ${test.name}: ${test.description}`);
  if (!test.value) allPassed = false;
});

// Test configuration values
console.log('\n⚙️  Configuration Values:');
const configTests = [
  { name: 'Server Port', value: config.SERVER.PORT, expected: 'number' },
  { name: 'Rate Limit Window', value: config.RATE_LIMIT.WINDOW_MS, expected: 'number' },
  { name: 'Rate Limit Max', value: config.RATE_LIMIT.MAX_REQUESTS, expected: 'number' },
  { name: 'GitHub File Limit', value: config.GITHUB.FILE_LIMIT, expected: 'number' },
  { name: 'GitHub Max File Size', value: config.GITHUB.MAX_FILE_SIZE, expected: 'number' },
  { name: 'AI Model', value: config.AI.MODEL, expected: 'string' },
  { name: 'AI Max Retries', value: config.AI.MAX_RETRIES, expected: 'number' },
];

configTests.forEach(test => {
  const actualType = typeof test.value;
  const status = actualType === test.expected ? '✅' : '❌';
  console.log(`  ${status} ${test.name}: ${test.value} (${actualType})`);
  if (actualType !== test.expected) allPassed = false;
});

// Test numeric ranges
console.log('\n📊 Value Range Validation:');
const rangeTests = [
  { name: 'Rate Limit Max', value: config.RATE_LIMIT.MAX_REQUESTS, min: 1, max: 1000 },
  { name: 'GitHub File Limit', value: config.GITHUB.FILE_LIMIT, min: 1, max: 50 },
  { name: 'AI Max Retries', value: config.AI.MAX_RETRIES, min: 1, max: 10 },
  { name: 'Content Truncate Size', value: config.GITHUB.CONTENT_TRUNCATE_SIZE, min: 100, max: 10000 },
];

rangeTests.forEach(test => {
  const inRange = test.value >= test.min && test.value <= test.max;
  const status = inRange ? '✅' : '⚠️ ';
  const rangeText = `[${test.min}-${test.max}]`;
  console.log(`  ${status} ${test.name}: ${test.value} ${rangeText}`);
  if (!inRange) {
    console.log(`    └─ Warning: Value outside recommended range`);
  }
});

// Performance recommendations
console.log('\n🚀 Performance Recommendations:');
const recommendations = [];

if (config.GITHUB.FILE_LIMIT > 20) {
  recommendations.push('Consider reducing GITHUB_FILE_LIMIT to avoid rate limits');
}

if (config.RATE_LIMIT.MAX_REQUESTS < 50) {
  recommendations.push('RATE_LIMIT_MAX_REQUESTS might be too restrictive for normal usage');
}

if (config.AI.MAX_RETRIES > 5) {
  recommendations.push('AI_MAX_RETRIES above 5 may cause long delays');
}

if (recommendations.length === 0) {
  console.log('  ✅ Configuration looks optimal!');
} else {
  recommendations.forEach(rec => {
    console.log(`  ⚠️  ${rec}`);
  });
}

// Final result
console.log('\n' + '='.repeat(50));
if (allPassed) {
  console.log('🎉 Configuration test PASSED! Ready to start DocFlow Lite.');
  process.exit(0);
} else {
  console.log('❌ Configuration test FAILED! Please fix the issues above.');
  process.exit(1);
}