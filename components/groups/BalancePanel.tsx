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

// Direct debts: aggregate raw splits
function calcDirectDebts(splits: Split[], settlements: Settlement[], members: Member[], currentUserId: string) {
  // net[debtor][creditor] = amount
  const net: Record<string, Record<string, number>> = {}

  for (const split of splits) {
    const debtor = split.user_id
    const creditor = split.expenses?.paid_by
    if (!creditor || debtor === creditor) continue
    if (!net[debtor]) net[debtor] = {}
    net[debtor][creditor] = (net[debtor][creditor] ?? 0) + Number(split.amount)
  }

  for (const s of settlements) {
    const { paid_by, paid_to, amount } = s
    if (net[paid_by]?.[paid_to]) {
      net[paid_by][paid_to] = Math.max(0, net[paid_by][paid_to] - Number(amount))
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

// Simplified debts: minimize number of transactions
function calcSimplifiedDebts(splits: Split[], settlements: Settlement[], members: Member[]) {
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
    d.val += amount
    c.val -= amount
    if (Math.abs(d.val) < 0.005) i++
    if (Math.abs(c.val) < 0.005) j++
  }

  return txns
}

export default function BalancePanel({ expenses, splits, settlements, members, currentUserId, groupId }: Props) {
  const [view, setView] = useState<'simplified' | 'direct'>('simplified')

  const directDebts = calcDirectDebts(splits, settlements, members, currentUserId)
  const simplifiedDebts = calcSimplifiedDebts(splits, settlements, members)
  const debts = view === 'simplified' ? simplifiedDebts : directDebts

  const allSettled = debts.length === 0

  return (
    <div className="glass rounded-2xl p-5">
      {/* Toggle */}
      <div className="flex rounded-lg border border-zinc-700 overflow-hidden mb-5">
        {(['simplified', 'direct'] as const).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`flex-1 py-2 text-xs font-medium capitalize transition-colors ${
              view === v ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {allSettled ? (
        <div className="text-center py-6">
          <div className="text-2xl mb-2">🎉</div>
          <p className="text-sm text-zinc-400">All settled up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {debts.map((d, i) => {
            const fromName = getName(members, d.from, currentUserId)
            const toName = getName(members, d.to, currentUserId)
            const isMyDebt = d.from === currentUserId
            return (
              <div key={i} className="rounded-xl bg-zinc-900/60 px-4 py-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm">
                    <span className={`font-semibold ${isMyDebt ? 'text-orange-400' : 'text-white'}`}>
                      {fromName}
                    </span>
                    <span className="text-zinc-500 mx-1.5">→</span>
                    <span className="font-semibold text-white">{toName}</span>
                  </div>
                  <span className={`text-sm font-bold ${isMyDebt ? 'text-orange-400' : 'text-brand-400'}`}>
                    ${d.amount.toFixed(2)}
                  </span>
                </div>
                {isMyDebt && (
                  <p className="text-xs text-orange-400/70">You owe this</p>
                )}
              </div>
            )
          })}
        </div>
      )}

      <p className="text-zinc-600 text-xs mt-4 leading-relaxed">
        {view === 'simplified'
          ? 'Fewest transactions to settle all debts.'
          : 'Exact debts as entered, per payer.'}
      </p>
    </div>
  )
}
