import React, { useState } from 'react';
import { ChevronLeft, Plus, CheckCircle, Pencil } from 'lucide-react';
import { useFloating, autoUpdate, offset, flip, shift, useClick, useDismiss, useRole, useInteractions, FloatingPortal, size } from '@floating-ui/react';

interface RoleSelectProps {
    value: string;
    onChange: (role: string) => void;
    roles: string[];
    onAddRole: (role: string) => void;
    onEditRole: (oldRole: string, newRole: string) => void;
}

export const RoleSelect = ({ value, onChange, roles, onAddRole, onEditRole }: RoleSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<string | null>(null);
    const [editRoleValue, setEditRoleValue] = useState('');
    const [isAddingRole, setIsAddingRole] = useState(false);
    const [addRoleValue, setAddRoleValue] = useState('');

    const { refs, floatingStyles, context } = useFloating({
        open: isOpen,
        onOpenChange: (open) => {
            setIsOpen(open);
            if (!open) {
                setIsAddingRole(false);
                setEditingRole(null);
            }
        },
        middleware: [
            offset(4),
            flip(),
            shift(),
            size({
                apply({ rects, elements }) {
                    Object.assign(elements.floating.style, {
                        width: `${rects.reference.width}px`,
                    });
                },
            }),
        ],
        whileElementsMounted: autoUpdate,
    });

    const click = useClick(context);
    const dismiss = useDismiss(context);
    const role = useRole(context);

    const { getReferenceProps, getFloatingProps } = useInteractions([
        click,
        dismiss,
        role,
    ]);

    return (
        <>
            <div
                ref={refs.setReference}
                {...getReferenceProps()}
                className="w-full px-4 py-2 border border-stone-300 rounded-xl bg-white flex justify-between items-center cursor-pointer hover:border-amber-500 transition"
            >
                <span className="truncate pr-2">{value || 'Выберите специальность'}</span>
                <ChevronLeft className={`transform transition-transform text-stone-400 shrink-0 ${isOpen ? '-rotate-90' : 'rotate-180'}`} size={16} />
            </div>

            {isOpen && (
                <FloatingPortal>
                    <div
                        ref={refs.setFloating}
                        style={floatingStyles}
                        {...getFloatingProps()}
                        className="z-[9999] bg-white border border-stone-200 rounded-xl shadow-lg overflow-hidden flex flex-col max-h-64"
                    >
                        <div className="overflow-y-auto flex-1 p-1">
                            {roles.map(r => (
                                <div key={r} className="flex items-center justify-between px-3 py-2 hover:bg-stone-50 rounded-lg group transition-colors">
                                    {editingRole === r ? (
                                        <div className="flex w-full gap-2 items-center" onClick={e => e.stopPropagation()}>
                                            <input
                                                autoFocus
                                                className="flex-1 px-2 py-1 border border-amber-300 rounded-md focus:outline-none focus:border-amber-500 text-sm"
                                                value={editRoleValue}
                                                onChange={e => setEditRoleValue(e.target.value)}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        onEditRole(r, editRoleValue);
                                                        if(value === r) onChange(editRoleValue.trim() || value);
                                                        setEditingRole(null);
                                                    }
                                                }}
                                            />
                                            <button type="button" onClick={(e) => {
                                                e.stopPropagation();
                                                onEditRole(r, editRoleValue);
                                                if(value === r) onChange(editRoleValue.trim() || value);
                                                setEditingRole(null);
                                            }} className="text-emerald-600 p-1 hover:bg-emerald-100 rounded-md transition"><CheckCircle size={18}/></button>
                                        </div>
                                    ) : (
                                        <>
                      <span
                          className="flex-1 cursor-pointer truncate text-sm font-medium text-stone-700"
                          onClick={() => { onChange(r); setIsOpen(false); }}
                      >
                        {r}
                      </span>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingRole(r);
                                                    setEditRoleValue(r);
                                                    setIsAddingRole(false);
                                                }}
                                                className="text-stone-400 hover:text-amber-600 p-1 md:opacity-0 group-hover:opacity-100 transition"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-stone-100 p-2 bg-stone-50">
                            {isAddingRole ? (
                                <div className="flex gap-2 items-center" onClick={e => e.stopPropagation()}>
                                    <input
                                        autoFocus
                                        placeholder="Название..."
                                        className="flex-1 px-2 py-1.5 border border-amber-300 rounded-md focus:outline-none focus:border-amber-500 text-sm"
                                        value={addRoleValue}
                                        onChange={e => setAddRoleValue(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                if(addRoleValue.trim()) {
                                                    onAddRole(addRoleValue);
                                                    onChange(addRoleValue.trim());
                                                    setIsAddingRole(false);
                                                    setAddRoleValue('');
                                                    setIsOpen(false);
                                                }
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if(addRoleValue.trim()) {
                                                onAddRole(addRoleValue);
                                                onChange(addRoleValue.trim());
                                                setIsAddingRole(false);
                                                setAddRoleValue('');
                                                setIsOpen(false);
                                            }
                                        }}
                                        className="text-emerald-600 p-1 hover:bg-emerald-100 rounded-md transition"
                                    >
                                        <CheckCircle size={18}/>
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsAddingRole(true);
                                        setEditingRole(null);
                                        setAddRoleValue('');
                                    }}
                                    className="w-full py-2 text-sm font-bold text-emerald-600 hover:bg-emerald-100 rounded-lg transition flex items-center justify-center"
                                >
                                    <Plus size={16} className="mr-1" /> Создать специальность
                                </button>
                            )}
                        </div>
                    </div>
                </FloatingPortal>
            )}
        </>
    );
};
