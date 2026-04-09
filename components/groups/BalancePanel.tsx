// @ts-nocheck
'use client'

import { useState } from 'react'

type Member = { user_id: string; profiles: { display_name: string; email: string } | null }
type Expense = { id: string; paid_by: string; amount: number }
type Split = { expense_id: string; user_id: string; amount: number; is_settled: boolean; expenses: { paid_by: string } }
type Settlement = { paid_by: string; paid_to: string; amount: number }

interface Props {
  expenses: Expense[]
  splits: Split[]
  settlements: Settlement[]
  members: Member[]
  currentUserId: string
  groupId: string
}

function getName(members: Member[], uid: string, currentUserId: string) {
  if (uid === currentUserId) return 'You'
  const m = members.find(m => m.user_id === uid)
  return m?.profiles?.display_name ?? 'Someone'
}

function calcDirectDebts(splits: Split[], settlements: Settlement[], members: Member[], currentUserId: string) {
  const net: Record<string, Record<string, number>> = {}
  for (const split of splits) {
    const debtor = split.user_id
    const creditor = split.expenses?.paid_by
    if (!creditor || debtor === creditor) continue
    if (!net[debtor]) net[debtor] = {}
    net[debtor][creditor] = (net[debtor][creditor] ?? 0) + Number(split.amount)
  }
  for (const s of settlements) {
    if (net[s.paid_by]?.[s.paid_to]) {
      net[s.paid_by][s.paid_to] = Math.max(0, net[s.paid_by][s.paid_to] - Number(s.amount))
    }
  }
  const result: { from: string; to: string; amount: number }[] = []
  for (const [from, tos] of Object.entries(net)) {
    for (const [to, amount] of Object.entries(tos)) {
      if (amount > 0.005) result.push({ from, to, amount })
    }
  }
  return result
}

function calcSimplifiedDebts(splits: Split[], settlements: Settlement[]) {
  const net: Record<string, number> = {}
  for (const split of splits) {
    const debtor = split.user_id
    const creditor = split.expenses?.paid_by
    if (!creditor || debtor === creditor) continue
    net[debtor] = (net[debtor] ?? 0) - Number(split.amount)
    net[creditor] = (net[creditor] ?? 0) + Number(split.amount)
  }
  for (const s of settlements) {
    net[s.paid_by] = (net[s.paid_by] ?? 0) + Number(s.amount)
    net[s.paid_to] = (net[s.paid_to] ?? 0) - Number(s.amount)
  }
  const debtors = Object.entries(net).filter(([, v]) => v < -0.005).map(([id, v]) => ({ id, val: v }))
  const creditors = Object.entries(net).filter(([, v]) => v > 0.005).map(([id, v]) => ({ id, val: v }))
  const txns: { from: string; to: string; amount: number }[] = []
  let i = 0, j = 0
  while (i < debtors.length && j < creditors.length) {
    const d = debtors[i], c = creditors[j]
    const amount = Math.min(-d.val, c.val)
    if (amount > 0.005) txns.push({ from: d.id, to: c.id, amount })
    d.val += amount; c.val -= amount
    if (Math.abs(d.val) < 0.005) i++
    if (Math.abs(c.val) < 0.005) j++
  }
  return txns
}

export default function BalancePanel({ expenses, splits, settlements, members, currentUserId, groupId }: Props) {
  const [view, setView] = useState<'simplified' | 'direct'>('simplified')

  const directDebts = calcDirectDebts(splits, settlements, members, currentUserId)
  const simplifiedDebts = calcSimplifiedDebts(splits, settlements)
  const debts = view === 'simplified' ? simplifiedDebts : directDebts
  const allSettled = debts.length === 0

  return (
    <div className="glass rounded-3xl p-5">
      <div className="flex rounded-xl border border-white/10 overflow-hidden mb-5">
        {(['simplified', 'direct'] as const).map(v => (
          <button key={v} onClick={() => setView(v)}
            className={`flex-1 py-2 text-xs font-bold capitalize transition-colors ${
              view === v ? 'bg-brand-500/30 text-brand-300' : 'text-zinc-500 hover:text-zinc-300'
            }`}>
            {v === 'simplified' ? '✨ Simplified' : '📋 Direct'}
          </button>
        ))}
      </div>

      {allSettled ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🎉</div>
          <p className="text-sm font-semibold text-white">All settled up!</p>
          <p className="text-xs text-zinc-500 mt-1">No one owes anything</p>
        </div>
      ) : (
        <div className="space-y-3">
          {debts.map((d, i) => {
            const fromName = getName(members, d.from, currentUserId)
            const toName = getName(members, d.to, currentUserId)
            const isMyDebt = d.from === currentUserId
            return (
              <div key={i} className={`rounded-2xl px-4 py-3 border ${
                isMyDebt ? 'bg-orange-500/10 border-orange-500/20' : 'bg-white/5 border-white/8'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className={`font-bold ${isMyDebt ? 'text-orange-400' : 'text-white'}`}>
                      {fromName}
                    </span>
                    <span className="text-zinc-500 mx-2">owes</span>
                    <span className="font-bold text-white">{toName}</span>
                  </div>
                  <span className={`text-sm font-bold ${isMyDebt ? 'text-orange-400' : 'text-brand-400'}`}>
                    ${d.amount.toFixed(2)}
                  </span>
                </div>
                {isMyDebt && (
                  <p className="text-xs text-orange-400/60 mt-1">You owe this 💸</p>
                )}
              </div>
            )
          })}
        </div>
      )}

      <p className="text-zinc-600 text-xs mt-4 leading-relaxed">
        {view === 'simplified' ? '✨ Fewest transactions to settle all debts.' : '📋 Exact debts as entered.'}
      </p>
    </div>
  )
}
