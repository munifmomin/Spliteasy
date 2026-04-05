'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function NewGroupPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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

    // Create group
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert({ name, description: description || null, created_by: user.id })
      .select()
      .single()

    if (groupError || !group) {
      setError(groupError?.message ?? 'Failed to create group')
      setLoading(false)
      return
    }

    // Add creator as admin member
    const { error: memberError } = await supabase
      .from('group_members')
      .insert({ group_id: group.id, user_id: user.id, role: 'admin' })

    if (memberError) {
      setError(memberError.message)
      setLoading(false)
      return
    }

    router.push(`/groups/${group.id}`)
    router.refresh()
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-800/60 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/dashboard" className="text-zinc-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="text-xl font-bold text-white">
            Split<span className="text-brand-400">Easy</span>
          </span>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Create a group</h1>
          <p className="text-zinc-400 text-sm">Give your group a name — like "Cabo Trip" or "Food Squad".</p>
        </div>

        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Group name</label>
              <input
                name="name"
                type="text"
                required
                placeholder="e.g. Cabo 2025, Food Squad"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500 transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                Description <span className="text-zinc-600 font-normal">(optional)</span>
              </label>
              <input
                name="description"
                type="text"
                placeholder="e.g. Spring break trip to Cabo"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500 transition-colors text-sm"
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Link
                href="/dashboard"
                className="flex-1 text-center text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 font-medium py-2.5 rounded-xl transition-colors text-sm"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
              >
                {loading ? 'Creating...' : 'Create group'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
