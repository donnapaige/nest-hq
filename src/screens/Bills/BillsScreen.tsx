'use client';

import { useState } from 'react';
import { TabBar } from '@/src/components/primitives/TabBar';
import { Section } from '@/src/components/primitives/Section';
import { useHousehold } from '@/src/context/HouseholdContext';
import { BillsHeader } from './components/BillsHeader';
import { TabSwitcher } from './components/TabSwitcher';
import { MonthSummaryHero } from './components/MonthSummaryHero';
import { BillCard } from './components/BillCard';
import { GoalCard } from './components/GoalCard';
import { BillsSkeleton } from './components/BillsSkeleton';
import { BillsEmpty } from './components/BillsEmpty';
import { SavingsEmpty } from './components/SavingsEmpty';
import { AddBillSheet } from './sheets/AddBillSheet';
import { EditBillSheet } from './sheets/EditBillSheet';
import { AddGoalSheet } from './sheets/AddGoalSheet';
import { DepositSheet } from './sheets/DepositSheet';
import { AddFuelSheet } from './sheets/AddFuelSheet';
import { useBills } from './hooks/useBills';
import { useGoals } from './hooks/useGoals';
import { useFuelLog } from './hooks/useFuelLog';
import type { BillsTab } from './components/TabSwitcher';
import type { Bill, SavingsGoal } from '@/src/lib/types';

export function BillsScreen() {
  const { formatMoney } = useHousehold();
  const { bills, status: billsStatus, togglePaid, addBill, updateBill, updateAmount } = useBills();
  const { goals, addGoal, deposit, deleteGoal }             = useGoals();
  const { logs, loading: fuelLoading, addLog, deleteLog, totalSpent, totalLiters, avgPrice } = useFuelLog();

  const [tab,         setTab]        = useState<BillsTab>('bills');
  const [addBillOpen, setAddBillOpen]= useState(false);
  const [editBillOpen,setEditBillOpen]=useState(false);
  const [editingBill, setEditingBill]= useState<Bill | null>(null);
  const [addGoalOpen, setAddGoalOpen]= useState(false);
  const [depositOpen, setDepositOpen]= useState(false);
  const [addFuelOpen, setAddFuelOpen]= useState(false);
  const [selectedGoal,setSelectedGoal]=useState<SavingsGoal | undefined>();

  const openEditBill = (bill: Bill) => { setEditingBill(bill); setEditBillOpen(true); };

  const openAdd = () => {
    if (tab === 'bills')   setAddBillOpen(true);
    else if (tab === 'savings') setAddGoalOpen(true);
    else setAddFuelOpen(true);
  };

  const openDeposit = (id: string) => {
    const g = goals.find((x) => x.id === id);
    setSelectedGoal(g);
    setDepositOpen(true);
  };

  const today   = new Date().toISOString().split('T')[0];
  const overdue = bills.filter((b) => !b.paid && b.dueDate < today);
  const allPaid = bills.length > 0 && bills.every((b) => b.paid);

  return (
    <div className="bg-bg h-full font-sans text-ink relative overflow-hidden flex flex-col">
      <BillsHeader onAdd={openAdd} />
      <TabSwitcher active={tab} onChange={setTab} />

      {billsStatus === 'loading' && tab !== 'fuel' && <BillsSkeleton />}

      {billsStatus === 'error' && (
        <div className="bg-danger text-white px-5 py-3 text-[14px]">
          Something went wrong. Pull to refresh.
        </div>
      )}

      {(billsStatus === 'ready' || tab === 'fuel') && (
        <div className="flex-1 overflow-y-auto" style={{ paddingBottom: 110 }}>
          {tab !== 'fuel' && <MonthSummaryHero bills={bills} />}

          {tab === 'bills' && (
            <div className="px-5">
              {overdue.length > 0 && (
                <div className="bg-danger text-white rounded-card px-4 py-3 mb-3 text-[13px] font-semibold flex items-center justify-between">
                  <span>{overdue.length} overdue</span>
                </div>
              )}
              {allPaid && (
                <div className="bg-sage/20 text-ink rounded-card px-4 py-3 mb-3 text-[13px] font-semibold">
                  ✅ You're all caught up!
                </div>
              )}
              {bills.length === 0 ? (
                <BillsEmpty onAdd={() => setAddBillOpen(true)} />
              ) : (
                <div className="flex flex-col gap-2.5">
                  {bills.map((b) => (
                    <BillCard key={b.id} bill={b} onTogglePaid={togglePaid} onUpdateAmount={updateAmount} onEdit={openEditBill} />
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
                    <GoalCard key={g.id} goal={g} onDeposit={openDeposit} onDelete={deleteGoal} />
                  ))}
                </Section>
              )}
            </div>
          )}

          {tab === 'fuel' && (
            <div className="px-5 mt-4">
              {/* Summary stats */}
              {logs.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="rounded-[14px] p-3 text-center" style={{ background: '#FBF8F1', border: '1px solid #E8DFCB' }}>
                    <p style={{ fontSize: 11, color: '#8A7E6B', fontWeight: 700 }}>TOTAL SPENT</p>
                    <p style={{ fontSize: 16, fontWeight: 800, color: '#334266' }}>{formatMoney(totalSpent)}</p>
                  </div>
                  <div className="rounded-[14px] p-3 text-center" style={{ background: '#FBF8F1', border: '1px solid #E8DFCB' }}>
                    <p style={{ fontSize: 11, color: '#8A7E6B', fontWeight: 700 }}>LITERS</p>
                    <p style={{ fontSize: 16, fontWeight: 800, color: '#334266' }}>{totalLiters.toFixed(1)}L</p>
                  </div>
                  <div className="rounded-[14px] p-3 text-center" style={{ background: '#FBF8F1', border: '1px solid #E8DFCB' }}>
                    <p style={{ fontSize: 11, color: '#8A7E6B', fontWeight: 700 }}>AVG/LITER</p>
                    <p style={{ fontSize: 16, fontWeight: 800, color: '#334266' }}>{formatMoney(avgPrice)}</p>
                  </div>
                </div>
              )}

              {fuelLoading ? (
                <div className="flex flex-col gap-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 rounded-[14px] animate-pulse" style={{ background: '#E8DFCB' }} />
                  ))}
                </div>
              ) : logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p style={{ fontSize: 40 }}>⛽</p>
                  <p style={{ fontSize: 17, fontWeight: 700, color: '#334266', marginTop: 12 }}>No fuel logs yet</p>
                  <p style={{ fontSize: 13, color: '#8A7E6B', marginTop: 6 }}>Track your fuel fill-ups to monitor spending.</p>
                  <button
                    onClick={() => setAddFuelOpen(true)}
                    className="mt-5 px-6 py-2.5 rounded-full font-bold text-sm text-white"
                    style={{ background: '#334266', border: 'none', cursor: 'pointer' }}
                  >
                    Log first fill-up
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {logs.map((log) => (
                    <div key={log.id} className="rounded-[14px] px-4 py-3.5 flex items-start gap-3" style={{ background: '#FBF8F1', border: '1px solid #E8DFCB' }}>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#F0E5D2', fontSize: 20 }}>
                        ⛽
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p style={{ fontSize: 15, fontWeight: 700, color: '#1E1E2E' }}>
                            {log.vehicleName || 'Vehicle'}
                          </p>
                          <p style={{ fontSize: 15, fontWeight: 800, color: '#334266' }}>
                            {formatMoney(log.totalCost)}
                          </p>
                        </div>
                        <p style={{ fontSize: 12, color: '#8A7E6B', marginTop: 2 }}>
                          {log.liters}L · {formatMoney(log.pricePerLiter)}/L
                          {log.odometer ? ` · ${log.odometer.toLocaleString()} km` : ''}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p style={{ fontSize: 11, color: '#9BA3AF' }}>
                            {new Date(log.fuelDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                          <button
                            onClick={() => deleteLog(log.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C65A3A', fontSize: 11, fontWeight: 700 }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
      <EditBillSheet
        open={editBillOpen}
        bill={editingBill}
        onClose={() => { setEditBillOpen(false); setEditingBill(null); }}
        onSave={updateBill}
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
      <AddFuelSheet
        open={addFuelOpen}
        onClose={() => setAddFuelOpen(false)}
        onSave={addLog}
      />
    </div>
  );
}
