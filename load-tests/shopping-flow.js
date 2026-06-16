import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5037/api';

export const options = {
  vus: 5,
  duration: '2m',
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],
  },
};

function request(method, transaction, url, body, extraParams = {}) {
  const params = {
    tags: { transaction },
    ...extraParams,
  };

  if (method === 'GET') return http.get(url, params);
  if (method === 'POST') return http.post(url, body, params);
  if (method === 'PUT') return http.put(url, body, params);
  if (method === 'DELETE') return http.delete(url, params);
  return null;
}

export default function () {
  const productId = ((__VU - 1) % 5) + 1;
  const uniqueId = `${__VU}-${__ITER}-${Date.now()}`;
  const email = `loadtest-vu${uniqueId}@test.local`;
  const jsonHeaders = { headers: { 'Content-Type': 'application/json' } };

  const registerRes = request(
    'POST',
    'POST /auth/register',
    `${BASE_URL}/auth/register`,
    JSON.stringify({
      firstName: 'Load',
      lastName: `User${__VU}`,
      email,
      password: 'TestPass123!',
      phone: '9876543210',
      address: '123 Test Street',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500001',
    }),
    jsonHeaders
  );

  check(registerRes, { 'register status 200': (r) => r.status === 200 });
  if (registerRes.status !== 200) return;

  const token = registerRes.json('token');
  const authHeaders = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };

  request('GET', 'GET /categories', `${BASE_URL}/categories`, null, jsonHeaders);
  request(
    'GET',
    'GET /products (top-rated)',
    `${BASE_URL}/products?sort=rating&pageSize=8`,
    null,
    jsonHeaders
  );
  request(
    'GET',
    'GET /products (listing)',
    `${BASE_URL}/products?page=1&pageSize=12&sort=price_asc`,
    null,
    jsonHeaders
  );
  request('GET', 'GET /products/{id}', `${BASE_URL}/products/${productId}`, null, jsonHeaders);

  const addCartRes = request(
    'POST',
    'POST /cart',
    `${BASE_URL}/cart`,
    JSON.stringify({ productId, quantity: 1 }),
    authHeaders
  );

  check(addCartRes, { 'add to cart status 200': (r) => r.status === 200 });

  const cartRes = request('GET', 'GET /cart', `${BASE_URL}/cart`, null, authHeaders);

  let cartItemId = null;
  try {
    const cartItems = cartRes.json();
    if (Array.isArray(cartItems) && cartItems.length > 0) {
      cartItemId = cartItems[0].id;
    }
  } catch (_) {
    // ignore parse errors
  }

  if (cartItemId) {
    request(
      'PUT',
      'PUT /cart/{id}',
      `${BASE_URL}/cart/${cartItemId}`,
      JSON.stringify({ quantity: 2 }),
      authHeaders
    );
  }

  request(
    'POST',
    'POST /orders',
    `${BASE_URL}/orders`,
    JSON.stringify({
      shippingAddress: '123 Test Street, Hyderabad, Telangana 500001',
      paymentMethod: 'COD',
    }),
    authHeaders
  );

  request('GET', 'GET /orders', `${BASE_URL}/orders`, null, authHeaders);

  sleep(1);
}

export function handleSummary(data) {
  return {
    'results/k6-summary.json': JSON.stringify(data, null, 2),
  };
}
