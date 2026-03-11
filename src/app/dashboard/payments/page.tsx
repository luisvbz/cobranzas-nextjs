'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Payment, PaginatedResponse } from '@/types';
import {
    Loader2, SearchX, DollarSign,
    CheckCircle2, Eye, ChevronLeft, ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';

interface PaymentWithDetails extends Payment {
    installment?: {
        id: number;
        number: number;
        amount: string;
        debt_id: number;
        debt?: {
            id: number;
            title: string;
            customer?: {
                id: number;
                name: string;
            };
        };
    };
}

export default function PaymentsPage() {
    const [page, setPage] = useState(1);

    const { data, isLoading } = useQuery({
        queryKey: ['payments', page],
        queryFn: async () => {
            const res = await api.get('/payments', { 
                params: { page, sort: '-paid_at' } 
            });
            return res.data as PaginatedResponse<PaymentWithDetails>;
        },
    });

    const payments = data?.data ?? [];
    const meta = data?.meta;

    const formatCurrency = (amount: string | number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(Number(amount));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="font-heading text-3xl font-bold text-foreground">Pagos Recibidos</h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    Historial de todos los pagos confirmados y procesados.
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl border bg-card shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Total Recibido</p>
                            <p className="text-2xl font-bold text-foreground mt-1">
                                {formatCurrency(
                                    payments.reduce((sum, p) => sum + Number(p.amount), 0)
                                )}
                            </p>
                        </div>
                        <CheckCircle2 className="h-10 w-10 text-emerald-500/20" />
                    </div>
                </div>

                <div className="rounded-2xl border bg-card shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Pagos Procesados</p>
                            <p className="text-2xl font-bold text-foreground mt-1">
                                {payments.length}
                            </p>
                        </div>
                        <DollarSign className="h-10 w-10 text-primary/20" />
                    </div>
                </div>

                <div className="rounded-2xl border bg-card shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Promedio por Pago</p>
                            <p className="text-2xl font-bold text-foreground mt-1">
                                {formatCurrency(
                                    payments.length > 0
                                        ? payments.reduce((sum, p) => sum + Number(p.amount), 0) / payments.length
                                        : 0
                                )}
                            </p>
                        </div>
                        <DollarSign className="h-10 w-10 text-blue-500/20" />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : payments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <SearchX className="h-12 w-12 text-muted-foreground/30 mb-4" />
                        <h3 className="font-semibold text-foreground">No hay pagos registrados</h3>
                        <p className="text-sm text-muted-foreground mt-1">Los pagos confirmados aparecerán aquí.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-muted/50 text-xs uppercase text-muted-foreground border-b">
                                    <th className="px-6 py-4 text-left font-bold">Cliente / Deuda</th>
                                    <th className="px-6 py-4 text-left font-bold">Cuota</th>
                                    <th className="px-6 py-4 text-left font-bold">Monto</th>
                                    <th className="px-6 py-4 text-left font-bold">Método</th>
                                    <th className="px-6 py-4 text-left font-bold">Fecha de Pago</th>
                                    <th className="px-6 py-4 text-left font-bold">Transacción</th>
                                    <th className="px-6 py-4 text-right font-bold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {payments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold text-foreground">
                                                    {payment.installment?.debt?.customer?.name || 'N/A'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {payment.installment?.debt?.title || 'Sin deuda'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                                                Cuota #{payment.installment?.number || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-foreground">
                                                {formatCurrency(payment.amount)}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium dark:bg-blue-900/30 dark:text-blue-300">
                                                {payment.method_label || payment.method || 'Sin especificar'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-muted-foreground">
                                                {payment.paid_at
                                                    ? format(new Date(payment.paid_at), 'PPP', { locale: es })
                                                    : 'N/A'
                                                }
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs text-muted-foreground font-mono">
                                                {payment.transaction_id ? payment.transaction_id.substring(0, 12) + '...' : '-'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/dashboard/debts/${payment.installment?.debt_id}`}
                                                className="inline-flex items-center gap-1 text-primary hover:text-primary/80 font-medium transition-colors"
                                            >
                                                <Eye className="h-4 w-4" />
                                                Ver
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {meta && meta.last_page > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Mostrando página <span className="font-bold">{meta.current_page}</span> de <span className="font-bold">{meta.last_page}</span>
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Anterior
                        </button>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={page === meta.last_page}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Siguiente
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
