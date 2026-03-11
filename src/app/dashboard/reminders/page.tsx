'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import {
    Loader2, Bell, Send, Mail, MessageSquare,
    CheckCircle2, Clock, XCircle, RefreshCw, Users
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ReminderRecord {
    id: number;
    type: 'manual' | 'batch' | 'automatic';
    channel: 'mail' | 'whatsapp';
    status: 'sent' | 'failed';
    sent_at: string;
    installment?: {
        id: number;
        number: number;
        amount: string;
        debt?: {
            title: string;
            customer?: {
                name: string;
            };
        };
    };
}

const channelConfig = {
    mail: { label: 'Email', icon: Mail, className: 'bg-blue-100 text-blue-700 border-blue-200' },
    whatsapp: { label: 'WhatsApp', icon: MessageSquare, className: 'bg-green-100 text-green-700 border-green-200' },
};

export default function RemindersPage() {
    const [selectedChannels, setSelectedChannels] = useState<string[]>(['mail']);
    const [batchResult, setBatchResult] = useState<{ count: number } | null>(null);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['reminders'],
        queryFn: async () => {
            const res = await api.get('/reminders');
            return res.data;
        }
    });

    const reminders: ReminderRecord[] = data?.data ?? [];

    const { mutate: sendBatch, isPending: isSendingBatch } = useMutation({
        mutationFn: async () => {
            const res = await api.post('/reminders/batch', { channels: selectedChannels });
            return res.data;
        },
        onSuccess: (data) => {
            setBatchResult({ count: data.count });
            queryClient.invalidateQueries({ queryKey: ['reminders'] });
        }
    });

    const toggleChannel = (ch: string) => {
        setSelectedChannels(prev =>
            prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="font-heading text-3xl font-bold text-foreground">Recordatorios</h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    Envía recordatorios de pago a tus clientes con cuotas pendientes o vencidas.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Send Panel */}
                <div className="lg:col-span-1 space-y-4">
                    {/* Batch Reminder Card */}
                    <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 border-b pb-3">
                            <Bell className="h-5 w-5 text-primary" />
                            <h2 className="font-bold text-base">Recordatorio Masivo</h2>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            Notifica a todos los clientes que tienen cuotas <strong>pendientes o vencidas</strong> en este momento.
                        </p>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Canales de envío</label>
                            <div className="flex gap-2">
                                {['mail', 'whatsapp'].map(ch => (
                                    <button
                                        key={ch}
                                        onClick={() => toggleChannel(ch)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${selectedChannels.includes(ch)
                                                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                                : 'bg-card text-muted-foreground border-border hover:border-primary/50'
                                            }`}
                                    >
                                        {ch === 'mail' ? <Mail className="h-3.5 w-3.5" /> : <MessageSquare className="h-3.5 w-3.5" />}
                                        {ch === 'mail' ? 'Email' : 'WhatsApp'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {batchResult && (
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm">
                                <CheckCircle2 className="h-4 w-4 shrink-0" />
                                <span>Recordatorios enviados a <strong>{batchResult.count}</strong> cuotas.</span>
                            </div>
                        )}

                        <button
                            onClick={() => { setBatchResult(null); sendBatch(); }}
                            disabled={isSendingBatch || selectedChannels.length === 0}
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:opacity-50 disabled:shadow-none"
                        >
                            {isSendingBatch ? (
                                <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
                            ) : (
                                <><Send className="h-4 w-4" /> Enviar Recordatorio Masivo</>
                            )}
                        </button>
                    </div>

                    {/* Info Card */}
                    <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-3 text-sm text-muted-foreground">
                        <div className="flex items-start gap-2">
                            <RefreshCw className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            <div>
                                <p className="font-semibold text-foreground text-xs uppercase tracking-wide mb-1">Recordatorios Automáticos</p>
                                <p className="text-xs">El sistema también envía recordatorios automáticos a través del job programado <code className="bg-muted px-1 py-0.5 rounded text-xs">SendInstallmentRemindersJob</code>.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <Users className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            <div>
                                <p className="font-semibold text-foreground text-xs uppercase tracking-wide mb-1">Recordatorio Individual</p>
                                <p className="text-xs">Puedes enviar un recordatorio desde la vista de detalle de una deuda, cuota por cuota.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reminder History */}
                <div className="lg:col-span-2">
                    <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
                        <div className="flex items-center gap-2 p-6 border-b bg-muted/20">
                            <Clock className="h-5 w-5 text-primary" />
                            <h2 className="font-bold text-base">Historial de Recordatorios</h2>
                        </div>

                        {isLoading ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 className="h-7 w-7 animate-spin text-primary" />
                            </div>
                        ) : reminders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <Bell className="h-12 w-12 text-muted-foreground/20 mb-3" />
                                <h3 className="font-semibold text-foreground">Sin recordatorios aún</h3>
                                <p className="text-sm text-muted-foreground mt-1">Usa el panel de la izquierda para enviar el primer recordatorio.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-xs uppercase text-muted-foreground border-b bg-muted/10">
                                            <th className="px-5 py-3 text-left font-bold">Cliente / Cuota</th>
                                            <th className="px-5 py-3 text-left font-bold">Canal</th>
                                            <th className="px-5 py-3 text-left font-bold">Tipo</th>
                                            <th className="px-5 py-3 text-left font-bold">Estado</th>
                                            <th className="px-5 py-3 text-left font-bold">Fecha</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {reminders.map(rem => {
                                            const chCfg = channelConfig[rem.channel as keyof typeof channelConfig];
                                            const ChIcon = chCfg?.icon;
                                            return (
                                                <tr key={rem.id} className="hover:bg-muted/10 transition-colors">
                                                    <td className="px-5 py-3.5">
                                                        <p className="font-semibold text-foreground">
                                                            {rem.installment?.debt?.customer?.name || 'N/A'}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {rem.installment?.debt?.title} — Cuota #{rem.installment?.number}
                                                        </p>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        {chCfg && (
                                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${chCfg.className}`}>
                                                                {ChIcon && <ChIcon className="h-3 w-3" />}
                                                                {chCfg.label}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-3.5 capitalize text-muted-foreground text-xs">{rem.type}</td>
                                                    <td className="px-5 py-3.5">
                                                        {rem.status === 'sent' ? (
                                                            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                                                                <CheckCircle2 className="h-3.5 w-3.5" /> Enviado
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center gap-1 text-xs font-semibold text-destructive">
                                                                <XCircle className="h-3.5 w-3.5" /> Fallido
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-xs text-muted-foreground">
                                                        {rem.sent_at ? format(new Date(rem.sent_at), 'dd MMM yyyy HH:mm', { locale: es }) : '—'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
