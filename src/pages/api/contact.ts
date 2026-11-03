import type { APIRoute } from 'astro';
import { getSecret } from 'astro:env/server';
import { env } from 'cloudflare:workers';
import { submitContact } from '../../lib/contact';

export const prerender = false;

export const POST: APIRoute = ({ request }) => submitContact(request, {
  apiKey: getSecret('RESEND_API_KEY'),
  rateLimiter: env.CONTACT_RATE_LIMITER,
});

export const ALL: APIRoute = () => new Response(null, {
  status: 405,
  headers: { Allow: 'POST' },
});
