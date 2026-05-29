'use client';

import { useState, useRef, useCallback } from 'react';
import { TabBar } from '@/src/components/primitives/TabBar';
import { useHousehold } from '@/src/context/HouseholdContext';
import { useShoppingLists, SHOPPING_CATEGORIES } from './hooks/useShoppingLists';
import { useHouseholdTasks } from './hooks/useHouseholdTasks';
import type { ShoppingList } from './hooks/useShoppingLists';

type ShopTab = 'shopping' | 'tasks';

export function ShoppingScreen() {
  const { lists, status, createList, deleteList, addItem, toggleItem, deleteItem } = useShoppingLists();
  const { tasks, loading: tasksLoading, addTask, toggleTask, deleteTask } = useHouseholdTasks();
  const { members } = useHousehold();

  const [tab,           setTab]          = useState<ShopTab>('shopping');
  const [newTaskTitle,  setNewTaskTitle]  = useState('');
  const [newTaskMember, setNewTaskMember] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [catFilter,  setCatFilter]  = useState<Record<string, string>>({}); // listId → category
  const [newListVal, setNewListVal] = useState('');
  const [showNewList,setShowNewList]= useState(false);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const quickAddVals = useRef<Record<string, string>>({});
  const [, forceUpdate] = useState(0);

  const toggle = (id: string) => setExpandedId((prev) => (prev === id ? null : id));

  const handleQuickAdd = useCallback(async (list: ShoppingList, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    const val = quickAddVals.current[list.id]?.trim();
    if (!val) return;
    const cat = catFilter[list.id] ?? 'General';
    quickAddVals.current[list.id] = '';
    forceUpdate((n) => n + 1);
    await addItem(list.id, val, cat === 'General' ? 'General' : cat);
    // keep input focused for rapid entry
    setTimeout(() => inputRefs.current[list.id]?.focus(), 50);
  }, [addItem, catFilter]);

  const handleNewList = async () => {
    if (!newListVal.trim()) return;
    const id = await createList(newListVal);
    setNewListVal('');
    setShowNewList(false);
    if (id) setExpandedId(id);
  };

  const remaining = (list: ShoppingList) => list.items.filter((i) => !i.done).length;
  const total     = (list: ShoppingList) => list.items.length;
  const progress  = (list: ShoppingList) => total(list) === 0 ? 0 : (total(list) - remaining(list)) / total(list);

  return (
    <div className="bg-bg h-full font-sans text-ink relative flex flex-col">
      {/* Header */}
      <div className="px-5 pt-14 pb-3">
        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#1E1E2E', lineHeight: 1.1 }}>Lists</h1>
        <p style={{ fontSize: 13, color: '#8A7E6B', marginTop: 2 }}>Shopping &amp; Tasks</p>
      </div>

      {/* Tab switcher */}
      <div className="flex mx-5 mb-4 rounded-full overflow-hidden p-1 gap-1" style={{ background: '#EDE8DF' }}>
        <button
          onClick={() => setTab('shopping')}
          className="flex-1 py-2 text-[13px] font-bold rounded-full border-none cursor-pointer transition-all"
          style={{ background: tab === 'shopping' ? '#1E1E2E' : 'transparent', color: tab === 'shopping' ? '#fff' : '#8A7E6B' }}
        >
          Shopping
        </button>
        <button
          onClick={() => setTab('tasks')}
          className="flex-1 py-2 text-[13px] font-bold rounded-full border-none cursor-pointer transition-all flex items-center justify-center gap-1.5"
          style={{ background: tab === 'tasks' ? '#1E1E2E' : 'transparent', color: tab === 'tasks' ? '#fff' : '#8A7E6B' }}
        >
          <span style={{ fontSize: 12 }}>☑</span> Tasks
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4" style={{ paddingBottom: 110 }}>
        {tab === 'shopping' && (
          <>
            {/* New list button */}
            {!showNewList ? (
              <button
                onClick={() => setShowNewList(true)}
                className="w-full py-3 mb-4 flex items-center justify-center gap-2 rounded-[14px] font-semibold"
                style={{ background: 'transparent', border: '1.5px dashed #C8BFB0', color: '#8A7E6B', cursor: 'pointer', fontSize: 14 }}
              >
                <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> New List
              </button>
            ) : (
              <div className="flex gap-2 mb-4">
                <input
                  autoFocus
                  value={newListVal}
                  onChange={(e) => setNewListVal(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleNewList(); if (e.key === 'Escape') setShowNewList(false); }}
                  placeholder="List name…"
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ border: '1.5px solid #334266', background: '#fff', color: '#1E1E2E' }}
                />
                <button onClick={handleNewList} className="px-4 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: '#334266', border: 'none', cursor: 'pointer' }}>Add</button>
                <button onClick={() => setShowNewList(false)} className="px-3 py-2.5 rounded-xl text-sm font-medium" style={{ background: '#F0E5D2', border: 'none', cursor: 'pointer', color: '#8A7E6B' }}>✕</button>
              </div>
            )}

            {status === 'loading' && (
              <div className="flex flex-col gap-3">
                {[1, 2].map((i) => <div key={i} className="h-20 rounded-[18px] animate-pulse" style={{ background: '#E8DFCB' }} />)}
              </div>
            )}

            {status === 'ready' && lists.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p style={{ fontSize: 40 }}>🛒</p>
                <p style={{ fontSize: 17, fontWeight: 700, color: '#334266', marginTop: 12 }}>No lists yet</p>
                <p style={{ fontSize: 13, color: '#8A7E6B', marginTop: 6 }}>Create your first shopping list above.</p>
              </div>
            )}

            {status === 'ready' && lists.map((list) => {
              const isExpanded = expandedId === list.id;
              const rem = remaining(list);
              const tot = total(list);
              const prog = progress(list);
              const activeCat = catFilter[list.id] ?? 'General';
              const visibleItems = isExpanded
                ? (activeCat === 'General' ? list.items : list.items.filter((i) => i.category === activeCat))
                : [];

              return (
                <div
                  key={list.id}
                  className="mb-3 rounded-[18px] overflow-hidden"
                  style={{ background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
                >
                  {/* List header */}
                  <button
                    onClick={() => toggle(list.id)}
                    className="w-full px-4 pt-4 pb-3 flex items-start gap-3"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                  >
                    <div className="flex-1 text-left">
                      <p style={{ fontSize: 17, fontWeight: 700, color: '#1E1E2E' }}>{list.name}</p>
                      <p style={{ fontSize: 12, color: '#9BA3AF', marginTop: 1 }}>
                        {rem} of {tot} remaining
                      </p>
                    </div>
                    {/* Progress bar */}
                    <div className="flex items-center gap-2 mt-1">
                      <div className="rounded-full overflow-hidden" style={{ width: 72, height: 4, background: '#EDE8DF' }}>
                        <div className="h-full rounded-full" style={{ width: `${prog * 100}%`, background: '#334266', transition: 'width 0.3s' }} />
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9BA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
                        <path d="M9 6l6 6-6 6"/>
                      </svg>
                    </div>
                  </button>

                  {/* Expanded body */}
                  {isExpanded && (
                    <div>
                      {/* Quick-add input */}
                      <div className="px-4 pb-2 flex items-center gap-2">
                        <div className="flex-1 flex items-center rounded-xl px-3 py-2" style={{ background: '#F5F0E8', border: '1px solid #E8DFCB' }}>
                          <input
                            ref={(el) => { inputRefs.current[list.id] = el; }}
                            placeholder="Add item…"
                            value={quickAddVals.current[list.id] ?? ''}
                            onChange={(e) => { quickAddVals.current[list.id] = e.target.value; forceUpdate((n) => n + 1); }}
                            onKeyDown={(e) => handleQuickAdd(list, e)}
                            className="flex-1 bg-transparent border-none outline-none text-sm"
                            style={{ color: '#1E1E2E' }}
                          />
                        </div>
                        <button
                          onClick={() => {
                            const val = quickAddVals.current[list.id]?.trim();
                            if (val) {
                              addItem(list.id, val, catFilter[list.id] ?? 'General');
                              quickAddVals.current[list.id] = '';
                              forceUpdate((n) => n + 1);
                            } else {
                              inputRefs.current[list.id]?.focus();
                            }
                          }}
                          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: '#1E1E2E', border: 'none', cursor: 'pointer', color: '#fff', fontSize: 20, lineHeight: 1 }}
                        >
                          +
                        </button>
                      </div>

                      {/* Category chips */}
                      <div className="flex gap-2 overflow-x-auto scrollbar-none px-4 pb-3" style={{ WebkitOverflowScrolling: 'touch' }}>
                        {SHOPPING_CATEGORIES.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setCatFilter((prev) => ({ ...prev, [list.id]: cat }))}
                            className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold border-none cursor-pointer"
                            style={{
                              background: activeCat === cat ? '#1E1E2E' : '#F0E5D2',
                              color:      activeCat === cat ? '#fff' : '#6B6059',
                            }}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      {/* Items */}
                      <div className="px-4 pb-2">
                        {visibleItems.length === 0 && (
                          <p style={{ fontSize: 13, color: '#C8BFB0', paddingBottom: 8, textAlign: 'center' }}>
                            {activeCat === 'General' ? 'No items yet — type above and press Enter' : `No ${activeCat} items`}
                          </p>
                        )}
                        {visibleItems.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 py-2.5" style={{ borderTop: '1px solid #F0EAE0' }}>
                            <button
                              onClick={() => toggleItem(list.id, item.id)}
                              className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center"
                              style={{
                                borderColor: item.done ? '#334266' : '#C8BFB0',
                                background:  item.done ? '#334266' : 'transparent',
                                cursor: 'pointer',
                              }}
                            >
                              {item.done && (
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M5 12l4.5 4.5L19 7"/>
                                </svg>
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p style={{ fontSize: 15, color: item.done ? '#9BA3AF' : '#1E1E2E', textDecoration: item.done ? 'line-through' : 'none', fontWeight: 500 }}>
                                {item.name}
                              </p>
                              {item.category && item.category !== 'General' && (
                                <p style={{ fontSize: 11, color: '#9BA3AF' }}>{item.category}</p>
                              )}
                            </div>
                            <button
                              onClick={() => deleteItem(list.id, item.id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C8BFB0', fontSize: 16, lineHeight: 1, padding: '0 4px' }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Delete list */}
                      <div className="px-4 pb-4 pt-1" style={{ borderTop: '1px solid #F0EAE0' }}>
                        <button
                          onClick={() => { deleteList(list.id); setExpandedId(null); }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C65A3A', fontSize: 13, fontWeight: 600, padding: 0 }}
                        >
                          Delete list
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}

        {tab === 'tasks' && (
          <div>
            {/* Inline add row */}
            <div className="flex gap-2 mb-4 mt-1 items-center">
              <select
                value={newTaskMember}
                onChange={(e) => setNewTaskMember(e.target.value)}
                className="px-3 py-2.5 rounded-[12px] text-[13px] font-semibold outline-none"
                style={{ background: '#F0E5D2', border: 'none', color: '#334266', flexShrink: 0, maxWidth: 110 }}
              >
                <option value="">For…</option>
                {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter' && newTaskTitle.trim() && newTaskMember) {
                    await addTask(newTaskMember, newTaskTitle.trim());
                    setNewTaskTitle('');
                  }
                }}
                placeholder="Add a task…"
                className="flex-1 px-3 py-2.5 rounded-[12px] text-[14px] outline-none"
                style={{ background: '#fff', border: '1.5px solid #E8DFCB', color: '#1E1E2E' }}
              />
              <button
                onClick={async () => {
                  if (!newTaskTitle.trim() || !newTaskMember) return;
                  await addTask(newTaskMember, newTaskTitle.trim());
                  setNewTaskTitle('');
                }}
                style={{ background: '#334266', border: 'none', cursor: 'pointer', borderRadius: 12, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
              </button>
            </div>

            {/* Task list */}
            {tasksLoading ? (
              <div className="flex flex-col gap-2">{[1,2,3].map((i) => <div key={i} className="h-14 rounded-[12px] animate-pulse" style={{ background: '#E8DFCB' }} />)}</div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-16">
                <p style={{ fontSize: 36 }}>☑️</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#334266', marginTop: 10 }}>No tasks yet</p>
                <p style={{ fontSize: 13, color: '#8A7E6B', marginTop: 4 }}>Select a member and add their first task above.</p>
              </div>
            ) : (
              <div className="rounded-[16px] overflow-hidden" style={{ background: '#FBF8F1', border: '1px solid #E8DFCB' }}>
                {tasks.map((task, i) => (
                  <div key={task.id} className="px-4 py-3.5 flex items-center gap-3" style={{ borderTop: i > 0 ? '1px solid #E8DFCB' : 'none' }}>
                    <button
                      onClick={() => toggleTask(task.id)}
                      style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${task.completed ? task.memberColor : '#C8BFB0'}`, background: task.completed ? task.memberColor : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}
                    >
                      {task.completed && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l4.5 4.5L19 7"/></svg>}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: 14, fontWeight: 500, color: task.completed ? '#9BA3AF' : '#1E1E2E', textDecoration: task.completed ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</p>
                      {task.dueDate && <p style={{ fontSize: 11, color: '#8A7E6B', marginTop: 1 }}>📅 {task.dueDate}</p>}
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0" style={{ background: task.memberColor + '22', color: task.memberColor }}>{task.memberName}</span>
                    <button onClick={() => deleteTask(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C8BFB0', fontSize: 16, lineHeight: 1, padding: '0 2px', flexShrink: 0 }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <TabBar active="shop" />
    </div>
  );
}
