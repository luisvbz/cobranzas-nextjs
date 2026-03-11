'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Customer } from '@/types';
import { Loader2, ArrowLeft, Mail, Phone, FileText, CreditCard, History, CheckCircle2, Clock, XCircle } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function CustomerDetailPage() {
    const params = useParams();
    const id = params.id as string;

    const { data: customer, isLoading } = useQuery({
        queryKey: ['customer', id],
        queryFn: async () => {
            const res = await api.get(`/customers/${id}`);
            return res.data.data as Customer;
        },
        enabled: !!id,
    });

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold">Cliente no encontrado</h2>
                <Link href="/dashboard/customers" className="text-primary hover:underline mt-4 inline-block">
                    Volver a clientes
                </Link>
            </div>
        );
    }

    const { debts, payments } = customer;

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div>
                <Link href="/dashboard/customers" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    Volver a Clientes
                </Link>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="font-heading text-3xl font-bold text-foreground">
                            {customer.name}
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Cliente desde el {format(new Date(customer.created_at), "dd 'de' MMMM, yyyy", { locale: es })}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Info Card */}
                <div className="lg:col-span-1 border rounded-2xl bg-card p-6 shadow-sm space-y-6">
                    <h3 className="font-bold text-lg border-b pb-2">Información de Contacto</h3>

                    <div className="space-y-4 text-sm">
                        <div className="flex items-center gap-3 text-muted-foreground">
                            <div className="flex bg-primary/10 p-2 rounded-lg text-primary">
                                <Mail className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="font-medium text-foreground">Correo Electrónico</p>
                                <p>{customer.email || 'No registrado'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-muted-foreground">
                            <div className="flex bg-primary/10 p-2 rounded-lg text-primary">
                                <Phone className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="font-medium text-foreground">Teléfono</p>
                                <p>{customer.phone || 'No registrado'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-muted-foreground">
                            <div className="flex bg-primary/10 p-2 rounded-lg text-primary">
                                <FileText className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="font-medium text-foreground">Documento ({customer.document_type || 'N/A'})</p>
                                <p>{customer.document_number || 'No registrado'}</p>
                            </div>
                        </div>
                    </div>

                    {customer.notes && (
                        <div className="pt-4 border-t">
                            <p className="text-sm font-medium mb-2">Notas Adicionales</p>
                            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-xl">{customer.notes}</p>
                        </div>
                    )}
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Debts Summary */}
                    <div className="border rounded-2xl bg-card p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 border-b pb-4">
                            <CreditCard className="h-5 w-5 text-primary" />
                            <h3 className="font-bold text-lg">Estado de Deudas</h3>
                        </div>

                        {debts && debts.length > 0 ? (
                            <div className="space-y-4">
                                {debts.map(debt => (
                                    <div key={debt.id} className="border rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/20">
                                        <div>
                                            <p className="font-bold">{debt.description}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Total: {debt.currency} {debt.total_amount}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Vence: {format(new Date(debt.due_date), "dd MMM yyyy", { locale: es })}
                                            </p>
                                        </div>
                                        <div>
                                            {debt.status === 'pending' && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800"><Clock className="w-3.5 h-3.5" /> Pendiente</span>}
                                            {debt.status === 'paid' && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"><CheckCircle2 className="w-3.5 h-3.5" /> Pagada</span>}
                                            {debt.status === 'overdue' && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20"><XCircle className="w-3.5 h-3.5" /> Vencida</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground pb-2">El cliente no tiene deudas registradas.</p>
                        )}
                    </div>

                    {/* Payment History */}
                    <div className="border rounded-2xl bg-card p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 border-b pb-4">
                            <History className="h-5 w-5 text-primary" />
                            <h3 className="font-bold text-lg">Historial de Pagos</h3>
                        </div>

                        {payments && payments.length > 0 ? (
                            <div className="relative overflow-x-auto">
                                <table className="w-full text-left text-sm text-muted-foreground">
                                    <thead className="bg-muted/50 text-xs uppercase text-foreground">
                                        <tr>
                                            <th className="px-4 py-3 font-bold rounded-tl-lg">Fecha</th>
                                            <th className="px-4 py-3 font-bold">Monto</th>
                                            <th className="px-4 py-3 font-bold">Método</th>
                                            <th className="px-4 py-3 font-bold text-right rounded-tr-lg">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.map(payment => (
                                            <tr key={payment.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                                <td className="px-4 py-3">
                                                    {format(new Date(payment.payment_date), "dd/MM/yyyy")}
                                                </td>
                                                <td className="px-4 py-3 font-medium text-foreground">
                                                    ${payment.amount}
                                                </td>
                                                <td className="px-4 py-3 capitalize">
                                                    {payment.payment_method}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${payment.status === 'completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30' :
                                                            payment.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30' :
                                                                'bg-destructive/10 text-destructive'
                                                        }`}>
                                                        {payment.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground pb-2">No hay pagos registrados para este cliente.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
