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
      <nav className="flex items-center justify-between px-6 py-5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-2xl">✂️</span>
          <span className="text-xl font-bold tracking-tight text-white">
            NoStrings<span className="text-brand-400">Split</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors px-4 py-2">
            Sign in
          </Link>
          <Link href="/signup" className="text-sm font-semibold bg-brand-500 hover:bg-brand-400 text-white px-5 py-2 rounded-xl transition-colors">
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[700px] h-[700px] bg-brand-600/10 rounded-full blur-[140px]" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold px-4 py-2 rounded-full mb-8 tracking-wide uppercase">
            <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-pulse" />
            Made for friend groups
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
            Split bills,<br />
            <span className="text-brand-400">not friendships</span> ✌️
          </h1>

          <p className="text-lg text-zinc-400 mb-10 max-w-lg mx-auto leading-relaxed">
            Track shared expenses across trips, dinners, and everything in between.
            Know exactly who owes what — always. No spreadsheets, no awkward conversations.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup" className="w-full sm:w-auto text-center font-bold bg-brand-500 hover:bg-brand-400 text-white px-8 py-3.5 rounded-2xl transition-all hover:scale-105 text-base shadow-lg shadow-brand-500/20">
              Create free account 🚀
            </Link>
            <Link href="/login" className="w-full sm:w-auto text-center text-zinc-400 hover:text-white px-8 py-3.5 rounded-2xl border border-white/10 hover:border-white/20 transition-colors text-base">
              Already have an account
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-24 max-w-4xl mx-auto w-full">
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: '👥', title: 'Groups for everything', desc: 'Cabo trip, food squad, monthly rent — keep every group separate and organised.' },
            { icon: '🧮', title: 'Smart debt view', desc: 'See the fewest payments needed to settle up, or view exact debts as entered.' },
            { icon: '🧾', title: 'Full history', desc: 'Every expense logged forever. No more "wait who paid for that dinner in March?"' },
          ].map(f => (
            <div key={f.title} className="glass rounded-3xl p-6 hover:border-brand-500/20 transition-colors">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-bold text-white mb-2 text-base">{f.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/5 px-6 py-5 text-center text-xs text-zinc-600">
        NoStringsSplit — built for friend groups, not corporations ✂️
      </footer>
    </main>
  )
}
