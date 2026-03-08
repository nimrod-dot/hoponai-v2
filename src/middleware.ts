import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/onboard(.*)',
  '/settings(.*)',
  '/api/walkthroughs(.*)',
  '/api/teams(.*)',
  '/api/extension(.*)',
]);

const isPublicRoute = createRouteMatcher([
  '/',
  '/solutions(.*)',
  '/pricing',
  '/contact-sales',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/api/sales-inquiry',
  // Extension endpoints handle their own auth (cookie OR Bearer token)
  '/dashboard/extension/auth',
  '/dashboard/extension/walkthroughs',
  '/api/extension/token',
  '/api/sarah/chat',
  '/api/sarah/play',
  '/play(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req) && !isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};