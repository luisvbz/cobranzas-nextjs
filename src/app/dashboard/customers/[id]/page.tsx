'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Customer, Debt, Installment } from '@/types';
import { Loader2, ArrowLeft, Mail, Phone, FileText, CreditCard, History, CheckCircle2, Clock, XCircle, AlertTriangle, CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function CustomerDetailPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const id = params.id as string;

    const deleteCustomerMutation = useMutation({
        mutationFn: async (customerId: number) => {
            const res = await api.delete(`/customers/${customerId}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            router.push('/dashboard/customers');
        }
    });

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

    // Calcular el saldo pendiente total sumando las cuotas pendientes o vencidas
    const pendingBalance = debts?.reduce((acc: number, debt: Debt) => {
        const debtPending = debt.installments?.reduce((sum: number, inst: Installment) => {
            if (inst.status === 'pending' || inst.status === 'overdue') {
                return sum + Number(inst.amount);
            }
            return sum;
        }, 0) || 0;
        return acc + debtPending;
    }, 0) || 0;

    // Calcular capital vencido exclusivamente
    const overdueBalance = debts?.reduce((acc: number, debt: Debt) => {
        const debtOverdue = debt.installments?.reduce((sum: number, inst: Installment) => {
            if (inst.status === 'overdue') {
                return sum + Number(inst.amount);
            }
            return sum;
        }, 0) || 0;
        return acc + debtOverdue;
    }, 0) || 0;

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-10">
            {/* Header Section */}
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
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                if (window.confirm('¿Estás seguro de que deseas eliminar este cliente? Todas sus deudas y pagos se perderán.')) {
                                    deleteCustomerMutation.mutate(customer.id);
                                }
                            }}
                            className="inline-flex h-10 items-center justify-center rounded-xl px-6 py-2 text-sm font-bold text-destructive hover:bg-destructive/10 transition-colors"
                            disabled={deleteCustomerMutation.isPending}
                        >
                            {deleteCustomerMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Eliminar
                        </button>
                        <Link
                            href={`/dashboard/customers/${customer.id}/edit`}
                            className="inline-flex h-10 items-center justify-center rounded-xl border bg-card px-6 py-2 text-sm font-bold shadow-sm hover:bg-muted transition-colors"
                        >
                            Editar Cliente
                        </Link>
                    </div>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl border bg-card p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <CreditCard className="h-4 w-4" />
                        <h3 className="text-sm font-medium">Saldo Pendiente</h3>
                    </div>
                    <p className="font-heading text-2xl font-bold text-foreground">
                        S/ {pendingBalance.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </p>
                </div>

                <div className="rounded-2xl border bg-card p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <AlertTriangle className="h-4 w-4 text-rose-500" />
                        <h3 className="text-sm font-medium">Saldo Vencido</h3>
                    </div>
                    <p className={`font-heading text-2xl font-bold ${overdueBalance > 0 ? 'text-rose-500' : 'text-foreground'}`}>
                        S/ {overdueBalance.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </p>
                </div>

                <div className="rounded-2xl border bg-card p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <h3 className="text-sm font-medium">Deudas Activas</h3>
                    </div>
                    <p className="font-heading text-2xl font-bold text-foreground">
                        {debts?.filter(d => d.status !== 'paid').length || 0}
                    </p>
                </div>

                <div className="rounded-2xl border bg-card p-5 shadow-sm bg-primary/5 border-primary/20">
                    <div className="flex items-center justify-between h-full">
                        <div>
                            <h3 className="text-sm font-medium text-primary mb-1">Nueva Operación</h3>
                            <p className="text-xs text-muted-foreground">Registrar nuevo compromiso</p>
                        </div>
                        <button className="h-10 w-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors">
                            <span className="text-xl leading-none">+</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left Column: Info Card */}
                <div className="xl:col-span-1 space-y-6">
                    <div className="border rounded-2xl bg-card p-6 shadow-sm space-y-6">
                        <h3 className="font-bold text-lg border-b pb-2">Información de Contacto</h3>

                        <div className="space-y-4 text-sm">
                            <div className="flex items-center gap-3 text-muted-foreground items-start">
                                <div className="flex bg-primary/10 p-2 rounded-lg text-primary shrink-0">
                                    <Mail className="h-4 w-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-medium text-foreground">Correo Electrónico</p>
                                    <p className="truncate">{customer.email || 'No registrado'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-muted-foreground">
                                <div className="flex bg-primary/10 p-2 rounded-lg text-primary shrink-0">
                                    <Phone className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">Teléfono</p>
                                    <p>{customer.phone || 'No registrado'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-muted-foreground">
                                <div className="flex bg-primary/10 p-2 rounded-lg text-primary shrink-0">
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
                                <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-xl leading-relaxed">{customer.notes}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Main Content Area */}
                <div className="xl:col-span-2 space-y-6">
                    {/* Debts & Installments Summary */}
                    <div className="border rounded-2xl bg-card p-6 shadow-sm relative overflow-hidden">
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                            <CreditCard className="w-64 h-64" />
                        </div>

                        <div className="flex items-center gap-2 mb-6 border-b pb-4 relative z-10">
                            <CreditCard className="h-5 w-5 text-primary" />
                            <h3 className="font-bold text-lg">Estructura de Deudas y Cuotas</h3>
                        </div>

                        {debts && debts.length > 0 ? (
                            <div className="space-y-6 relative z-10">
                                {debts.map(debt => (
                                    <div key={debt.id} className="border rounded-2xl overflow-hidden bg-background">
                                        {/* Debt Header */}
                                        <div className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/30 border-b">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-bold text-base">{debt.title}</h4>
                                                    {debt.status === 'pending' && <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">Pendiente</span>}
                                                    {debt.status === 'paid' && <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">Completada</span>}
                                                    {debt.status === 'overdue' && <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-destructive/10 text-destructive border border-destructive/20">Vencida</span>}
                                                </div>
                                                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                                    <span className="font-medium text-foreground">Total: {debt.currency} {debt.amount}</span>
                                                    • Vence: {format(new Date(debt.due_date), "dd MMM yyyy", { locale: es })}
                                                </p>
                                            </div>
                                            <button className="text-sm font-medium text-primary hover:underline">
                                                Ver Detalles
                                            </button>
                                        </div>

                                        {/* Installments List */}
                                        <div className="divide-y">
                                            {debt.installments?.map(inst => (
                                                <div key={inst.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-muted/10 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center font-bold text-sm text-muted-foreground border">
                                                            #{inst.number}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm">Cuota {inst.number}</p>
                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                                                <CalendarDays className="w-3.5 h-3.5" />
                                                                <span>Vence: {format(new Date(inst.due_date), "dd MMM yyyy", { locale: es })}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between sm:justify-end">
                                                        <span className="font-bold text-foreground">
                                                            {debt.currency} {inst.amount}
                                                        </span>
                                                        <div className="w-24 flex justify-end">
                                                            {inst.status === 'pending' && <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600"><Clock className="w-3.5 h-3.5" /> Pendiente</span>}
                                                            {inst.status === 'paid' && <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600"><CheckCircle2 className="w-3.5 h-3.5" /> Pagada</span>}
                                                            {inst.status === 'overdue' && <span className="flex items-center gap-1.5 text-xs font-semibold text-destructive"><XCircle className="w-3.5 h-3.5" /> Vencida</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {(!debt.installments || debt.installments.length === 0) && (
                                                <div className="p-4 text-sm text-muted-foreground text-center">
                                                    No hay cuotas registradas para esta deuda.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground pb-2">El cliente no tiene deudas registradas en el sistema.</p>
                        )}
                    </div>

                    {/* Payment History */}
                    <div className="border rounded-2xl bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6 border-b pb-4">
                            <div className="flex items-center gap-2">
                                <History className="h-5 w-5 text-primary" />
                                <h3 className="font-bold text-lg">Historial de Pagos</h3>
                            </div>
                        </div>

                        {payments && payments.length > 0 ? (
                            <div className="relative overflow-x-auto rounded-xl border">
                                <table className="w-full text-left text-sm text-muted-foreground">
                                    <thead className="bg-muted/50 text-xs uppercase text-foreground">
                                        <tr>
                                            <th className="px-4 py-3.5 font-bold">Fecha de Pago</th>
                                            <th className="px-4 py-3.5 font-bold">Monto</th>
                                            <th className="px-4 py-3.5 font-bold">Método</th>
                                            <th className="px-4 py-3.5 font-bold text-right">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {payments.map(payment => (
                                            <tr key={payment.id} className="hover:bg-muted/30 transition-colors bg-background">
                                                <td className="px-4 py-3">
                                                    {format(new Date(payment.payment_date || payment.paid_at || payment.created_at), "dd/MM/yyyy HH:mm", { locale: es })}
                                                </td>
                                                <td className="px-4 py-3 font-medium text-foreground">
                                                    S/ {payment.amount}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="px-2.5 py-1 rounded-md bg-muted text-xs font-medium uppercase tracking-wide">
                                                        {payment.method || payment.payment_method || 'Desconocido'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${payment.status === 'completed' || payment.status === 'paid' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                                            payment.status === 'pending' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                                                'bg-destructive/10 text-destructive border-destructive/20'
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
                            <div className="flex flex-col items-center justify-center py-10 text-center bg-muted/20 rounded-xl border border-dashed">
                                <History className="h-10 w-10 text-muted-foreground/30 mb-3" />
                                <h4 className="font-medium text-foreground">No hay historial de pagos</h4>
                                <p className="text-sm text-muted-foreground mt-1 max-w-sm">Este cliente aún no ha realizado ningún pago en la plataforma.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
