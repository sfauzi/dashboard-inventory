import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Trend } from 'k6/metrics';

const successCount = new Counter('successful_requests');
const transactionDuration = new Trend('transaction_duration');

export const options = {
    stages: [
        { duration: '30s', target: 20 }, // Ramp up to 20 users
        { duration: '1m', target: 20 },  // Stay at 20 users
        { duration: '10s', target: 0 },   // Ramp down to 0
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% of requests must complete within 500ms
        'failed_requests': ['count<10'],   // Less than 10 failed requests
        'transaction_duration': ['p(95)<1000'],
    },
};

const BASE_URL = 'http://localhost:3000/api';

// Test concurrent stock updates
export default function () {
    const payload = JSON.stringify({
        id_barang: 'test-barang-id',
        tipe_transaksi: Math.random() > 0.5 ? 'masuk' : 'keluar',
        jumlah: Math.floor(Math.random() * 5) + 1,
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${__ENV.TOKEN}`,
        },
    };

    const start = new Date();
    const res = http.post(`${BASE_URL}/transaksi`, payload, params);
    const end = new Date();

    transactionDuration.add(end - start);

    const success = check(res, {
        'status is 200': (r) => r.status === 200,
        'response time < 500ms': (r) => r.timings.duration < 500,
    });

    if (success) {
        successCount.add(1);
    }

    // Test race condition with multiple concurrent updates
    if (__VU === 1 && __ITER === 0) {
        const concurrentPayloads = Array(10).fill(null).map(() => ({
            id_barang: 'test-barang-id',
            tipe_transaksi: 'keluar',
            jumlah: 1,
        }));

        const requests = concurrentPayloads.map(p => ({
            method: 'POST',
            url: `${BASE_URL}/transaksi`,
            body: JSON.stringify(p),
            params: params,
        }));

        const responses = http.batch(requests);

        // Check for race conditions
        let successCount = 0;
        for (const res of responses) {
            if (res.status === 200) successCount++;
        }

        console.log(`Successful concurrent updates: ${successCount}/10`);
    }

    sleep(1);
}