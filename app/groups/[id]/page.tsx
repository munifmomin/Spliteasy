// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { signOut } from '@/app/auth/actions'
import InviteButton from '@/components/groups/InviteButton'
import BalancePanel from '@/components/groups/BalancePanel'

export default async function GroupPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: group } = await supabase
    .from('groups')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!group) notFound()

  const { data: membership } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!membership) redirect('/dashboard')

  const { data: membersRaw } = await supabase
    .from('group_members')
    .select('user_id, role, profiles(id, display_name, email)')
    .eq('group_id', params.id)

  const members = membersRaw ?? []

  const { data: expenses } = await supabase
    .from('expenses')
    .select('*, profiles!expenses_paid_by_fkey(display_name)')
    .eq('group_id', params.id)
    .order('created_at', { ascending: false })

  const { data: splits } = await supabase
    .from('expense_splits')
    .select('*, expenses!inner(group_id, paid_by)')
    .eq('expenses.group_id', params.id)

  const { data: settlements } = await supabase
    .from('settlements')
    .select('*')
    .eq('group_id', params.id)
    .eq('confirmed', true)

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/5 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-zinc-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex items-center gap-2">
              <span>✂️</span>
              <span className="text-xl font-bold text-white">
                NoStrings<span className="text-brand-400">Split</span>
              </span>
            </div>
          </div>
          <form action={signOut}>
            <button type="submit" className="text-sm text-zinc-500 hover:text-white transition-colors">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">{group.name}</h1>
            {group.description && (
              <p className="text-zinc-400 text-sm mt-1">{group.description}</p>
            )}
            <p className="text-zinc-600 text-xs mt-2">
              {members.length} member{members.length === 1 ? '' : 's'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <InviteButton inviteCode={group.invite_code} groupName={group.name} />
            <Link
              href={`/groups/${params.id}/add-expense`}
              className="flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-white font-semibold px-4 py-2.5 rounded-xl transition-all hover:scale-105 text-sm shadow-lg shadow-brand-500/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add expense
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Expenses</h2>
            {!expenses || expenses.length === 0 ? (
              <div className="glass rounded-3xl p-10 text-center">
                <div className="text-3xl mb-3">🧾</div>
                <p className="text-zinc-400 text-sm">No expenses yet.</p>
                <Link
                  href={`/groups/${params.id}/add-expense`}
                  className="inline-block mt-4 text-brand-400 hover:text-brand-300 text-sm font-semibold transition-colors"
                >
                  Add the first one →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {(expenses as any[]).map((expense) => {
                  const payer = expense.profiles?.display_name ?? 'Someone'
                  const isMe = expense.paid_by === user.id
                  return (
                    <div key={expense.id} className="glass rounded-2xl px-5 py-4 flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="font-semibold text-white text-sm truncate">{expense.title}</p>
                        <p className="text-zinc-500 text-xs mt-0.5">
                          {isMe ? 'You' : payer} paid &middot; {new Date(expense.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right ml-4 shrink-0">
                        <p className="font-bold text-white text-sm">${Number(expense.amount).toFixed(2)}</p>
                        <p className="text-zinc-600 text-xs capitalize">{expense.split_type} split</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Balances</h2>
            <BalancePanel
              expenses={expenses ?? []}
              splits={splits ?? []}
              settlements={settlements ?? []}
              members={members}
              currentUserId={user.id}
              groupId={params.id}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
