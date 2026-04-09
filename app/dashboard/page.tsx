/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { signOut } from '@/app/auth/actions'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: memberships } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', user.id)

  const groupIds = (memberships ?? []).map((m: any) => m.group_id)

  const { data: groups } = groupIds.length > 0
    ? await supabase.from('groups').select('*').in('id', groupIds)
    : { data: [] }

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, email')
    .eq('id', user.id)
    .single()

  const firstName = profile?.display_name?.split(' ')[0] ?? 'there'

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/5 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">✂️</span>
            <span className="text-xl font-bold text-white">
              NoStrings<span className="text-brand-400">Split</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-400">{profile?.display_name ?? user.email}</span>
            <form action={signOut}>
              <button type="submit" className="text-sm text-zinc-500 hover:text-white transition-colors">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Hey {firstName} 👋</h1>
            <p className="text-zinc-400 text-sm mt-1">
              {!groups || groups.length === 0
                ? 'No groups yet — create one to get started'
                : `You're in ${groups.length} group${groups.length === 1 ? '' : 's'}`}
            </p>
          </div>
          <Link href="/groups/new"
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-white font-semibold px-4 py-2.5 rounded-xl transition-all hover:scale-105 text-sm shadow-lg shadow-brand-500/20">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New group
          </Link>
        </div>

        {!groups || groups.length === 0 ? (
          <div className="glass rounded-3xl p-16 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-lg font-bold text-white mb-2">Start splitting with friends</h3>
            <p className="text-zinc-400 text-sm mb-6 max-w-xs mx-auto">Create a group for your next trip, dinner, or anything you share.</p>
            <Link href="/groups/new"
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:scale-105 text-sm shadow-lg shadow-brand-500/20">
              Create your first group 🚀
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {(groups as any[]).map((group) => (
              <Link key={group.id} href={`/groups/${group.id}`}
                className="glass glass-hover rounded-3xl p-6 block">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-brand-500/15 rounded-2xl flex items-center justify-center text-2xl border border-brand-500/20">
                    🏖️
                  </div>
                  <svg className="w-4 h-4 text-zinc-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <h3 className="font-bold text-white text-base mb-1">{group.name}</h3>
                {group.description && (
                  <p className="text-zinc-400 text-sm truncate">{group.description}</p>
                )}
                <p className="text-zinc-600 text-xs mt-3">
                  Created {new Date(group.created_at).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
