'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
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

    const onSubmit = (data: CustomerFormValues) => {
        createCustomer(data);
    };

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <div>
                <Link href="/dashboard/customers" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    Volver a Clientes
                </Link>
                <h1 className="font-heading text-3xl font-bold text-foreground">
                    Nuevo Cliente
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    Registra la información de contacto y facturación.
                </p>
            </div>

            <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8 space-y-8">
                    <div className="space-y-4">
                        <h3 className="font-bold border-b pb-2 cursor-default">Información Principal</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium">Nombre Completo o Empresa <span className="text-destructive">*</span></label>
                                <input
                                    {...register('name')}
                                    className={`flex h-10 w-full rounded-xl border bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${errors.name ? 'border-destructive focus-visible:ring-destructive' : 'border-input'}`}
                                    placeholder="Ej. Juan Pérez"
                                />
                                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Correo Electrónico</label>
                                <input
                                    {...register('email')}
                                    type="email"
                                    className={`flex h-10 w-full rounded-xl border bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${errors.email ? 'border-destructive focus-visible:ring-destructive' : 'border-input'}`}
                                    placeholder="ejemplo@correo.com"
                                />
                                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Teléfono</label>
                                <input
                                    {...register('phone')}
                                    type="tel"
                                    className="flex h-10 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                    placeholder="+1 234 567 890"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4">
                        <h3 className="font-bold border-b pb-2 cursor-default">Identidad y Facturación</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Tipo de Documento</label>
                                <select
                                    {...register('document_type')}
                                    className="flex h-10 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                >
                                    <option value="DNI">DNI</option>
                                    <option value="RUC">RUC</option>
                                    <option value="Pasaporte">Pasaporte</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Número de Documento</label>
                                <input
                                    {...register('document_number')}
                                    className="flex h-10 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                    placeholder="Número de identidad"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium">Notas o Dirección (Opcional)</label>
                                <textarea
                                    {...register('notes')}
                                    rows={3}
                                    className="flex w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none"
                                    placeholder="Información adicional..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t">
                        <Link
                            href="/dashboard/customers"
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
                            Guardar Cliente
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
