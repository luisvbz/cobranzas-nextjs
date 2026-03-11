'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Customer } from '@/types';
import { Loader2, Plus, Search, Eye, Users } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function CustomersPage() {
    const [search, setSearch] = useState('');

    const { data: customers, isLoading } = useQuery({
        queryKey: ['customers', search],
        queryFn: async () => {
            const res = await api.get('/customers', {
                params: search ? { 'filter[name]': search } : {}
            });
            return res.data.data as Customer[];
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="font-heading text-3xl font-bold flex items-center gap-3">
                        <Users className="h-8 w-8 text-primary" />
                        Clientes
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Gestiona el directorio de clientes y sus historiales de cobranza.
                    </p>
                </div>
                <Link href="/dashboard/customers/new" className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90">
                    <Plus className="h-4 w-4" />
                    Nuevo Cliente
                </Link>
            </div>

            <div className="rounded-2xl border bg-card p-6 shadow-sm">
                <div className="mb-6 flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex h-10 w-full rounded-xl border border-input bg-transparent px-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex h-40 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="relative overflow-x-auto rounded-xl border">
                        <table className="w-full text-left text-sm text-muted-foreground">
                            <thead className="bg-muted/50 text-xs uppercase text-foreground">
                                <tr>
                                    <th className="px-6 py-4 font-bold">Nombre</th>
                                    <th className="px-6 py-4 font-bold">Documento</th>
                                    <th className="px-6 py-4 font-bold">Contacto</th>
                                    <th className="px-6 py-4 font-bold text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers?.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center bg-background">
                                            No se encontraron clientes.
                                        </td>
                                    </tr>
                                ) : (
                                    customers?.map((customer) => (
                                        <tr key={customer.id} className="border-b bg-background hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4 font-medium text-foreground">
                                                {customer.name}
                                            </td>
                                            <td className="px-6 py-4">
                                                {customer.document_type} {customer.document_number}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>{customer.email || '—'}</div>
                                                <div className="text-xs">{customer.phone || '—'}</div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    href={`/dashboard/customers/${customer.id}`}
                                                    className="inline-flex items-center gap-2 rounded-lg bg-secondary/20 px-3 py-1.5 text-xs font-bold text-secondary-foreground hover:bg-secondary/30 transition-colors"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    Ver Perfil
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
