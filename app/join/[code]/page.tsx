import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function JoinPage({ params }: { params: { code: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/join/${params.code}`)

  // Find group by invite code
  const { data: group } = await supabase
    .from('groups')
    .select('id, name')
    .eq('invite_code', params.code)
    .single()

  if (!group) {
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

  // Check if already a member
  const { data: existing } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', group.id)
    .eq('user_id', user.id)
    .single()

  if (existing) redirect(`/groups/${group.id}`)

  // Join the group
  await supabase
    .from('group_members')
    .insert({ group_id: group.id, user_id: user.id, role: 'member' })

  redirect(`/groups/${group.id}`)
}
