'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'

type Member = { user_id: string; profiles: { display_name: string; email: string } | null }

export default function AddExpensePage() {
  const router = useRouter()
  const params = useParams()
  const groupId = params.id as string

  const [members, setMembers] = useState<Member[]>([])
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal')
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({})
  const [totalAmount, setTotalAmount] = useState('')
  const [paidBy, setPaidBy] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setCurrentUserId(user.id)
      setPaidBy(user.id)

      const { data } = await supabase
        .from('group_members')
        .select('user_id, profiles(display_name, email)')
        .eq('group_id', groupId)

      const mems = (data ?? []) as unknown as Member[]
      setMembers(mems)
      setSelectedMembers(mems.map(m => m.user_id))
    }
    load()
  }, [groupId, router])

  function toggleMember(uid: string) {
    setSelectedMembers(prev =>
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    )
  }

  function getEqualShare() {
    const total = parseFloat(totalAmount)
    if (!total || selectedMembers.length === 0) return '0.00'
    return (total / selectedMembers.length).toFixed(2)
  }

  function customTotal() {
    return Object.values(customAmounts).reduce((sum, v) => sum + (parseFloat(v) || 0), 0)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const form = e.currentTarget
    const title = (form.elements.namedItem('title') as HTMLInputElement).value
    const amount = parseFloat(totalAmount)

    if (!amount || amount <= 0) { setError('Enter a valid amount'); setLoading(false); return }
    if (selectedMembers.length === 0) { setError('Select at least one person to split with'); setLoading(false); return }

    if (splitType === 'custom') {
      const ct = customTotal()
      if (Math.abs(ct - amount) > 0.01) {
        setError(`Custom amounts ($${ct.toFixed(2)}) must equal total ($${amount.toFixed(2)})`)
        setLoading(false)
        return
      }
    }

    const supabase = createClient()

    const { data: expense, error: expErr } = await supabase
      .from('expenses')
      .insert({ group_id: groupId, paid_by: paidBy, title, amount, split_type: splitType, created_by: currentUserId })
      .select()
      .single()

    if (expErr || !expense) { setError(expErr?.message ?? 'Failed to create expense'); setLoading(false); return }

    const equalShare = amount / selectedMembers.length
    const splits = selectedMembers.map(uid => ({
      expense_id: expense.id,
      user_id: uid,
      amount: splitType === 'equal' ? equalShare : parseFloat(customAmounts[uid] || '0'),
    }))

    const { error: splitErr } = await supabase.from('expense_splits').insert(splits)
    if (splitErr) { setError(splitErr.message); setLoading(false); return }

    router.push(`/groups/${groupId}`)
    router.refresh()
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-800/60 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href={`/groups/${groupId}`} className="text-zinc-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="text-xl font-bold text-white">Split<span className="text-brand-400">Easy</span></span>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-white mb-8">Add expense</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">What was it for?</label>
            <input
              name="title"
              type="text"
              required
              placeholder="e.g. Dinner at Nobu, Airbnb, Gas"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500 transition-colors text-sm"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Total amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">$</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={totalAmount}
                onChange={e => setTotalAmount(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-8 pr-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500 transition-colors text-sm"
              />
            </div>
          </div>

          {/* Paid by */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Paid by</label>
            <select
              value={paidBy}
              onChange={e => setPaidBy(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-500 transition-colors text-sm"
            >
              {members.map(m => (
                <option key={m.user_id} value={m.user_id}>
                  {m.profiles?.display_name ?? m.profiles?.email ?? m.user_id}
                  {m.user_id === currentUserId ? ' (you)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Split type */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Split method</label>
            <div className="flex rounded-lg border border-zinc-700 overflow-hidden">
              {(['equal', 'custom'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSplitType(type)}
                  className={`flex-1 py-2 text-sm font-medium transition-colors capitalize ${
                    splitType === type ? 'bg-brand-500 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Members */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Split between</label>
            <div className="space-y-2">
              {members.map(m => {
                const selected = selectedMembers.includes(m.user_id)
                const name = m.profiles?.display_name ?? m.profiles?.email ?? 'Unknown'
                return (
                  <div
                    key={m.user_id}
                    className={`glass rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer transition-colors ${
                      selected ? 'border-brand-500/40' : ''
                    }`}
                    onClick={() => toggleMember(m.user_id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        selected ? 'bg-brand-500 border-brand-500' : 'border-zinc-600'
                      }`}>
                        {selected && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm text-white">
                        {name}{m.user_id === currentUserId ? ' (you)' : ''}
                      </span>
                    </div>

                    {selected && (
                      <span className="text-sm font-medium text-zinc-300">
                        {splitType === 'equal' ? (
                          `$${getEqualShare()}`
                        ) : (
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={customAmounts[m.user_id] ?? ''}
                            onChange={e => {
                              e.stopPropagation()
                              setCustomAmounts(prev => ({ ...prev, [m.user_id]: e.target.value }))
                            }}
                            onClick={e => e.stopPropagation()}
                            className="w-24 bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-white text-right focus:outline-none focus:border-brand-500 text-sm"
                          />
                        )}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>

            {splitType === 'custom' && totalAmount && (
              <div className={`mt-2 text-xs px-1 ${
                Math.abs(customTotal() - parseFloat(totalAmount)) < 0.01 ? 'text-brand-400' : 'text-orange-400'
              }`}>
                Assigned: ${customTotal().toFixed(2)} / Total: ${parseFloat(totalAmount || '0').toFixed(2)}
              </div>
            )}
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Link
              href={`/groups/${groupId}`}
              className="flex-1 text-center text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 font-medium py-2.5 rounded-xl transition-colors text-sm"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
            >
              {loading ? 'Saving...' : 'Add expense'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
