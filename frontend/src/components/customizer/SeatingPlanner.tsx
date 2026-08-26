import React, { useState, useEffect } from 'react';
import { Plus, Users, Trash2, CheckCircle2, UserCheck, Armchair } from 'lucide-react';
import { api } from '../../api/client';
import { IGuest } from '@shared/types';

interface Table {
  id: string;
  name: string;
  shape: 'round' | 'rect' | 'theatre_row';
  x: number;
  y: number;
  capacity: number;
  assignedGuests: string[]; // guest IDs
}

interface SeatingPlannerProps {
  eventId: string;
}

export const SeatingPlanner: React.FC<SeatingPlannerProps> = ({ eventId }) => {
  const [tables, setTables] = useState<Table[]>([]);
  const [guests, setGuests] = useState<IGuest[]>([]);
  const [layoutType, setLayoutType] = useState('Round Tables');
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (eventId) {
      api
        .get<{ success: boolean; layout: any; guests: IGuest[] }>(`/events/${eventId}/seating`)
        .then((res) => {
          if (res.success) {
            if (res.layout?.tables) setTables(res.layout.tables);
            if (res.layout?.layoutType) setLayoutType(res.layout.layoutType);
            if (res.guests) setGuests(res.guests);
          }
        })
        .catch(() => {});
    }
  }, [eventId]);

  const handleAddTable = () => {
    const tableNumber = tables.length + 1;
    const newTable: Table = {
      id: `tbl-${Date.now()}`,
      name: `Table ${tableNumber} - Royal Dining`,
      shape: 'round',
      x: 200,
      y: 200,
      capacity: 8,
      assignedGuests: [],
    };
    setTables((prev) => [...prev, newTable]);
    setSelectedTableId(newTable.id);
  };

  const handleDeleteTable = (id: string) => {
    setTables((prev) => prev.filter((t) => t.id !== id));
    if (selectedTableId === id) setSelectedTableId(null);
  };

  const handleAssignGuest = async (tableId: string, guestId: string) => {
    try {
      const res = await api.post<{ success: boolean; layout: any }>(`/events/${eventId}/seating/assign`, {
        tableId,
        guestId,
      });
      if (res.success && res.layout) {
        setTables(res.layout.tables);
      }
    } catch (err: any) {
      alert(err.message || 'Could not seat guest.');
    }
  };

  const handleUnassignGuest = async (tableId: string, guestId: string) => {
    const updated = tables.map((tbl) => {
      if (tbl.id === tableId) {
        return { ...tbl, assignedGuests: tbl.assignedGuests.filter((id) => id !== guestId) };
      }
      return tbl;
    });
    setTables(updated);
    await api.post(`/events/${eventId}/seating`, { layoutType, tables: updated });
  };

  const handleSaveLayout = async () => {
    setIsSaving(true);
    try {
      await api.post(`/events/${eventId}/seating`, { layoutType, tables });
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    } catch (err) {
      console.error('Failed to save seating layout:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const totalSeats = tables.reduce((acc, t) => acc + t.capacity, 0);
  const assignedSeatsCount = tables.reduce((acc, t) => acc + t.assignedGuests.length, 0);

  const selectedTable = tables.find((t) => t.id === selectedTableId);

  // Guests unassigned
  const allAssignedGuestIds = new Set(tables.flatMap((t) => t.assignedGuests));
  const unassignedGuests = guests.filter((g) => !allAssignedGuestIds.has(g._id));

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="p-4 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border-2 border-utsav-gold/40 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-utsav-maroon-800 text-utsav-gold border border-utsav-gold">
            <Armchair className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading text-base font-bold text-utsav-maroon-800 dark:text-utsav-gold">
              Guest Seating & Table Allocator
            </h3>
            <p className="text-xs text-utsav-brown-600 dark:text-utsav-ivory-300">
              Capacity: <span className="font-bold text-utsav-maroon-800 dark:text-utsav-gold">{assignedSeatsCount}</span> of {totalSeats} seats allocated
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {savedNotice && (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Seating Saved!</span>
            </div>
          )}

          <button
            onClick={handleAddTable}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-utsav-beige-200 dark:bg-utsav-maroon-800 text-utsav-brown dark:text-utsav-ivory text-xs font-bold hover:bg-utsav-saffron hover:text-utsav-maroon-950 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Table</span>
          </button>

          <button
            onClick={handleSaveLayout}
            disabled={isSaving}
            className="flex items-center space-x-2 px-5 py-2 rounded-xl maroon-gradient-btn text-xs sm:text-sm font-bold shadow-md"
          >
            <span>{isSaving ? 'Saving...' : 'Save Seating Plan'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tables Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tables.map((table) => {
              const isSelected = table.id === selectedTableId;
              const isFull = table.assignedGuests.length >= table.capacity;

              return (
                <div
                  key={table.id}
                  onClick={() => setSelectedTableId(table.id)}
                  className={`p-4 rounded-3xl cursor-pointer transition-all duration-200 border-2 ${
                    isSelected
                      ? 'bg-utsav-saffron-50 dark:bg-utsav-maroon-800/90 border-utsav-saffron shadow-xl scale-[1.02]'
                      : 'bg-white dark:bg-utsav-maroon-950 border-utsav-gold/30 hover:border-utsav-gold shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-heading text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold">
                        {table.name}
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Capacity: {table.assignedGuests.length} / {table.capacity} Seats
                      </p>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isFull
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                        }`}
                      >
                        {isFull ? 'FULL' : 'AVAILABLE'}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTable(table.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Seated Guests List in Table */}
                  <div className="mt-3 pt-3 border-t border-utsav-gold/20 space-y-1.5">
                    {table.assignedGuests.length === 0 ? (
                      <p className="text-[11px] text-gray-400 italic">No guests assigned yet</p>
                    ) : (
                      table.assignedGuests.map((gId) => {
                        const guest = guests.find((g) => g._id === gId);
                        return (
                          <div
                            key={gId}
                            className="flex items-center justify-between p-1.5 rounded-xl bg-utsav-beige-100 dark:bg-utsav-maroon-900 text-xs text-utsav-brown dark:text-utsav-ivory"
                          >
                            <span className="font-semibold truncate">{guest?.name || 'Guest'}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnassignGuest(table.id, gId);
                              }}
                              className="text-[10px] text-red-500 font-bold hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Unassigned Guests Palette */}
        <div className="p-4 rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-900 border border-utsav-gold/40 shadow-xl space-y-3 h-fit max-h-[600px] flex flex-col">
          <div className="flex items-center justify-between border-b border-utsav-gold/20 pb-2">
            <h4 className="font-heading text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold uppercase tracking-wider">
              Unseated Guests ({unassignedGuests.length})
            </h4>
            <span className="text-[11px] text-utsav-saffron font-bold">
              {selectedTable ? `Assigning to ${selectedTable.name.split(' - ')[0]}` : 'Select a table first'}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {unassignedGuests.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-400">
                🎉 All RSVP guests have been allocated seats!
              </div>
            ) : (
              unassignedGuests.map((guest) => (
                <div
                  key={guest._id}
                  className="p-2.5 rounded-2xl bg-white dark:bg-utsav-maroon-950 border border-utsav-gold/30 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-utsav-brown dark:text-utsav-ivory">{guest.name}</p>
                    <span className="text-[10px] text-gray-500">{guest.relationship || 'Guest'}</span>
                  </div>

                  <button
                    disabled={!selectedTable || selectedTable.assignedGuests.length >= selectedTable.capacity}
                    onClick={() => selectedTable && handleAssignGuest(selectedTable.id, guest._id)}
                    className="px-2.5 py-1 rounded-lg bg-utsav-maroon-800 text-utsav-gold text-xs font-bold hover:bg-utsav-saffron hover:text-utsav-maroon-950 disabled:opacity-40 transition-colors"
                  >
                    Seat Here →
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
