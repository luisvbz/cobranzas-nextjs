'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Customer } from '@/types';
import { Loader2, ArrowLeft, Save, Calendar, DollarSign, Users, CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { addMonths, format } from 'date-fns';
import { es } from 'date-fns/locale';

// Keep all fields as strings to avoid resolver type conflicts with z.transform
const debtSchema = z.object({
    customer_id: z.string().min(1, 'Selecciona un cliente'),
    title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
    description: z.string().optional(),
    amount: z.string().min(1, 'El monto es requerido'),
    currency: z.string().default('PEN'),
    due_date: z.string().min(1, 'La fecha es requerida'),
    installments_count: z.string().min(1, 'Ingresa el número de cuotas'),
});

type DebtFormValues = z.infer<typeof debtSchema>;


export default function NewDebtPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    const preselectedCustomerId = searchParams.get('customer_id') ?? '';



    const { data: customersData } = useQuery({
        queryKey: ['customers-all'],
        queryFn: async () => {
            const res = await api.get('/customers', { params: { per_page: 100 } });
            return res.data.data as Customer[];
        },
    });

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isValid },
    } = useForm<DebtFormValues>({
        resolver: zodResolver(debtSchema),
        mode: 'onChange',
        defaultValues: {
            customer_id: preselectedCustomerId,
            installments_count: '1',
            currency: 'PEN',
        },
    });


    // Watch values for live installment preview
    const [amount, installmentsCount, currency, due_date] = useWatch({
        control,
        name: ['amount', 'installments_count', 'currency', 'due_date'],
    });

    const { mutate: createDebt, isPending } = useMutation({
        mutationFn: async (data: DebtFormValues) => {
            const payload = {
                ...data,
                customer_id: Number(data.customer_id),
                amount: Number(data.amount),
                installments_count: Number(data.installments_count),
            };
            const res = await api.post('/debts', payload);
            return res.data.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['debts'] });
            router.push(`/dashboard/debts/${data.id}`);
        },
    });

    const onSubmit = (data: DebtFormValues) => createDebt(data);


    // Compute installment preview
    const installmentPreview = (() => {
        if (!amount || !installmentsCount || installmentsCount < 1 || !due_date) return [];
        const n = Number(installmentsCount);
        const total = Number(amount);
        const base = Math.floor((total / n) * 100) / 100;
        const last = Math.round((total - base * (n - 1)) * 100) / 100;
        return Array.from({ length: n }, (_, i) => ({
            number: i + 1,
            amount: i === n - 1 ? last : base,
            due_date: addMonths(new Date(due_date), i),
        }));
    })();

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <Link href="/dashboard/debts" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    Volver a Deudas
                </Link>
                <h1 className="font-heading text-3xl font-bold text-foreground">Nueva Deuda</h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    Registra el compromiso de pago y el sistema creará las cuotas automáticamente.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Form */}
                <div className="lg:col-span-3">
                    <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
                        <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8 space-y-6">

                            {/* Customer */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold flex items-center gap-1.5">
                                    <Users className="h-4 w-4 text-primary" /> Cliente <span className="text-destructive">*</span>
                                </label>
                                <select
                                    {...register('customer_id')}
                                    className={`flex h-10 w-full rounded-xl border bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${errors.customer_id ? 'border-destructive' : 'border-input'}`}
                                >
                                    <option value="">Selecciona un cliente...</option>
                                    {customersData?.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                {errors.customer_id && <p className="text-xs text-destructive">{errors.customer_id.message}</p>}
                            </div>

                            {/* Title */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Título / Concepto <span className="text-destructive">*</span></label>
                                <input
                                    {...register('title')}
                                    className={`flex h-10 w-full rounded-xl border bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${errors.title ? 'border-destructive' : 'border-input'}`}
                                    placeholder="Ej. Servicio de Consultoría - Mayo 2026"
                                />
                                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Descripción <span className="text-muted-foreground text-xs font-normal">(opcional)</span></label>
                                <textarea
                                    {...register('description')}
                                    rows={2}
                                    className="flex w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none"
                                    placeholder="Detalle adicional del servicio o producto..."
                                />
                            </div>

                            {/* Amount & Currency */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-2 space-y-2">
                                    <label className="text-sm font-semibold flex items-center gap-1.5">
                                        <DollarSign className="h-4 w-4 text-primary" /> Monto Total <span className="text-destructive">*</span>
                                    </label>
                                    <input
                                        {...register('amount')}
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className={`flex h-10 w-full rounded-xl border bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${errors.amount ? 'border-destructive' : 'border-input'}`}
                                        placeholder="0.00"
                                    />
                                    {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Moneda</label>
                                    <select
                                        {...register('currency')}
                                        className="flex h-10 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                    >
                                        <option value="PEN">PEN</option>
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                    </select>
                                </div>
                            </div>

                            {/* Due Date & Installments */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center gap-1.5">
                                        <Calendar className="h-4 w-4 text-primary" /> Fecha Inicio <span className="text-destructive">*</span>
                                    </label>
                                    <input
                                        {...register('due_date')}
                                        type="date"
                                        className={`flex h-10 w-full rounded-xl border bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${errors.due_date ? 'border-destructive' : 'border-input'}`}
                                    />
                                    {errors.due_date && <p className="text-xs text-destructive">{errors.due_date.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Número de Cuotas <span className="text-destructive">*</span></label>
                                    <input
                                        {...register('installments_count')}
                                        type="number"
                                        min="1"
                                        max="60"
                                        className={`flex h-10 w-full rounded-xl border bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${errors.installments_count ? 'border-destructive' : 'border-input'}`}
                                    />
                                    {errors.installments_count && <p className="text-xs text-destructive">{errors.installments_count.message}</p>}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Link
                                    href="/dashboard/debts"
                                    className="inline-flex h-10 items-center justify-center rounded-xl border bg-transparent px-6 font-medium transition-colors hover:bg-muted"
                                >
                                    Cancelar
                                </Link>
                                <button
                                    type="submit"
                                    disabled={!isValid || isPending}
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:opacity-50 disabled:shadow-none"
                                >
                                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Crear Deuda
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Installment Preview */}
                <div className="lg:col-span-2">
                    <div className="rounded-2xl border bg-card shadow-sm p-6 sticky top-6">
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b">
                            <CalendarDays className="h-4 w-4 text-primary" />
                            <h3 className="font-bold text-base">Vista Previa de Cuotas</h3>
                        </div>

                        {installmentPreview.length === 0 ? (
                            <div className="text-center py-8 text-sm text-muted-foreground">
                                <p>Ingresa el monto, fecha y número de cuotas para ver la distribución.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {installmentPreview.map(inst => (
                                    <div key={inst.number} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border">
                                        <div className="flex items-center gap-3">
                                            <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                                                {inst.number}
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {format(inst.due_date, 'dd MMM yyyy', { locale: es })}
                                            </span>
                                        </div>
                                        <span className="font-bold text-sm">
                                            {currency} {inst.amount.toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                                <div className="flex justify-between items-center pt-3 mt-2 border-t font-bold text-sm">
                                    <span>Total</span>
                                    <span className="text-primary">{currency} {Number(amount).toFixed(2)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
