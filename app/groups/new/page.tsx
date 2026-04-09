// @ts-nocheck
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const GROUP_EMOJIS = ['🏖️', '🍕', '🏠', '✈️', '🎉', '🚗', '🎬', '⚽', '🎵', '🛒']

export default function NewGroupPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedEmoji, setSelectedEmoji] = useState('🏖️')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const form = e.currentTarget
    const name = (form.elements.namedItem('name') as HTMLInputElement).value
    const description = (form.elements.namedItem('description') as HTMLInputElement).value
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert({ name: `${selectedEmoji} ${name}`, description: description || null, created_by: user.id })
      .select().single()

    if (groupError || !group) { setError(groupError?.message ?? 'Failed to create group'); setLoading(false); return }

    const { error: memberError } = await supabase
      .from('group_members')
      .insert({ group_id: group.id, user_id: user.id, role: 'admin' })

    if (memberError) { setError(memberError.message); setLoading(false); return }

    router.push(`/groups/${group.id}`)
    router.refresh()
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/5 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/dashboard" className="text-zinc-400 hover:text-white transition-colors">
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

      <main className="max-w-lg mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Create a group 🎉</h1>
          <p className="text-zinc-400 text-sm">Give it a name — like "Cabo 2025" or "The Food Squad".</p>
        </div>

        <div className="glass rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">Pick an emoji</label>
              <div className="flex flex-wrap gap-2">
                {GROUP_EMOJIS.map(emoji => (
                  <button key={emoji} type="button" onClick={() => setSelectedEmoji(emoji)}
                    className={`w-10 h-10 rounded-xl text-xl transition-all ${
                      selectedEmoji === emoji
                        ? 'bg-brand-500/30 border-2 border-brand-500 scale-110'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}>
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-1.5">Group name</label>
              <input name="name" type="text" required placeholder="e.g. Cabo 2025, Food Squad"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500/60 transition-all text-sm" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-1.5">
                Description <span className="text-zinc-600 font-normal">(optional)</span>
              </label>
              <input name="description" type="text" placeholder="e.g. Spring break trip to Cabo"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500/60 transition-all text-sm" />
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</div>
            )}

            <div className="flex gap-3 pt-2">
              <Link href="/dashboard"
                className="flex-1 text-center text-zinc-400 hover:text-white border border-white/10 hover:border-white/20 font-semibold py-3 rounded-xl transition-colors text-sm">
                Cancel
              </Link>
              <button type="submit" disabled={loading}
                className="flex-1 bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all hover:scale-[1.02] text-sm shadow-lg shadow-brand-500/20">
                {loading ? 'Creating...' : 'Create group 🚀'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
