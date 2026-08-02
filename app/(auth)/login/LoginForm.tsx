"use client"

import { useSearchParams } from 'next/navigation';
import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff } from 'lucide-react'
import { login, signInWithGoogle, signInWithSlack, signInWithX } from "../actions"

const errorMessages: Record<string, string> = {
  'auth-failed': 'Invalid email or password. Please try again.',
  'auth-code-error': 'Authentication failed. Please try again.',
  'oauth-error': 'Sign in failed. Please try again.',
};

const infoMessages: Record<string, string> = {
  'check-email': 'Revisa tu correo para confirmar la cuenta.',
};

export default function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const message = searchParams.get('message');
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)
  const [oauthError, setOauthError] = useState<string | null>(null)

  async function handleOAuth(
    name: string,
    action: () => Promise<{ url?: string; error?: string }>
  ) {
    setOauthError(null)
    setOauthLoading(name)
    try {
      const res = await action()
      if (res?.url) {
        window.location.href = res.url
        return // no limpiamos loading: la página se va
      }
      setOauthError(res?.error ?? 'No se pudo iniciar el acceso.')
    } catch {
      setOauthError('Error de conexión. Inténtalo de nuevo.')
    }
    setOauthLoading(null)
  }

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    try {
      await login(formData)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {error && (
        <div role="alert" className="rounded-md bg-red-50 border border-red-200 p-4 mb-6">
          <p className="text-sm text-red-800">
            {errorMessages[error] || 'An error occurred. Please try again.'}
          </p>
        </div>
      )}
      {message && (
        <div role="status" className="rounded-md bg-blue-50 border border-blue-200 p-4 mb-6">
          <p className="text-sm text-blue-800">
            {infoMessages[message] || message}
          </p>
        </div>
      )}
      {oauthError && (
        <div role="alert" className="rounded-md bg-red-50 border border-red-200 p-4 mb-6">
          <p className="text-sm text-red-800">{oauthError}</p>
        </div>
      )}

      <div className="w-full max-w-[520px] premium-glass rounded-3xl p-8 sm:p-12 shadow-2xl overflow-hidden animate-fade-in"
        style={{ animationDelay: "0.1s" }}
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-[32px] sm:text-[36px] font-extrabold tracking-tight mb-3 text-zinc-950 dark:text-white transition-colors duration-700">
            Welcome Back
          </h2>
          <p className="text-slate-600 dark:text-[#d4d4d8] text-[17px] font-medium leading-relaxed max-w-sm mx-auto transition-colors duration-700">
            Sign in to your Katalog AI dashboard.
          </p>
        </div>

        {/* Form */}
        <form action={handleSubmit} className="space-y-5">
          <input type="hidden" name="redirect" value={searchParams.get('redirect') ?? ''} />
          <div>
            <label htmlFor="email" className="block text-[13px] font-bold tracking-widest uppercase mb-2 ml-1 text-[#d4d4d8]">
              Work Email
            </label>
            <input
              id="email" name="email" type="email" placeholder="name@company.com" required
              className="w-full bg-black/40 dark:bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-[17px] text-white placeholder:text-white/20 focus:ring-2 focus:ring-[#10b77f]/40 focus:border-[#10b77f]/50 outline-none transition-all duration-300 font-medium"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2 ml-1">
              <label htmlFor="password" className="block text-[13px] font-bold tracking-widest uppercase text-[#d4d4d8]">
                Password
              </label>
              <Link href="/forgot-password" className="text-[13px] font-bold tracking-widest uppercase text-[#10b77f] hover:opacity-80 transition-opacity">
                Forgot Password?
              </Link>
            </div>
            <div className="relative group/pass">
              <input
                id="password" name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" required
                className="w-full bg-black/40 dark:bg-black/40 border border-white/10 rounded-xl px-5 py-4 pr-12 text-[17px] text-white placeholder:text-white/20 focus:ring-2 focus:ring-[#10b77f]/40 focus:border-[#10b77f]/50 outline-none transition-all duration-300 font-medium"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 flex items-center justify-center text-[#d4d4d8]/40 hover:text-[#10b77f] transition-all duration-300 focus:outline-none pass-toggle"
                aria-label="Toggle password visibility">
                {showPassword ? <EyeOff className="text-[20px] notranslate" /> : <Eye className="text-[20px] notranslate" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={isLoading}
            className="w-full bg-[#10b77f] text-black font-extrabold py-4 rounded-xl mt-2 neural-glow-btn text-[18px] tracking-wider shadow-lg shadow-[#10b77f]/30">
            {isLoading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <div className="relative flex items-center my-8">
          <div className="flex-grow border-t border-slate-200 dark:border-white/10" />
          <span className="flex-shrink mx-4 text-[13px] font-bold tracking-widest uppercase text-slate-400 dark:text-[#d4d4d8]/40">
            Or continue with
          </span>
          <div className="flex-grow border-t border-slate-200 dark:border-white/10" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            disabled={oauthLoading !== null}
            onClick={() => handleOAuth('google', signInWithGoogle)}
            aria-busy={oauthLoading === 'google'}
            aria-label="Sign in with Google"
            className="social-btn w-full flex items-center justify-center py-3.5 rounded-xl"
          >
            <svg className="w-5 h-5 relative z-10" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          </button>
          <button
            type="button"
            disabled={oauthLoading !== null}
            onClick={() => handleOAuth('slack', signInWithSlack)}
            aria-busy={oauthLoading === 'slack'}
            aria-label="Sign in with Slack"
            className="social-btn w-full flex items-center justify-center py-3.5 rounded-xl"
          >
            <svg className="w-5 h-5 relative z-10" viewBox="0 0 122.8 122.8">
              <path d="M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9v12.9zm6.4 0c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V77.6z" fill="#36C5F0" />
              <path d="M45.2 25.8c-7.1 0-12.9-5.8-12.9-12.9S38.1 0 45.2 0s12.9 5.8 12.9 12.9v12.9H45.2zm0 6.4c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58.1 0 52.3 0 45.2s5.8-12.9 12.9-12.9h32.3z" fill="#2EB67D" />
              <path d="M97 45.2c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97V45.2zm-6.4 0c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C77.6 5.8 83.4 0 90.5 0s12.9 5.8 12.9 12.9v32.3z" fill="#E01E5A" />
              <path d="M77.6 97c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97h12.9zm0-6.4c-7.1 0-12.9-5.8-12.9-12.9s5.8 12.9-12.9 12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H77.6z" fill="#ECB22E" />
            </svg>
          </button>
          <button
            type="button"
            disabled={oauthLoading !== null}
            onClick={() => handleOAuth('x', signInWithX)}
            aria-busy={oauthLoading === 'x'}
            aria-label="Sign in with X"
            className="social-btn w-full flex items-center justify-center py-3.5 rounded-xl text-zinc-950 dark:text-white"
          >
            <svg className="w-4 h-4 relative z-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[17px] text-slate-600 dark:text-[#d4d4d8] font-medium transition-colors duration-700">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[#10b77f] font-bold hover:underline transition-all">
              Sign Up for Free
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}
