'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import {
    Loader2, SearchX, FileText,
    CheckCircle2, XCircle, ChevronLeft, ChevronRight,
    Clock, X, Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PaymentReportItem {
    id: number;
    installment_id: number;
    method: string;
    operation_number?: string;
    notes?: string;
    status: string;
    created_at: string;
    proof_image?: string;
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

export default function PaymentReportsPage() {
    const [page, setPage] = useState(1);
    const [selectedReport, setSelectedReport] = useState<PaymentReportItem | null>(null);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['payment-reports', page],
        queryFn: async () => {
            const res = await api.get('/payment-reports', { params: { page } });
            return res.data;
        },
    });

    // Query para cargar detalles del reporte (incluyendo imagen)
    const { data: reportDetails, isLoading: isLoadingDetails } = useQuery({
        queryKey: ['payment-report', selectedReport?.id],
        queryFn: async () => {
            const res = await api.get(`/payment-reports/${selectedReport?.id}`);
            return res.data;
        },
        enabled: !!selectedReport?.id,
    });

    const approveMutation = useMutation({
        mutationFn: async (reportId: number) => {
            const res = await api.post(`/payment-reports/${reportId}/approve`);
            return res.data;
        },
        onSuccess: () => {
            refetch();
            setSelectedReport(null);
        },
    });

    const rejectMutation = useMutation({
        mutationFn: async (reportId: number) => {
            const res = await api.post(`/payment-reports/${reportId}/reject`, {
                reason: 'Rechazado por revisión de staff',
            });
            return res.data;
        },
        onSuccess: () => {
            refetch();
            setSelectedReport(null);
        },
    });

    const reports: PaymentReportItem[] = data?.data ?? [];
    const pagination = data?.pagination;

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
                <h1 className="font-heading text-3xl font-bold text-foreground">Pagos Reportados</h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    Revisa y aprueba los pagos reportados por los clientes.
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border bg-card shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Pendientes de Revisión</p>
                            <p className="text-2xl font-bold text-foreground mt-1">
                                {pagination?.total || 0}
                            </p>
                        </div>
                        <Clock className="h-10 w-10 text-amber-500/20" />
                    </div>
                </div>

                <div className="rounded-2xl border bg-card shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Monto Total Pendiente</p>
                            <p className="text-2xl font-bold text-foreground mt-1">
                                {formatCurrency(
                                    reports.reduce((sum, r) => sum + Number(r.installment?.amount || 0), 0)
                                )}
                            </p>
                        </div>
                        <FileText className="h-10 w-10 text-blue-500/20" />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : reports.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <SearchX className="h-12 w-12 text-muted-foreground/30 mb-4" />
                        <h3 className="font-semibold text-foreground">No hay pagos reportados</h3>
                        <p className="text-sm text-muted-foreground mt-1">Todos los reportes han sido procesados.</p>
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
                                    <th className="px-6 py-4 text-left font-bold">Nº Operación</th>
                                    <th className="px-6 py-4 text-left font-bold">Fecha Reporte</th>
                                    <th className="px-6 py-4 text-right font-bold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {reports.map((report) => (
                                    <tr key={report.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold text-foreground">
                                                    {report.installment?.debt?.customer?.name || 'N/A'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {report.installment?.debt?.title || 'Sin deuda'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                                                Cuota #{report.installment?.number || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-foreground">
                                                {formatCurrency(report.installment?.amount || 0)}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium dark:bg-blue-900/30 dark:text-blue-300">
                                                {report.method}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-muted-foreground font-mono">
                                                {report.operation_number || '-'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-muted-foreground text-sm">
                                                {format(new Date(report.created_at), 'PPP', { locale: es })}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedReport(report)}
                                                className="inline-flex items-center gap-1 text-primary hover:text-primary/80 font-medium transition-colors text-sm"
                                            >
                                                Revisar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Página <span className="font-bold">{pagination.current_page}</span> de <span className="font-bold">{pagination.last_page}</span>
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
                            disabled={page === pagination.last_page}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Siguiente
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Modal de detalles */}
            {selectedReport && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-2xl w-full max-w-2xl p-6 space-y-4 my-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-foreground">
                                Revisar Pago Reportado
                            </h3>
                            <button
                                onClick={() => setSelectedReport(null)}
                                className="p-1 hover:bg-muted rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5 text-muted-foreground" />
                            </button>
                        </div>

                        {isLoadingDetails ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Imagen del comprobante */}
                                {reportDetails?.proof_image ? (
                                    <div className="rounded-xl border bg-muted/20 overflow-hidden">
                                        <div className="relative">
                                            <img
                                                src={reportDetails.proof_image}
                                                alt="Comprobante de pago"
                                                className="w-full h-auto max-h-96 object-cover"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-xl border bg-muted/20 p-8 text-center">
                                        <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                                        <p className="text-sm text-muted-foreground">No hay comprobante adjunto</p>
                                    </div>
                                )}

                                {/* Datos del reporte */}
                                <div className="space-y-3 bg-muted/30 rounded-lg p-4">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Cliente:</span>
                                        <span className="font-semibold">{selectedReport.installment?.debt?.customer?.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Deuda:</span>
                                        <span className="font-semibold">{selectedReport.installment?.debt?.title}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Cuota:</span>
                                        <span className="font-semibold">#{selectedReport.installment?.number}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Monto:</span>
                                        <span className="font-bold text-primary">
                                            {formatCurrency(selectedReport.installment?.amount || 0)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Método:</span>
                                        <span className="font-semibold">{selectedReport.method}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Nº Operación:</span>
                                        <span className="font-mono text-sm">{selectedReport.operation_number || '-'}</span>
                                    </div>
                                    {selectedReport.notes && (
                                        <div className="border-t pt-3">
                                            <p className="text-xs text-muted-foreground mb-1">Notas del cliente:</p>
                                            <p className="text-sm">{selectedReport.notes}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Botones de acción */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setSelectedReport(null)}
                                        className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors font-medium"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={() => rejectMutation.mutate(selectedReport.id)}
                                        disabled={rejectMutation.isPending}
                                        className="flex-1 px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <XCircle className="h-4 w-4" />
                                        {rejectMutation.isPending ? 'Rechazando...' : 'Rechazar'}
                                    </button>
                                    <button
                                        onClick={() => approveMutation.mutate(selectedReport.id)}
                                        disabled={approveMutation.isPending}
                                        className="flex-1 px-4 py-2 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                        {approveMutation.isPending ? 'Aprobando...' : 'Aprobar'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
