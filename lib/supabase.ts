import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return document.cookie
            .split('; ')
            .filter(Boolean)
            .map((cookie) => {
              const [name, ...value] = cookie.split('=');
              return { name, value: value.join('=') };
            });
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            const cookieOptions = [];
            if (options?.maxAge) cookieOptions.push(`max-age=${options.maxAge}`);
            if (options?.path) cookieOptions.push(`path=${options.path}`);
            if (options?.domain) cookieOptions.push(`domain=${options.domain}`);
            if (options?.sameSite) cookieOptions.push(`samesite=${options.sameSite}`);
            if (options?.secure) cookieOptions.push('secure');
            
            const cookieString = `${name}=${value}${cookieOptions.length ? '; ' + cookieOptions.join('; ') : ''}`;
            document.cookie = cookieString;
          });
        },
      },
    }
  );
}

