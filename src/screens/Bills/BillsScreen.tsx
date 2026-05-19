'use client';

import { useState } from 'react';
import { TabBar } from '@/src/components/primitives/TabBar';
import { Section } from '@/src/components/primitives/Section';
import { BillsHeader } from './components/BillsHeader';
import { TabSwitcher } from './components/TabSwitcher';
import { MonthSummaryHero } from './components/MonthSummaryHero';
import { BillCard } from './components/BillCard';
import { GoalCard } from './components/GoalCard';
import { BillsSkeleton } from './components/BillsSkeleton';
import { BillsEmpty } from './components/BillsEmpty';
import { SavingsEmpty } from './components/SavingsEmpty';
import { AddBillSheet } from './sheets/AddBillSheet';
import { AddGoalSheet } from './sheets/AddGoalSheet';
import { DepositSheet } from './sheets/DepositSheet';
import { useBills } from './hooks/useBills';
import { useGoals } from './hooks/useGoals';
import type { BillsTab } from './components/TabSwitcher';
import type { SavingsGoal } from '@/src/lib/types';

export function BillsScreen() {
  const { bills, status: billsStatus, togglePaid, addBill } = useBills();
  const { goals, addGoal, deposit } = useGoals();

  const [tab, setTab] = useState<BillsTab>('bills');
  const [addBillOpen, setAddBillOpen] = useState(false);
  const [addGoalOpen, setAddGoalOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | undefined>();

  const openAdd = () => {
    if (tab === 'bills') setAddBillOpen(true);
    else setAddGoalOpen(true);
  };

  const openDeposit = (id: string) => {
    const g = goals.find((x) => x.id === id);
    setSelectedGoal(g);
    setDepositOpen(true);
  };

  const overdue  = bills.filter((b) => !b.paid && new Date(b.dueDate) < new Date('2026-05-19'));
  const allPaid  = bills.length > 0 && bills.every((b) => b.paid);

  return (
    <div className="bg-bg h-full font-sans text-ink relative overflow-hidden flex flex-col">
      <BillsHeader onAdd={openAdd} />
      <TabSwitcher active={tab} onChange={setTab} />

      {billsStatus === 'loading' && <BillsSkeleton />}

      {billsStatus === 'error' && (
        <div className="bg-danger text-white px-5 py-3 text-[14px]">
          Something went wrong. Pull to refresh.
        </div>
      )}

      {billsStatus === 'ready' && (
        <div className="flex-1 overflow-y-auto" style={{ paddingBottom: 110 }}>
          <MonthSummaryHero bills={bills} />

          {tab === 'bills' && (
            <div className="px-5">
              {/* Banners */}
              {overdue.length > 0 && (
                <div className="bg-danger text-white rounded-card px-4 py-3 mb-3 text-[13px] font-semibold flex items-center justify-between">
                  <span>{overdue.length} overdue</span>
                </div>
              )}
              {allPaid && (
                <div className="bg-sage/20 text-ink rounded-card px-4 py-3 mb-3 text-[13px] font-semibold">
                  ✅ You're all caught up for May!
                </div>
              )}

              {bills.length === 0 ? (
                <BillsEmpty onAdd={() => setAddBillOpen(true)} />
              ) : (
                <div className="flex flex-col gap-2.5">
                  {bills.map((b) => (
                    <BillCard key={b.id} bill={b} onTogglePaid={togglePaid} />
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'savings' && (
            <div className="px-5">
              {goals.length === 0 ? (
                <SavingsEmpty onAdd={() => setAddGoalOpen(true)} />
              ) : (
                <Section title="Savings Goals" action="See all" onAction={() => {}}>
                  {goals.map((g) => (
                    <GoalCard key={g.id} goal={g} onDeposit={openDeposit} />
                  ))}
                </Section>
              )}
            </div>
          )}
        </div>
      )}

      <TabBar active="bills" />

      <AddBillSheet
        open={addBillOpen}
        onClose={() => setAddBillOpen(false)}
        onSave={addBill}
      />
      <AddGoalSheet
        open={addGoalOpen}
        onClose={() => setAddGoalOpen(false)}
        onSave={addGoal}
      />
      <DepositSheet
        open={depositOpen}
        onClose={() => setDepositOpen(false)}
        goal={selectedGoal}
        onDeposit={deposit}
      />
    </div>
  );
}
