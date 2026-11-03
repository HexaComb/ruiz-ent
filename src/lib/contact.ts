const MAX_BODY_BYTES = 32_768;
const FAILURE_MESSAGE = 'We could not send your request. Please try again or call (559) 244-1922.';

function respond(status: number, message: string) {
  return Response.json({ message }, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

async function readForm(request: Request) {
  if (!request.body) return new URLSearchParams();
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new URLSearchParams(new TextDecoder().decode(body));
}

export async function submitContact(
  request: Request,
  { apiKey, rateLimiter }: {
    apiKey: string | undefined;
    rateLimiter: Cloudflare.Env['CONTACT_RATE_LIMITER'];
  },
  send: typeof fetch = fetch,
) {
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) {
    return respond(403, 'Please submit your request from our website.');
  }
  if (request.headers.get('Content-Type')?.split(';')[0].trim() !== 'application/x-www-form-urlencoded') {
    return respond(415, 'Unsupported form format.');
  }

  try {
    const { success } = await rateLimiter.limit({
      key: request.headers.get('CF-Connecting-IP') || 'local',
    });
    if (!success) return respond(429, 'Too many requests. Please wait a minute and try again.');

    const form = await readForm(request);
    if (!form) return respond(413, 'Your request is too large. Please shorten your project details.');
    if (form.get('website')) return respond(200, 'Thank you for your request.');

    const name = form.get('name')?.trim() ?? '';
    const phone = form.get('phone')?.trim() ?? '';
    const email = form.get('email')?.trim() ?? '';
    const city = form.get('city')?.trim() ?? '';
    const projectType = form.get('projectType')?.trim() ?? '';
    const projectScope = form.get('projectScope')?.trim() || 'Not sure yet';
    const message = form.get('message')?.trim() ?? '';

    const shortFields = [name, phone, email, city, projectType, projectScope];
    if (
      shortFields.some(value => !value || value.length > 254 || /[\r\n\x00]/.test(value)) ||
      !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) ||
      phone.length > 40 || phone.replace(/\D/g, '').length < 7 ||
      message.length > 5000
    ) {
      return respond(400, 'Please check your contact information and keep project details under 5,000 characters.');
    }

    if (!apiKey?.trim()) return respond(503, FAILURE_MESSAGE);

    const result = await send('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10_000),
      body: JSON.stringify({
        from: 'Ruiz Family Hardscapes <submission@ruizfamilyhardscapes.biz>',
        to: ['ruizfamilyent@gmail.com'],
        reply_to: email,
        subject: `New estimate request: ${projectType}`,
        text: [
          'New website estimate request',
          '',
          `Name: ${name}`,
          `Phone: ${phone}`,
          `Email: ${email}`,
          `Project city or address: ${city}`,
          `Project type: ${projectType}`,
          `Estimated scope: ${projectScope}`,
          '',
          'Project details:',
          message || 'No additional details provided.',
        ].join('\n'),
      }),
    });

    await result.body?.cancel();
    if (!result.ok) {
      console.error(JSON.stringify({ event: 'contact_email_rejected', status: result.status }));
      return respond(502, FAILURE_MESSAGE);
    }
    return respond(200, 'Thank you! Your estimate request has been sent. Our family team will be in touch.');
  } catch {
    console.error(JSON.stringify({ event: 'contact_submission_failed' }));
    return respond(502, FAILURE_MESSAGE);
  }
}
