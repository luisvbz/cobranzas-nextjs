'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Loader2, ArrowLeft, Save, Mail, Phone, FileText, User } from 'lucide-react';
import Link from 'next/link';

const customerSchema = z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z.string().email('Debe ser un correo válido').optional().or(z.literal('')),
    phone: z.string().optional(),
    document_type: z.string().optional(),
    document_number: z.string().optional(),
    notes: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

function Field({
    label,
    icon: Icon,
    required,
    error,
    children,
    colSpan,
}: {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    required?: boolean;
    error?: string;
    children: React.ReactNode;
    colSpan?: 'full';
}) {
    return (
        <div className={`space-y-2 ${colSpan === 'full' ? 'md:col-span-2' : ''}`}>
            <label className="text-sm font-semibold flex items-center gap-1.5">
                {Icon && <Icon className="h-4 w-4 text-primary" />}
                {label}
                {required && <span className="text-destructive">*</span>}
            </label>
            {children}
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}

export default function NewCustomerPage() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<CustomerFormValues>({
        resolver: zodResolver(customerSchema),
        mode: 'onChange',
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            document_type: 'DNI',
            document_number: '',
            notes: '',
        }
    });

    const { mutate: createCustomer, isPending } = useMutation({
        mutationFn: async (data: CustomerFormValues) => {
            const res = await api.post('/customers', data);
            return res.data.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            router.push(`/dashboard/customers/${data.id}`);
        },
    });

    const inputClass = (hasError?: boolean) =>
        `flex h-10 w-full rounded-xl border bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors ${hasError ? 'border-destructive focus-visible:ring-destructive' : 'border-input'}`;

    return (
        <div className="space-y-6 max-w-3xl mx-auto pb-10">
            <div>
                <Link href="/dashboard/customers" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    Volver a Clientes
                </Link>
                <h1 className="font-heading text-3xl font-bold text-foreground">Nuevo Cliente</h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    Registra la información de contacto y facturación del cliente.
                </p>
            </div>

            <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
                <form onSubmit={handleSubmit(data => createCustomer(data))} className="divide-y">

                    {/* Section: Personal Info */}
                    <div className="p-6 md:p-8 space-y-4">
                        <div className="flex items-center gap-2 mb-5">
                            <User className="h-4 w-4 text-primary" />
                            <h3 className="font-bold text-sm uppercase tracking-wide text-muted-foreground">Información Principal</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Field label="Nombre Completo o Empresa" icon={User} required error={errors.name?.message} colSpan="full">
                                <input
                                    {...register('name')}
                                    className={inputClass(!!errors.name)}
                                    placeholder="Ej. Juan Pérez o Empresa S.A."
                                />
                            </Field>
                            <Field label="Correo Electrónico" icon={Mail} error={errors.email?.message}>
                                <input
                                    {...register('email')}
                                    type="email"
                                    className={inputClass(!!errors.email)}
                                    placeholder="correo@ejemplo.com"
                                />
                            </Field>
                            <Field label="Teléfono / WhatsApp" icon={Phone}>
                                <input
                                    {...register('phone')}
                                    type="tel"
                                    className={inputClass()}
                                    placeholder="+51 987 654 321"
                                />
                            </Field>
                        </div>
                    </div>

                    {/* Section: Identity */}
                    <div className="p-6 md:p-8 space-y-4">
                        <div className="flex items-center gap-2 mb-5">
                            <FileText className="h-4 w-4 text-primary" />
                            <h3 className="font-bold text-sm uppercase tracking-wide text-muted-foreground">Identidad y Facturación</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Field label="Tipo de Documento">
                                <select
                                    {...register('document_type')}
                                    className={inputClass()}
                                >
                                    <option value="DNI">DNI</option>
                                    <option value="RUC">RUC</option>
                                    <option value="Pasaporte">Pasaporte</option>
                                    <option value="CE">Carné de Extranjería</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </Field>
                            <Field label="Número de Documento">
                                <input
                                    {...register('document_number')}
                                    className={inputClass()}
                                    placeholder="Número de identidad"
                                />
                            </Field>
                            <Field label="Notas o Dirección" colSpan="full">
                                <textarea
                                    {...register('notes')}
                                    rows={3}
                                    className="flex w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none transition-colors"
                                    placeholder="Información adicional, dirección, referencias..."
                                />
                            </Field>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 px-6 md:px-8 py-5 bg-muted/20">
                        <Link
                            href="/dashboard/customers"
                            className="inline-flex h-10 items-center justify-center rounded-xl border bg-card px-6 font-medium transition-colors hover:bg-muted"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={!isValid || isPending}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:opacity-50 disabled:shadow-none"
                        >
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Guardar Cliente
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
