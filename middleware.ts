import { createHmac, timingSafeEqual } from 'node:crypto';
import { next } from '@vercel/functions';

declare const process: { env: Record<string, string | undefined> };

const COOKIE_NAME = 'coqui_maintenance_owner';

function secureEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(String(left || ''));
  const rightBuffer = Buffer.from(String(right || ''));
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

function secret() {
  const value = process.env.MAINTENANCE_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET;
  if (!value || value.length < 64) {
    throw new Error('MAINTENANCE_SESSION_SECRET must be configured with at least 64 characters.');
  }
  return value;
}

function expectedOwnerToken() {
  return createHmac('sha256', secret()).update('owner-access').digest('base64url');
}

function cookieValue(request: Request, name: string) {
  const cookieHeader = request.headers.get('cookie') || '';
  return cookieHeader.split(';').reduce((value, cookie) => {
    if (value) return value;
    const split = cookie.indexOf('=');
    if (split === -1 || cookie.slice(0, split).trim() !== name) return '';
    return decodeURIComponent(cookie.slice(split + 1).trim());
  }, '');
}

function hasOwnerAccess(request: Request) {
  return secureEqual(cookieValue(request, COOKIE_NAME), expectedOwnerToken());
}

function isPublicAsset(pathname: string) {
  return pathname.startsWith('/img/')
    || pathname.startsWith('/js/')
    || pathname.startsWith('/css/')
    || pathname === '/favicon.ico'
    || pathname === '/robots.txt'
    || /\.(?:css|js|png|jpe?g|gif|svg|webp|ico|mp4|woff2?)$/i.test(pathname);
}

function shouldBypass(pathname: string) {
  return pathname === '/maintenance'
    || pathname === '/maintenance.html'
    || pathname.startsWith('/api/')
    || pathname === '/admin'
    || pathname.startsWith('/admin/')
    || isPublicAsset(pathname);
}

export const config = {
  matcher: '/(.*)',
  runtime: 'nodejs'
};

export default function middleware(request: Request) {
  if (String(process.env.MAINTENANCE_MODE).toLowerCase() !== 'true') {
    return next();
  }

  const url = new URL(request.url);
  if (shouldBypass(url.pathname) || hasOwnerAccess(request)) {
    return next();
  }

  return Response.redirect(new URL('/maintenance', request.url), 307);
}
