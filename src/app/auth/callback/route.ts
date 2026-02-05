import { NextResponse } from 'next/server'
// The client you created in Step 2
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in search params, use it as the redirection URL
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const cookieStore = cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        cookieStore.set({ name, value, ...options })
                    },
                    remove(name: string, options: CookieOptions) {
                        cookieStore.set({ name, value: '', ...options })
                    },
                },
            }
        )
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            // Force Production URL to avoid http/https mismatch causing cookie loss
            const forwardedHost = request.headers.get('x-forwarded-host') // often set by Vercel
            const isProduction = origin.includes('danrit.tech') || (forwardedHost && forwardedHost.includes('danrit.tech'));

            if (isProduction) {
                return NextResponse.redirect(`https://danrit.tech${next}`)
            }

            return NextResponse.redirect(`${origin}${next}`)
        } else {
            console.error('Auth Exchange Error:', error);
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
