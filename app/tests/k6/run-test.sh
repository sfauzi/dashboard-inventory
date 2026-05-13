#!/bin/bash

# Script untuk menjalankan k6 tests

# Set variables
BASE_URL="${BASE_URL:-http://localhost:3000}"
TEST_USERNAME="${TEST_USERNAME:-admin}"
TEST_PASSWORD="${TEST_PASSWORD:-password}"
TEST_DURATION="${TEST_DURATION:-60s}"

echo "=========================================="
echo "Starting k6 Load Tests"
echo "=========================================="
echo "Base URL: $BASE_URL"
echo "Test User: $TEST_USERNAME"
echo "Test Duration: $TEST_DURATION"
echo "=========================================="

# Run k6 test
k6 run \
  --vus 20 \
  --duration $TEST_DURATION \
  --out json=test-results.json \
  -e BASE_URL=$BASE_URL \
  -e TEST_USERNAME=$TEST_USERNAME \
  -e TEST_PASSWORD=$TEST_PASSWORD \
  tests/k6/transaksi-test.js

# Check exit code
if [ $? -eq 0 ]; then
  echo "✅ Tests passed!"
else
  echo "❌ Tests failed!"
  exit 1
fi

# Optionally, run with Docker
# docker run --rm -i \
#   -e BASE_URL=$BASE_URL \
#   -e TEST_USERNAME=$TEST_USERNAME \
#   -e TEST_PASSWORD=$TEST_PASSWORD \
#   -v $(pwd)/tests/k6:/k6 \
#   grafana/k6 run /k6/transaksi-test.js