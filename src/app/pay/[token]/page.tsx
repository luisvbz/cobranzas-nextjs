'use client';

import { useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import {
    Loader2, CheckCircle2, Clock, XCircle, Upload,
    CreditCard, AlertTriangle, FileText, Image, X
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000');

interface PublicInstallment {
    id: number;
    number: number;
    amount: string;
    due_date: string;
    status: string;
    status_label: string;
    payment_link_token: string;
    debt?: {
        title: string;
        currency: string;
        customer?: {
            name: string;
        };
        organization?: {
            name: string;
        };
    };
}

const PAYMENT_METHODS = [
    { value: 'transfer', label: 'Transferencia Bancaria' },
    { value: 'yape', label: 'Yape' },
    { value: 'plin', label: 'Plin' },
    { value: 'deposit', label: 'Depósito en Efectivo' },
    { value: 'card', label: 'Tarjeta de Crédito/Débito' },
    { value: 'other', label: 'Otro' },
];

const statusConfig = {
    pending: { label: 'Pendiente', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
    overdue: { label: 'Vencida', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
    paid: { label: 'Pagada', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    payment_reported: { label: 'Comprobante Enviado', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
};

export default function PublicPayPage() {
    const params = useParams();
    const token = params.token as string;

    const [method, setMethod] = useState('transfer');
    const [operationNumber, setOperationNumber] = useState('');
    const [notes, setNotes] = useState('');
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: installment, isLoading, isError } = useQuery({
        queryKey: ['pay', token],
        queryFn: async () => {
            const res = await axios.get(`${API_BASE}/public/pay/${token}`);
            return res.data.data as PublicInstallment;
        },
        enabled: !!token,
        retry: false,
    });

    const { mutate: reportPayment, isPending } = useMutation({
        mutationFn: async () => {
            const form = new FormData();
            form.append('method', method);
            form.append('operation_number', operationNumber);
            form.append('notes', notes);
            if (proofFile) form.append('proof', proofFile);
            await axios.post(`${API_BASE}/public/pay/${token}/report`, form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        },
        onSuccess: () => setSubmitted(true),
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setProofFile(file);
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        } else {
            setPreviewUrl(null);
        }
    };

    const removeFile = () => {
        setProofFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isError || !installment) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
                <div className="bg-white rounded-2xl shadow-xl p-10 max-w-sm w-full text-center">
                    <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                    <h1 className="text-xl font-bold mb-2">Link no válido</h1>
                    <p className="text-muted-foreground text-sm">Este enlace de pago no es válido o ya expiró. Contacta a la empresa emisora.</p>
                </div>
            </div>
        );
    }

    const statusCfg = statusConfig[installment.status as keyof typeof statusConfig];
    const StatusIcon = statusCfg?.icon ?? Clock;
    const isPaid = installment.status === 'paid';
    const isReported = installment.status === 'payment_reported';
    const currency = installment.debt?.currency ?? 'PEN';
    const orgName = installment.debt?.organization?.name ?? 'Empresa';

    if (submitted || isReported) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
                <div className="bg-white rounded-2xl shadow-xl p-10 max-w-sm w-full text-center space-y-4">
                    <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h1 className="text-2xl font-bold">¡Comprobante Enviado!</h1>
                    <p className="text-muted-foreground text-sm">
                        Tu comprobante de pago ha sido enviado. El equipo de <strong>{orgName}</strong> lo revisará y confirmará a la brevedad.
                    </p>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-left mt-2">
                        <p className="text-xs font-semibold text-emerald-700 mb-1">Resumen del Pago</p>
                        <p className="text-sm text-foreground"><strong>Cuota:</strong> #{installment.number}</p>
                        <p className="text-sm text-foreground"><strong>Monto:</strong> {currency} {installment.amount}</p>
                        <p className="text-sm text-foreground"><strong>Método:</strong> {PAYMENT_METHODS.find(m => m.value === method)?.label ?? method}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (isPaid) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
                <div className="bg-white rounded-2xl shadow-xl p-10 max-w-sm w-full text-center space-y-4">
                    <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h1 className="text-2xl font-bold">¡Cuota ya Pagada!</h1>
                    <p className="text-muted-foreground text-sm">Esta cuota ya fue registrada como pagada. No se requiere ninguna acción adicional.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-primary/5 p-4 flex items-start justify-center pt-10">
            <div className="w-full max-w-lg space-y-4">

                {/* Header Card */}
                <div className="bg-white rounded-2xl shadow-sm border p-6 text-center">
                    <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                        <CreditCard className="h-7 w-7 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">{orgName}</p>
                    <h1 className="font-bold text-2xl mt-1">{installment.debt?.title ?? 'Pago de Cuota'}</h1>
                    <p className="text-sm text-muted-foreground mt-1">para {installment.debt?.customer?.name}</p>
                </div>

                {/* Installment Summary */}
                <div className={`bg-white rounded-2xl shadow-sm border p-5 ${statusCfg?.bg ?? ''}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cuota #{installment.number}</p>
                            <p className="font-heading text-3xl font-bold mt-1">{currency} {installment.amount}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Vence: {format(new Date(installment.due_date), "dd 'de' MMMM yyyy", { locale: es })}
                            </p>
                        </div>
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold ${statusCfg?.color}`}>
                            <StatusIcon className="h-4 w-4" />
                            {statusCfg?.label}
                        </div>
                    </div>
                </div>

                {/* Manual Payment Form */}
                <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                    <div className="flex items-center gap-2 px-6 py-4 border-b bg-muted/20">
                        <FileText className="h-4 w-4 text-primary" />
                        <h2 className="font-bold text-base">Reportar Pago Manual</h2>
                    </div>
                    <div className="p-6 space-y-5">

                        {/* Method */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Método de Pago <span className="text-destructive">*</span></label>
                            <select
                                value={method}
                                onChange={e => setMethod(e.target.value)}
                                className="flex h-10 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            >
                                {PAYMENT_METHODS.map(m => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Operation Number */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">N° de Operación / Referencia</label>
                            <input
                                type="text"
                                value={operationNumber}
                                onChange={e => setOperationNumber(e.target.value)}
                                placeholder="Ej. 00012345678"
                                className="flex h-10 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            />
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Notas adicionales</label>
                            <textarea
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                rows={2}
                                placeholder="Información adicional sobre el pago..."
                                className="flex w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none"
                            />
                        </div>

                        {/* Proof upload */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Comprobante de Pago <span className="text-destructive">*</span></label>
                            {!previewUrl ? (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer"
                                >
                                    <Upload className="h-8 w-8 text-muted-foreground/50 mb-2" />
                                    <p className="text-sm font-medium text-muted-foreground">Click para subir imagen</p>
                                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG o WEBP · Máx. 5MB</p>
                                </button>
                            ) : (
                                <div className="relative rounded-xl overflow-hidden border">
                                    <img src={previewUrl} alt="Comprobante" className="w-full max-h-52 object-cover" />
                                    <button
                                        onClick={removeFile}
                                        className="absolute top-2 right-2 h-7 w-7 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-3 py-1.5 flex items-center gap-1.5">
                                        <Image className="h-3.5 w-3.5 text-white" />
                                        <span className="text-white text-xs truncate">{proofFile?.name}</span>
                                    </div>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>

                        <button
                            onClick={() => reportPayment()}
                            disabled={isPending || !proofFile}
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:opacity-50 disabled:shadow-none"
                        >
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                            Enviar Comprobante
                        </button>
                    </div>
                </div>

                <p className="text-center text-xs text-muted-foreground pb-6">
                    Powered by <strong>CobroFlow</strong> · Tu pago está protegido
                </p>
            </div>
        </div>
    );
}
