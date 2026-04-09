'use client'

import { useState } from 'react'

export default function InviteButton({ inviteCode, groupName }: { inviteCode: string; groupName: string }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    const url = `${window.location.origin}/join/${inviteCode}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button onClick={copy}
      className="flex items-center gap-2 border border-white/10 hover:border-brand-500/40 text-zinc-300 hover:text-white font-semibold px-4 py-2.5 rounded-xl transition-all text-sm hover:bg-brand-500/10">
      {copied ? (
        <><span>✅</span> Copied!</>
      ) : (
        <><span>🔗</span> Invite friends</>
      )}
    </button>
  )
}
