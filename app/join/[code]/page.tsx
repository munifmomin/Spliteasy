// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function JoinPage() {
  const router = useRouter()
  const params = useParams()
  const code = params.code
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    async function join() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push(`/login?next=/join/${code}`)
        return
      }

      const { data: group } = await supabase
        .from('groups')
        .select('id, name')
        .eq('invite_code', code)
        .single()

      if (!group) {
        setStatus('not_found')
        return
      }

      const { data: existing } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', group.id)
        .eq('user_id', user.id)
        .single()

      if (existing) {
        router.push(`/groups/${group.id}`)
        return
      }

      const { error } = await supabase
        .from('group_members')
        .insert({ group_id: group.id, user_id: user.id, role: 'member' })

      if (error) {
        setStatus('error')
        return
      }

      router.push(`/groups/${group.id}`)
    }

    join()
  }, [code, router])

  if (status === 'not_found') {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h1 className="text-xl font-bold text-white mb-2">Invite link not found</h1>
          <p className="text-zinc-400 text-sm">This invite link may be invalid or expired.</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <h1 className="text-xl font-bold text-white mb-2">Something went wrong</h1>
          <p className="text-zinc-400 text-sm mb-4">Could not join the group.</p>
          <Link href="/dashboard" className="text-brand-400 hover:text-brand-300 text-sm">
            Go to dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-pulse">✂️</div>
        <p className="text-zinc-400 text-sm">Joining group...</p>
      </div>
    </div>
  )
}
