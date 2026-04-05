import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <main className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 border-b border-zinc-800/60">
        <span className="text-xl font-bold tracking-tight text-white">
          Split<span className="text-brand-400">Easy</span>
        </span>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors px-4 py-2">
            Sign in
          </Link>
          <Link href="/signup" className="text-sm font-medium bg-brand-500 hover:bg-brand-400 text-white px-4 py-2 rounded-lg transition-colors">
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-medium px-3 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-pulse" />
            Free forever for your friend group
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-white mb-6 text-balance leading-tight">
            Split expenses,<br />
            <span className="text-brand-400">not friendships</span>
          </h1>

          <p className="text-lg text-zinc-400 mb-10 max-w-lg mx-auto text-balance">
            Track shared expenses with friends across trips, dinners, and everything in between. 
            Know exactly who owes what — always.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup" className="w-full sm:w-auto text-center font-semibold bg-brand-500 hover:bg-brand-400 text-white px-8 py-3 rounded-xl transition-colors text-base">
              Create free account
            </Link>
            <Link href="/login" className="w-full sm:w-auto text-center text-zinc-400 hover:text-white px-8 py-3 rounded-xl border border-zinc-700 hover:border-zinc-500 transition-colors text-base">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-24 max-w-4xl mx-auto w-full">
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: '👥', title: 'Groups for everything', desc: 'Create separate groups for trips, food, rent — whatever you share.' },
            { icon: '🧮', title: 'Two views of debt', desc: 'See simplified payments (fewest transactions) or exact direct debts.' },
            { icon: '📋', title: 'Full history', desc: 'Every expense and settlement is logged. Nothing ever disappears.' },
          ].map(f => (
            <div key={f.title} className="glass rounded-2xl p-6">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-zinc-800/60 px-6 py-5 text-center text-xs text-zinc-600">
        SplitEasy — built for friend groups, not corporations.
      </footer>
    </main>
  )
}
