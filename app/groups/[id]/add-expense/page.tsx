'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'

type Member = { user_id: string; profiles: { display_name: string; email: string } | null }

const CATEGORIES = [
  { id: 'food', label: 'Food', icon: '🍕' },
  { id: 'drinks', label: 'Drinks', icon: '🍹' },
  { id: 'transport', label: 'Transport', icon: '🚗' },
  { id: 'hotel', label: 'Hotel', icon: '🏨' },
  { id: 'entertainment', label: 'Fun', icon: '🎬' },
  { id: 'other', label: 'Other', icon: '💸' },
]

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
  const [category, setCategory] = useState('other')

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
    setSelectedMembers(prev => prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid])
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
    if (selectedMembers.length === 0) { setError('Select at least one person'); setLoading(false); return }
    if (splitType === 'custom' && Math.abs(customTotal() - amount) > 0.01) {
      setError(`Custom amounts ($${customTotal().toFixed(2)}) must equal total ($${amount.toFixed(2)})`);
      setLoading(false); return
    }
    const supabase = createClient()
    const catIcon = CATEGORIES.find(c => c.id === category)?.icon ?? '💸'
    const { data: expense, error: expErr } = await supabase
      .from('expenses')
      .insert({ group_id: groupId, paid_by: paidBy, title: `${catIcon} ${title}`, amount, split_type: splitType, created_by: currentUserId })
      .select().single()
    if (expErr || !expense) { setError(expErr?.message ?? 'Failed to create expense'); setLoading(false); return }
    const equalShare = amount / selectedMembers.length
    const splits = selectedMembers.map(uid => ({
      expense_id: expense.id, user_id: uid,
      amount: splitType === 'equal' ? equalShare : parseFloat(customAmounts[uid] || '0'),
    }))
    const { error: splitErr } = await supabase.from('expense_splits').insert(splits)
    if (splitErr) { setError(splitErr.message); setLoading(false); return }
    router.push(`/groups/${groupId}`)
    router.refresh()
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/5 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href={`/groups/${groupId}`} className="text-zinc-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex items-center gap-2">
            <span>✂️</span>
            <span className="text-xl font-bold text-white">NoStrings<span className="text-brand-400">Split</span></span>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-white mb-8">Add expense 🧾</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-2">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(cat => (
                <button key={cat.id} type="button" onClick={() => setCategory(cat.id)}
                  className={`flex flex-col items-center gap-1 py-3 rounded-2xl border transition-all text-sm font-medium ${
                    category === cat.id
                      ? 'bg-brand-500/20 border-brand-500/60 text-white scale-105'
                      : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/8'
                  }`}>
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-xs">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-1.5">What was it?</label>
            <input name="title" type="text" required placeholder="e.g. Dinner at Nobu, Airbnb, Gas"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500/60 transition-all text-sm" />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-1.5">Total amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">$</span>
              <input type="number" step="0.01" min="0.01" required placeholder="0.00"
                value={totalAmount} onChange={e => setTotalAmount(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500/60 transition-all text-sm" />
            </div>
          </div>

          {/* Paid by */}
          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-1.5">Who paid?</label>
            <select value={paidBy} onChange={e => setPaidBy(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500/60 transition-all text-sm">
              {members.map(m => (
                <option key={m.user_id} value={m.user_id} className="bg-zinc-900">
                  {m.profiles?.display_name ?? m.profiles?.email ?? m.user_id}
                  {m.user_id === currentUserId ? ' (you)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Split type */}
          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-2">How to split?</label>
            <div className="flex rounded-xl border border-white/10 overflow-hidden">
              {(['equal', 'custom'] as const).map(type => (
                <button key={type} type="button" onClick={() => setSplitType(type)}
                  className={`flex-1 py-2.5 text-sm font-semibold transition-colors capitalize ${
                    splitType === type ? 'bg-brand-500 text-white' : 'text-zinc-400 hover:text-white'
                  }`}>
                  {type === 'equal' ? '⚖️ Equal' : '✏️ Custom'}
                </button>
              ))}
            </div>
          </div>

          {/* Members */}
          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-2">Split between</label>
            <div className="space-y-2">
              {members.map(m => {
                const selected = selectedMembers.includes(m.user_id)
                const name = m.profiles?.display_name ?? m.profiles?.email ?? 'Unknown'
                return (
                  <div key={m.user_id}
                    className={`glass rounded-2xl px-4 py-3 flex items-center justify-between cursor-pointer transition-all ${
                      selected ? 'border-brand-500/30' : ''
                    }`}
                    onClick={() => toggleMember(m.user_id)}>
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                        selected ? 'bg-brand-500 border-brand-500' : 'border-zinc-600'
                      }`}>
                        {selected && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm font-medium text-white">
                        {name}{m.user_id === currentUserId ? ' (you)' : ''}
                      </span>
                    </div>
                    {selected && (
                      <span className="text-sm font-semibold text-brand-300">
                        {splitType === 'equal' ? `$${getEqualShare()}` : (
                          <input type="number" step="0.01" min="0" placeholder="0.00"
                            value={customAmounts[m.user_id] ?? ''}
                            onChange={e => { e.stopPropagation(); setCustomAmounts(prev => ({ ...prev, [m.user_id]: e.target.value })) }}
                            onClick={e => e.stopPropagation()}
                            className="w-24 bg-zinc-800 border border-zinc-600 rounded-lg px-2 py-1 text-white text-right focus:outline-none focus:border-brand-500 text-sm" />
                        )}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
            {splitType === 'custom' && totalAmount && (
              <div className={`mt-2 text-xs px-1 font-medium ${
                Math.abs(customTotal() - parseFloat(totalAmount)) < 0.01 ? 'text-brand-400' : 'text-orange-400'
              }`}>
                Assigned: ${customTotal().toFixed(2)} / Total: ${parseFloat(totalAmount || '0').toFixed(2)}
              </div>
            )}
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</div>
          )}

          <div className="flex gap-3 pt-2">
            <Link href={`/groups/${groupId}`}
              className="flex-1 text-center text-zinc-400 hover:text-white border border-white/10 hover:border-white/20 font-semibold py-3 rounded-xl transition-colors text-sm">
              Cancel
            </Link>
            <button type="submit" disabled={loading}
              className="flex-1 bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all hover:scale-[1.02] text-sm shadow-lg shadow-brand-500/20">
              {loading ? 'Saving...' : 'Add expense 💸'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
