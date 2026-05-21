'use client';

import { useState } from 'react';
import { BottomSheet } from '@/src/components/primitives/BottomSheet';
import { useHousehold } from '@/src/context/HouseholdContext';
import type { FuelLog } from '../hooks/useFuelLog';

interface AddFuelSheetProps {
  open: boolean;
  onClose: () => void;
  onSave: (entry: Omit<FuelLog, 'id' | 'createdAt' | 'memberId'>) => void;
}

export function AddFuelSheet({ open, onClose, onSave }: AddFuelSheetProps) {
  const { formatMoney } = useHousehold();
  const [vehicle,      setVehicle]      = useState('');
  const [liters,       setLiters]       = useState('');
  const [pricePerLiter,setPricePerLiter]= useState('');
  const [odometer,     setOdometer]     = useState('');
  const [fuelDate,     setFuelDate]     = useState(new Date().toISOString().split('T')[0]);
  const [notes,        setNotes]        = useState('');
  const [error,        setError]        = useState('');

  const totalCost = Number(liters) && Number(pricePerLiter)
    ? Number(liters) * Number(pricePerLiter)
    : 0;

  const handleSave = () => {
    if (!liters || isNaN(Number(liters))) { setError('Liters is required'); return; }
    if (!pricePerLiter || isNaN(Number(pricePerLiter))) { setError('Price per liter is required'); return; }
    setError('');
    onSave({
      vehicleName:   vehicle.trim(),
      liters:        Number(liters),
      pricePerLiter: Number(pricePerLiter),
      totalCost,
      odometer:      odometer ? Number(odometer) : null,
      fuelDate,
      notes:         notes.trim(),
    });
    setVehicle(''); setLiters(''); setPricePerLiter(''); setOdometer(''); setNotes(''); setError('');
    onClose();
  };

  const rowCls   = 'flex items-center h-14 px-4 border-b border-hairline';
  const labelCls = 'text-[13px] text-muted font-medium w-32 shrink-0';
  const valCls   = 'flex-1 text-[15px] text-ink font-medium bg-transparent border-none outline-none';

  return (
    <BottomSheet open={open} onClose={onClose} snapPercent={90}>
      <div className="pt-2 pb-8">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onClose} className="text-[15px] text-ink font-medium bg-transparent border-none cursor-pointer p-0">Cancel</button>
          <span className="text-[15px] font-bold text-ink">Log fuel</span>
          <button
            onClick={handleSave}
            disabled={!liters || !pricePerLiter}
            className="text-[15px] font-bold text-primary bg-transparent border-none cursor-pointer p-0 disabled:opacity-40"
          >
            Save
          </button>
        </div>

        {error && <p className="text-danger text-xs mb-3 px-1">{error}</p>}

        {totalCost > 0 && (
          <div className="rounded-[14px] px-5 py-4 mb-4 text-center" style={{ background: '#F0E5D2' }}>
            <p style={{ fontSize: 13, color: '#8A7E6B' }}>Total cost</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: '#334266' }}>{formatMoney(totalCost)}</p>
          </div>
        )}

        <div className="bg-surface border border-hairline rounded-card overflow-hidden">
          <div className={rowCls}>
            <span className={labelCls}>Vehicle</span>
            <input placeholder="e.g. Family Car" value={vehicle} onChange={(e) => setVehicle(e.target.value)} className={valCls} />
          </div>
          <div className={rowCls}>
            <span className={labelCls}>Liters</span>
            <input type="number" placeholder="0.00" value={liters} onChange={(e) => setLiters(e.target.value)} className={valCls} />
          </div>
          <div className={rowCls}>
            <span className={labelCls}>Price/liter</span>
            <input type="number" placeholder="0.00" value={pricePerLiter} onChange={(e) => setPricePerLiter(e.target.value)} className={valCls} />
          </div>
          <div className={rowCls}>
            <span className={labelCls}>Odometer</span>
            <input type="number" placeholder="km (optional)" value={odometer} onChange={(e) => setOdometer(e.target.value)} className={valCls} />
          </div>
          <div className={rowCls}>
            <span className={labelCls}>Date</span>
            <input type="date" value={fuelDate} onChange={(e) => setFuelDate(e.target.value)} className={valCls} />
          </div>
          <div className={rowCls + ' border-none h-auto py-3'}>
            <span className={labelCls}>Notes</span>
            <input placeholder="Optional notes" value={notes} onChange={(e) => setNotes(e.target.value)} className={valCls} />
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}
