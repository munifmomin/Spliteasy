import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { signOut } from '@/app/auth/actions'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch user's groups
  const { data: memberships } = await supabase
    .from('group_members')
    .select('group_id, role, groups(id, name, description, created_at, invite_code)')
    .eq('user_id', user.id)

  const groups = memberships?.map(m => m.groups).filter(Boolean) ?? []

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, email')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-zinc-800/60 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="text-xl font-bold text-white">
            Split<span className="text-brand-400">Easy</span>
          </span>
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
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Your Groups</h1>
            <p className="text-zinc-400 text-sm mt-1">
              {groups.length === 0 ? 'No groups yet — create one to get started' : `${groups.length} group${groups.length === 1 ? '' : 's'}`}
            </p>
          </div>
          <Link
            href="/groups/new"
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-white font-medium px-4 py-2.5 rounded-xl transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New group
          </Link>
        </div>

        {/* Groups grid */}
        {groups.length === 0 ? (
          <div className="glass rounded-2xl p-16 text-center">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-lg font-semibold text-white mb-2">No groups yet</h3>
            <p className="text-zinc-400 text-sm mb-6">Create a group for a trip, dinner, or anything you share with friends.</p>
            <Link href="/groups/new" className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-white font-medium px-5 py-2.5 rounded-xl transition-colors text-sm">
              Create your first group
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {(groups as NonNullable<typeof groups[0]>[]).map((group: any) => (
              <Link
                key={group.id}
                href={`/groups/${group.id}`}
                className="glass glass-hover rounded-2xl p-6 block"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-brand-500/20 rounded-xl flex items-center justify-center text-lg">
                    {group.name.charAt(0).toUpperCase()}
                  </div>
                  <svg className="w-4 h-4 text-zinc-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <h3 className="font-semibold text-white text-base mb-1">{group.name}</h3>
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
