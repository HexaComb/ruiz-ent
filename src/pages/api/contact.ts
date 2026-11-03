import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { submitContact } from '../../lib/contact';

export const prerender = false;

export const POST: APIRoute = ({ request }) => submitContact(request, env);

export const ALL: APIRoute = () => new Response(null, {
  status: 405,
  headers: { Allow: 'POST' },
});
