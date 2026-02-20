const https = require('https');

const BASE_HOST =
  process.env.MPESA_ENV === 'production'
    ? 'api.safaricom.co.ke'
    : 'sandbox.safaricom.co.ke';

// Sandbox defaults — override with env vars in production
const SHORTCODE = process.env.MPESA_SHORTCODE || '174379';
const PASSKEY =
  process.env.MPESA_PASSKEY ||
  'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';

function httpsRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); }
        catch { reject(new Error(`Invalid JSON from M-Pesa: ${raw}`)); }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function getAccessToken() {
  const key = process.env.MPESA_CONSUMER_KEY;
  const secret = process.env.MPESA_CONSUMER_SECRET;
  if (!key || !secret) throw new Error('MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET are required');

  const credentials = Buffer.from(`${key}:${secret}`).toString('base64');
  const data = await httpsRequest({
    hostname: BASE_HOST,
    path: '/oauth/v1/generate?grant_type=client_credentials',
    method: 'GET',
    headers: { Authorization: `Basic ${credentials}` },
  });
  if (!data.access_token) throw new Error(`M-Pesa auth failed: ${JSON.stringify(data)}`);
  return data.access_token;
}

function getTimestamp() {
  const now = new Date();
  const p = (n) => n.toString().padStart(2, '0');
  return `${now.getFullYear()}${p(now.getMonth() + 1)}${p(now.getDate())}${p(now.getHours())}${p(now.getMinutes())}${p(now.getSeconds())}`;
}

function normalizePhone(phone) {
  return phone.replace(/^\+/, '').replace(/^0/, '254');
}

async function initiateSTKPush({ phone, amount, accountRef, description }) {
  const token = await getAccessToken();
  const timestamp = getTimestamp();
  const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString('base64');
  const callbackUrl = process.env.MPESA_CALLBACK_URL;
  if (!callbackUrl) throw new Error('MPESA_CALLBACK_URL is required');

  const payload = JSON.stringify({
    BusinessShortCode: SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.ceil(amount),
    PartyA: normalizePhone(phone),
    PartyB: SHORTCODE,
    PhoneNumber: normalizePhone(phone),
    CallBackURL: callbackUrl,
    AccountReference: accountRef,
    TransactionDesc: description,
  });

  const data = await httpsRequest({
    hostname: BASE_HOST,
    path: '/mpesa/stkpush/v1/processrequest',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    },
  }, payload);

  return data;
}

module.exports = { initiateSTKPush };
