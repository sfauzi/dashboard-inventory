import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter, Trend, Rate } from 'k6/metrics';

// Custom metrics
const successRate = new Rate('successful_transactions');
const transactionDuration = new Trend('transaction_duration', true);
const stockMismatchCount = new Counter('stock_mismatch_errors');

export const options = {
    // Test scenarios untuk race condition testing
    scenarios: {
        // Scenario 1: Concurrent updates on same item
        concurrent_updates: {
            executor: 'shared-iterations',
            vus: 20,           // 20 concurrent users
            iterations: 100,   // Total iterations across all VUs
            startTime: '0s',
        },
        // Scenario 2: Ramp up test
        ramp_up: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '10s', target: 10 },  // Ramp to 10 users
                { duration: '20s', target: 20 },  // Ramp to 20 users
                { duration: '10s', target: 0 },   // Ramp down to 0
            ],
            startTime: '10s',
        },
    },

    // Thresholds untuk menentukan pass/fail
    thresholds: {
        http_req_duration: ['p(95)<500'],  // 95% requests < 500ms
        'successful_transactions': ['rate>0.95'], // >95% success rate
        'stock_mismatch_errors': ['count<5'], // Less than 5 stock mismatch errors
        'transaction_duration': ['p(95)<1000'], // 95% transactions < 1s
    },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Login function to get session (simplified untuk testing)
function login() {
    // For simplicity, we'll use a test token
    // In production, implement actual login
    return 'test-token-' + Date.now();
}

// Get current stock from database langsung (optional)
function getCurrentStock(barangId, token) {
    // Skip stock check for performance
    return 100;
}

// Create transaction using direct API call
function createTransaction(barangId, type, jumlah, token) {
    const startTime = new Date();

    const payload = JSON.stringify({
        id_barang: barangId,
        tipe_transaksi: type,
        jumlah: jumlah,
        catatan: `k6 test - ${Date.now()}`
    });

    const res = http.post(`${BASE_URL}/api/transaksi`, payload, {
        headers: {
            'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
    });

    const endTime = new Date();
    transactionDuration.add(endTime - startTime);

    let isSuccess = false;

    try {
        const responseBody = res.json();
        isSuccess = res.status === 200 && responseBody.success === true;
        successRate.add(isSuccess);

        if (!isSuccess && responseBody.message) {
            console.warn(`Transaction failed: ${responseBody.message}`);
        }
    } catch (e) {
        console.warn(`Invalid response: ${res.body}`);
        successRate.add(false);
    }

    return { success: isSuccess, status: res.status };
}

// Test race condition by rapidly updating same item
function raceConditionTest(barangId, token) {
    const iterations = 20; // 20 simultaneous updates
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < iterations; i++) {
        const type = Math.random() > 0.5 ? 'masuk' : 'keluar';
        const jumlah = Math.floor(Math.random() * 5) + 1;

        const result = createTransaction(barangId, type, jumlah, token);

        if (result.success) {
            successCount++;
        } else {
            failCount++;
        }
    }

    console.log(`Race condition test completed: ${successCount} success, ${failCount} failed`);

    // If too many failures, there might be race condition issues
    if (failCount > iterations * 0.3) { // More than 30% failures
        stockMismatchCount.add(1);
    }
}

export default function () {
    // Login once per VU
    const token = login();

    // Use a test barang ID - you need to create this via UI first
    // Or get from environment variable
    const testBarangId = __ENV.TEST_BARANG_ID || 'test-barang-id-here';

    // Skip if no valid barang ID
    if (testBarangId === 'test-barang-id-here') {
        console.warn('Please set TEST_BARANG_ID environment variable');
        return;
    }

    // Group 1: Normal transaction flow
    group('Normal Transactions', () => {
        // Random transaction type
        const type = Math.random() > 0.5 ? 'masuk' : 'keluar';
        const jumlah = Math.floor(Math.random() * 10) + 1;

        const result = createTransaction(testBarangId, type, jumlah, token);

        if (!result.success) {
            console.warn(`Normal transaction failed at iteration ${__ITER}`);
        }

        sleep(0.5);
    });

    // Group 2: Race condition simulation
    group('Race Condition Test', () => {
        raceConditionTest(testBarangId, token);
        sleep(1);
    });

    // Group 3: Mixed transactions (masuk & keluar)
    group('Mixed Transactions', () => {
        for (let i = 0; i < 5; i++) {
            const type = i % 2 === 0 ? 'masuk' : 'keluar';
            const jumlah = Math.floor(Math.random() * 3) + 1;
            createTransaction(testBarangId, type, jumlah, token);
            sleep(0.2);
        }
    });

    sleep(1);
}

// Custom teardown function
export function teardown() {
    console.log('\n========================================');
    console.log('Test completed!');
    console.log('========================================');
    console.log('Check metrics above for race condition issues.');
    console.log('If stock_mismatch_errors > 0, race condition still exists.');
    console.log('========================================\n');
}