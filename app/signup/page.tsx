// @ts-nocheck
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/dashboard'
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const form = e.currentTarget
    const email = form.elements.namedItem('email').value
    const password = form.elements.namedItem('password').value
    const display_name = form.elements.namedItem('display_name').value
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { display_name } } })
    if (error) { setError(error.message); setLoading(false); return }
    router.push(next)
    router.refresh()
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-white">
            <span>✂️</span>
            NoStrings<span className="text-brand-400">Split</span>
          </Link>
          <p className="text-zinc-400 mt-2 text-sm">Join your crew 🎉</p>
        </div>

        <div className="glass rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-1.5">Your name</label>
              <input name="display_name" type="text" required placeholder="What do your friends call you?"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500/60 transition-all text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-1.5">Email</label>
              <input name="email" type="email" required placeholder="you@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500/60 transition-all text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-1.5">Password</label>
              <input name="password" type="password" required minLength={6} placeholder="Min. 6 characters"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500/60 transition-all text-sm" />
            </div>
            {error && (
              <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                {error}
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all text-sm mt-2 shadow-lg shadow-brand-500/20">
              {loading ? 'Creating account...' : "Let's go 🚀"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-zinc-500 mt-6">
          Already have an account?{' '}
          <Link href={`/login?next=${next}`} className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  )
}
