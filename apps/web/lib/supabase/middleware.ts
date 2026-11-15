import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(
              name,
              value,
              options as Parameters<typeof supabaseResponse.cookies.set>[2],
            ),
          );
        },
      },
    },
  );

  // Safely get user with a timeout to prevent middleware invocation timeouts
  // if Supabase Auth is paused, slow, or unreachable.
  let user = null;
  try {
    const userPromise = supabase.auth.getUser();
    const timeoutPromise = new Promise<{ data: { user: null } }>((_, reject) =>
      setTimeout(() => reject(new Error('Auth request timeout')), 2500),
    );
    const result = await Promise.race([userPromise, timeoutPromise]);
    user = result?.data?.user ?? null;
  } catch (err) {
    console.warn('[middleware] Supabase auth check failed or timed out:', err);
    user = null;
  }

  // Route protection
  const isAuthRoute =
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/register');

  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard');

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
