'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Customer, PaginatedResponse } from '@/types';
import { Loader2, Plus, Search, Eye, Users, CreditCard, ChevronLeft, ChevronRight, UserPlus } from 'lucide-react';
import Link from 'next/link';

function CustomerAvatar({ name }: { name: string }) {
    const initials = name
        .split(' ')
        .slice(0, 2)
        .map(n => n[0])
        .join('')
        .toUpperCase();

    // Generate a deterministic pastel color based on name
    const colors = [
        'bg-violet-100 text-violet-700',
        'bg-blue-100 text-blue-700',
        'bg-emerald-100 text-emerald-700',
        'bg-amber-100 text-amber-700',
        'bg-rose-100 text-rose-700',
        'bg-cyan-100 text-cyan-700',
    ];
    const colorIndex = name.charCodeAt(0) % colors.length;

    return (
        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${colors[colorIndex]}`}>
            {initials}
        </div>
    );
}

export default function CustomersPage() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const { data, isLoading } = useQuery({
        queryKey: ['customers', search, page],
        queryFn: async () => {
            const params: Record<string, string | number> = { page };
            if (search) params['filter[name]'] = search;
            const res = await api.get('/customers', { params });
            return res.data as PaginatedResponse<Customer>;
        },
    });

    const customers = data?.data ?? [];
    const meta = data?.meta;

    // Debounce search - reset to page 1 on search change
    const handleSearch = (val: string) => {
        setSearch(val);
        setPage(1);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="font-heading text-3xl font-bold text-foreground">Clientes</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Gestiona el directorio de clientes y sus historiales de cobranza.
                    </p>
                </div>
                <Link
                    href="/dashboard/customers/new"
                    className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
                >
                    <Plus className="h-4 w-4" />
                    Nuevo Cliente
                </Link>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Buscar por nombre, email o documento..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="flex h-10 w-full rounded-xl border border-input bg-card px-10 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm"
                />
            </div>

            {/* Table */}
            <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : customers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <UserPlus className="h-12 w-12 text-muted-foreground/30 mb-4" />
                        <h3 className="font-semibold text-foreground">
                            {search ? 'Sin resultados' : 'No hay clientes registrados'}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            {search ? `No se encontraron clientes que coincidan con "${search}".` : 'Crea tu primer cliente para comenzar.'}
                        </p>
                        {!search && (
                            <Link href="/dashboard/customers/new" className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline">
                                <Plus className="h-4 w-4" /> Crear Cliente
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-muted/50 text-xs uppercase text-muted-foreground border-b">
                                    <th className="px-6 py-4 text-left font-bold">Cliente</th>
                                    <th className="px-6 py-4 text-left font-bold hidden sm:table-cell">Documento</th>
                                    <th className="px-6 py-4 text-left font-bold hidden md:table-cell">Contacto</th>
                                    <th className="px-6 py-4 text-left font-bold hidden lg:table-cell">Deudas</th>
                                    <th className="px-6 py-4 text-right font-bold">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {customers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-muted/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <CustomerAvatar name={customer.name} />
                                                <div>
                                                    <p className="font-semibold text-foreground">{customer.name}</p>
                                                    {customer.email && (
                                                        <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">{customer.email}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden sm:table-cell">
                                            {customer.document_type || customer.document_number ? (
                                                <div>
                                                    <span className="text-xs font-medium bg-muted px-1.5 py-0.5 rounded mr-1.5">{customer.document_type || '?'}</span>
                                                    <span className="text-muted-foreground">{customer.document_number || '—'}</span>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground/50">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <div className="space-y-0.5 text-muted-foreground">
                                                <p>{customer.email || '—'}</p>
                                                <p className="text-xs">{customer.phone || '—'}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden lg:table-cell">
                                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                                <CreditCard className="h-3.5 w-3.5" />
                                                {customer.debts?.length ?? '—'}
                                                {(customer.debts?.length ?? 0) !== 1 ? ' deudas' : ' deuda'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/dashboard/customers/${customer.id}`}
                                                className="inline-flex items-center gap-1.5 rounded-lg bg-secondary/20 px-3 py-1.5 text-xs font-bold text-secondary-foreground hover:bg-secondary/30 transition-colors"
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                                Ver
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {meta && meta.last_page > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/20">
                        <p className="text-sm text-muted-foreground">
                            Mostrando {customers.length} de {meta.total} clientes
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium border hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="h-4 w-4" /> Anterior
                            </button>
                            <span className="text-sm font-medium text-muted-foreground px-2">{page} / {meta.last_page}</span>
                            <button
                                onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                                disabled={page === meta.last_page}
                                className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium border hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Siguiente <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
