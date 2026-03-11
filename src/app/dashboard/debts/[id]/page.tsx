'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Debt, Installment } from '@/types';
import {
    Loader2, ArrowLeft, CheckCircle2, Clock, XCircle,
    CreditCard, User, CalendarDays, Trash2, Link2, Copy, Send,
    Mail, MessageSquare, Check, ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const statusConfig = {
    pending: { label: 'Pendiente', icon: Clock, badgeClass: 'bg-amber-100 text-amber-700 border-amber-200' },
    paid: { label: 'Pagada', icon: CheckCircle2, badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    overdue: { label: 'Vencida', icon: XCircle, badgeClass: 'bg-red-100 text-red-700 border-red-200' },
    payment_reported: { label: 'Comprobante Enviado', icon: Clock, badgeClass: 'bg-blue-100 text-blue-700 border-blue-200' },
};

function StatusBadge({ status }: { status: string }) {
    const cfg = statusConfig[status as keyof typeof statusConfig];
    if (!cfg) return <span className="text-xs">{status}</span>;
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.badgeClass}`}>
            <Icon className="h-3 w-3" />
            {cfg.label}
        </span>
    );
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export default function DebtDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const queryClient = useQueryClient();
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [sendingId, setSendingId] = useState<number | null>(null);
    const [sendChannel, setSendChannel] = useState<'mail' | 'whatsapp'>('mail');

    const { data: debt, isLoading } = useQuery({
        queryKey: ['debt', id],
        queryFn: async () => {
            const res = await api.get(`/debts/${id}`);
            return res.data.data as Debt;
        },
        enabled: !!id,
    });

    const { mutate: markAsPaid, isPending: isMarking } = useMutation({
        mutationFn: async (installmentId: number) => {
            const res = await api.post(`/installments/${installmentId}/mark-as-paid`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['debt', id] });
            queryClient.invalidateQueries({ queryKey: ['debts'] });
        },
    });

    const { mutate: deleteDebt, isPending: isDeleting } = useMutation({
        mutationFn: async () => { await api.delete(`/debts/${id}`); },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['debts'] });
            router.push('/dashboard/debts');
        },
    });

    const copyLink = async (inst: Installment) => {
        const url = `${APP_URL}/pay/${inst.payment_link_token}`;
        await navigator.clipboard.writeText(url);
        setCopiedId(inst.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const sendLink = async (inst: Installment, channel: 'mail' | 'whatsapp') => {
        setSendingId(inst.id);
        try {
            await api.post(`/installments/${inst.id}/remind`, { channels: [channel] });
            setSendingId(null);
        } catch {
            setSendingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!debt) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold">Deuda no encontrada</h2>
                <Link href="/dashboard/debts" className="text-primary hover:underline mt-4 inline-block">Volver a deudas</Link>
            </div>
        );
    }

    const installments = debt.installments ?? [];
    const paidCount = installments.filter(i => i.status === 'paid').length;
    const totalAmount = Number(debt.amount);
    const paidAmount = installments.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.amount), 0);
    const pendingAmount = totalAmount - paidAmount;

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            {/* Header */}
            <div>
                <Link href="/dashboard/debts" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Volver a Deudas
                </Link>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="font-heading text-3xl font-bold text-foreground">{debt.title}</h1>
                            <StatusBadge status={debt.status} />
                        </div>
                        {debt.customer && (
                            <Link href={`/dashboard/customers/${debt.customer.id}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mt-1 transition-colors">
                                <User className="h-3.5 w-3.5" /> {debt.customer.name}
                            </Link>
                        )}
                    </div>
                    <button
                        onClick={() => { if (window.confirm('¿Eliminar esta deuda y todas sus cuotas?')) deleteDebt(); }}
                        disabled={isDeleting}
                        className="inline-flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-bold text-destructive hover:bg-destructive/10 transition-colors border border-transparent hover:border-destructive/20"
                    >
                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        Eliminar
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border bg-card p-5 shadow-sm">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Monto Total</p>
                    <p className="font-heading text-2xl font-bold">{debt.currency} {totalAmount.toFixed(2)}</p>
                </div>
                <div className="rounded-2xl border bg-card p-5 shadow-sm">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Cobrado</p>
                    <p className="font-heading text-2xl font-bold text-emerald-600">{debt.currency} {paidAmount.toFixed(2)}</p>
                </div>
                <div className="rounded-2xl border bg-card p-5 shadow-sm">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Pendiente</p>
                    <p className={`font-heading text-2xl font-bold ${pendingAmount > 0 ? 'text-amber-600' : 'text-foreground'}`}>
                        {debt.currency} {pendingAmount.toFixed(2)}
                    </p>
                </div>
            </div>

            {/* Progress */}
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-primary" />
                        <span className="font-bold text-sm">Progreso de Cobro</span>
                    </div>
                    <span className="text-sm font-bold text-muted-foreground">{paidCount} / {installments.length} cuotas pagadas</span>
                </div>
                <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-700"
                        style={{ width: installments.length ? `${(paidCount / installments.length) * 100}%` : '0%' }}
                    />
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>0%</span>
                    <span className="font-semibold text-emerald-600">
                        {installments.length ? Math.round((paidCount / installments.length) * 100) : 0}% completado
                    </span>
                    <span>100%</span>
                </div>
            </div>

            {/* Installments with Payment Links */}
            <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 p-6 border-b bg-muted/20">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    <h3 className="font-bold text-lg">Plan de Pagos</h3>
                    <div className="ml-auto flex items-center gap-1 border rounded-lg overflow-hidden text-xs font-medium">
                        <button
                            onClick={() => setSendChannel('mail')}
                            className={`flex items-center gap-1 px-3 py-1.5 transition-colors ${sendChannel === 'mail' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                        >
                            <Mail className="h-3 w-3" /> Email
                        </button>
                        <button
                            onClick={() => setSendChannel('whatsapp')}
                            className={`flex items-center gap-1 px-3 py-1.5 transition-colors ${sendChannel === 'whatsapp' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                        >
                            <MessageSquare className="h-3 w-3" /> WhatsApp
                        </button>
                    </div>
                </div>

                {installments.length === 0 ? (
                    <div className="text-center py-12 text-sm text-muted-foreground">No hay cuotas registradas.</div>
                ) : (
                    <div className="divide-y divide-border">
                        {installments.map((inst: Installment) => {
                            const payUrl = `${APP_URL}/pay/${inst.payment_link_token}`;
                            const isPaid = inst.status === 'paid';
                            return (
                                <div key={inst.id} className={`px-6 py-4 ${isPaid ? 'opacity-60' : ''}`}>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                        {/* Cuota info */}
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                                                {inst.number}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-foreground">
                                                    {debt.currency} {inst.amount}
                                                    <span className="ml-3 text-sm font-normal text-muted-foreground">
                                                        • {format(new Date(inst.due_date), 'dd MMM yyyy', { locale: es })}
                                                    </span>
                                                </p>
                                                {!isPaid && inst.payment_link_token && (
                                                    <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-xs">
                                                        🔗 {payUrl}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="shrink-0">
                                                <StatusBadge status={inst.status} />
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        {!isPaid && inst.payment_link_token && (
                                            <div className="flex items-center gap-2 shrink-0">
                                                {/* Open link */}
                                                <a
                                                    href={payUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
                                                >
                                                    <ExternalLink className="h-3.5 w-3.5" /> Ver
                                                </a>

                                                {/* Copy */}
                                                <button
                                                    onClick={() => copyLink(inst)}
                                                    className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
                                                >
                                                    {copiedId === inst.id ? (
                                                        <><Check className="h-3.5 w-3.5 text-emerald-500" /> Copiado</>
                                                    ) : (
                                                        <><Copy className="h-3.5 w-3.5" /> Copiar</>
                                                    )}
                                                </button>

                                                {/* Send reminder */}
                                                <button
                                                    onClick={() => sendLink(inst, sendChannel)}
                                                    disabled={sendingId === inst.id}
                                                    className="flex items-center gap-1.5 rounded-lg bg-primary/10 text-primary px-3 py-1.5 text-xs font-bold hover:bg-primary/20 transition-colors disabled:opacity-50"
                                                >
                                                    {sendingId === inst.id ? (
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    ) : (
                                                        <Send className="h-3.5 w-3.5" />
                                                    )}
                                                    Enviar
                                                </button>

                                                {/* Mark as paid */}
                                                <button
                                                    onClick={() => markAsPaid(inst.id)}
                                                    disabled={isMarking}
                                                    className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 text-emerald-700 px-3 py-1.5 text-xs font-bold hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                                                >
                                                    {isMarking ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                                                    Cobrada
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* WhatsApp share bar */}
                                    {!isPaid && inst.payment_link_token && (
                                        <div className="mt-2.5 flex items-center gap-2 p-2.5 bg-muted/40 rounded-xl border border-border/50">
                                            <Link2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                            <span className="text-xs text-muted-foreground truncate flex-1">{payUrl}</span>
                                            <a
                                                href={`https://wa.me/?text=${encodeURIComponent(`Hola, aquí está el link para pagar tu cuota #${inst.number}: ${payUrl}`)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-xs font-semibold text-green-600 hover:text-green-700 shrink-0"
                                            >
                                                <MessageSquare className="h-3.5 w-3.5" /> Compartir
                                            </a>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
