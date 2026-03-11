'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Debt, PaginatedResponse } from '@/types';
import {
    Loader2, Plus, Search, CreditCard,
    Clock, CheckCircle2, XCircle, Eye, ChevronLeft, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type StatusFilter = 'all' | 'pending' | 'overdue' | 'paid';

const statusConfig = {
    pending: { label: 'Pendiente', icon: Clock, className: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300' },
    paid: { label: 'Pagada', icon: CheckCircle2, className: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300' },
    overdue: { label: 'Vencida', icon: XCircle, className: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300' },
};

export default function DebtsPage() {
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

    const { data, isLoading } = useQuery({
        queryKey: ['debts', page, statusFilter],
        queryFn: async () => {
            const params: Record<string, string | number> = { page };
            if (statusFilter !== 'all') params['filter[status]'] = statusFilter;
            const res = await api.get('/debts', { params });
            return res.data as PaginatedResponse<Debt>;
        },
    });

    const debts = data?.data ?? [];
    const meta = data?.meta;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="font-heading text-3xl font-bold text-foreground">Gestión de Deudas</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Administra todas las deudas y sus cuotas de pago.
                    </p>
                </div>
                <Link
                    href="/dashboard/debts/new"
                    className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
                >
                    <Plus className="h-4 w-4" />
                    Nueva Deuda
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                {(['all', 'pending', 'overdue', 'paid'] as StatusFilter[]).map(s => (
                    <button
                        key={s}
                        onClick={() => { setStatusFilter(s); setPage(1); }}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${statusFilter === s
                                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                : 'bg-card text-muted-foreground border-border hover:border-primary/50'
                            }`}
                    >
                        {s === 'all' ? 'Todas' : statusConfig[s]?.label}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : debts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <CreditCard className="h-12 w-12 text-muted-foreground/30 mb-4" />
                        <h3 className="font-semibold text-foreground">No hay deudas registradas</h3>
                        <p className="text-sm text-muted-foreground mt-1">Crea tu primera deuda para empezar a gestionar cobranzas.</p>
                        <Link href="/dashboard/debts/new" className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline">
                            <Plus className="h-4 w-4" /> Crear Deuda
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-muted/50 text-xs uppercase text-muted-foreground">
                                    <th className="px-6 py-4 text-left font-bold">Cliente / Título</th>
                                    <th className="px-6 py-4 text-left font-bold">Monto</th>
                                    <th className="px-6 py-4 text-left font-bold">Vencimiento</th>
                                    <th className="px-6 py-4 text-left font-bold">Cuotas</th>
                                    <th className="px-6 py-4 text-left font-bold">Estado</th>
                                    <th className="px-6 py-4 text-right font-bold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {debts.map((debt) => {
                                    const status = statusConfig[debt.status as keyof typeof statusConfig];
                                    const StatusIcon = status?.icon;
                                    const paidCount = debt.installments?.filter(i => i.status === 'paid').length ?? 0;
                                    const totalCount = debt.installments?.length ?? 0;
                                    return (
                                        <tr key={debt.id} className="hover:bg-muted/20 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-foreground">{debt.title}</p>
                                                {debt.customer && (
                                                    <p className="text-xs text-muted-foreground mt-0.5">{debt.customer.name}</p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-foreground">{debt.currency} {debt.amount}</span>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {format(new Date(debt.due_date), 'dd MMM yyyy', { locale: es })}
                                            </td>
                                            <td className="px-6 py-4">
                                                {totalCount > 0 ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                                                            <div
                                                                className="h-full bg-emerald-500 rounded-full"
                                                                style={{ width: `${(paidCount / totalCount) * 100}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs text-muted-foreground">{paidCount}/{totalCount}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {status && (
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${status.className}`}>
                                                        {StatusIcon && <StatusIcon className="h-3 w-3" />}
                                                        {status.label}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    href={`/dashboard/debts/${debt.id}`}
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-secondary/20 px-3 py-1.5 text-xs font-bold text-secondary-foreground hover:bg-secondary/30 transition-colors"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    Ver
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {meta && meta.last_page > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/20">
                        <p className="text-sm text-muted-foreground">
                            Mostrando {debts.length} de {meta.total} deudas
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium border hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="h-4 w-4" /> Anterior
                            </button>
                            <span className="text-sm font-medium text-muted-foreground px-2">{page} / {meta.last_page}</span>
                            <button
                                onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                                disabled={page === meta.last_page}
                                className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium border hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Siguiente <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
