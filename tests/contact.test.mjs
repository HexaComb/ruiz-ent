import assert from 'node:assert/strict';
import { test } from 'node:test';
import { submitContact } from '../src/lib/contact.ts';

const fields = {
  name: 'Test Customer', phone: '(559) 555-0100', email: 'customer@example.com',
  city: 'Kingsburg', projectType: 'Concrete Flatwork & Finishes',
  projectScope: 'Not sure yet', message: 'A patio with steps.\nAccess from the side yard.',
};

function request(overrides = {}, headers = {}) {
  return new Request('https://ruizfamilyhardscapes.biz/api/contact', {
    method: 'POST',
    headers: { Origin: 'https://ruizfamilyhardscapes.biz', ...headers },
    body: new URLSearchParams({ ...fields, ...overrides }),
  });
}

function environment(overrides = {}) {
  return {
    apiKey: 'test-key-not-a-real-secret',
    rateLimiter: { limit: async () => ({ success: true }) },
    ...overrides,
  };
}

const mustNotSend = async () => { assert.fail('Invalid request must not send email'); };

test('sends all details to the fixed recipient with customer reply-to', async () => {
  let calls = 0;
  const response = await submitContact(request({ to: 'attacker@example.com', from: 'attacker@example.com' }), environment(), async (url, options) => {
    calls++;
    assert.equal(url, 'https://api.resend.com/emails');
    assert.equal(options.headers.Authorization, 'Bearer test-key-not-a-real-secret');
    const payload = JSON.parse(options.body);
    assert.equal(payload.from, 'Ruiz Family Hardscapes <submission@ruizfamilyhardscapes.biz>');
    assert.deepEqual(payload.to, ['ruizfamilyent@gmail.com']);
    assert.equal(payload.reply_to, fields.email);
    for (const value of Object.values(fields)) assert.ok(payload.text.includes(value));
    return Response.json({ id: 'email-id' });
  });
  assert.equal(calls, 1);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.equal((await response.json()).sent, true);
});

test('rejects invalid fields without sending', async () => {
  for (const invalid of [
    { name: ' ' }, { email: 'invalid@' }, { email: 'a@example.com\r\nBcc: other@example.com' },
    { phone: '123' }, { city: '' }, { projectType: '' }, { message: 'x'.repeat(5001) },
  ]) {
    assert.equal((await submitContact(request(invalid), environment(), mustNotSend)).status, 400);
  }
});

test('blocks cross-origin submissions, unsupported bodies and oversized streams', async () => {
  assert.equal((await submitContact(request({}, { Origin: 'https://other.example' }), environment(), mustNotSend)).status, 403);
  assert.equal((await submitContact(request({}, { 'Content-Type': 'application/json' }), environment(), mustNotSend)).status, 415);
  assert.equal((await submitContact(request({ message: 'x'.repeat(33000) }), environment(), mustNotSend)).status, 413);
});

test('honeypot does not send mail', async () => {
  const response = await submitContact(request({ website: 'spam' }), environment(), mustNotSend);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).sent, false);
});

test('rate limit uses the Cloudflare client IP and blocks repeated submissions', async () => {
  const env = environment({ rateLimiter: { limit: async ({ key }) => {
    assert.equal(key, '192.0.2.1');
    return { success: false };
  } } });
  assert.equal((await submitContact(request({}, { 'CF-Connecting-IP': '192.0.2.1' }), env, mustNotSend)).status, 429);
});

test('missing secret and provider failures return errors without exposing secrets', async () => {
  for (const apiKey of [undefined, '', '  ']) {
    assert.equal((await submitContact(request(), environment({ apiKey }), mustNotSend)).status, 503);
  }
  for (const send of [
    async () => Response.json({ message: 'private provider diagnostic' }, { status: 403 }),
    async () => { throw new Error('private network diagnostic'); },
  ]) {
    const response = await submitContact(request(), environment(), send);
    assert.equal(response.status, 502);
    const body = await response.text();
    assert.ok(!body.includes('private'));
    assert.ok(!body.includes('test-key'));
  }
});
