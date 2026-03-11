'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { CreditCard, TrendingUp, Users, Activity, ExternalLink, Loader2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export default function DashboardHome() {
    const { user } = useAuthStore();

    const { data: metrics, isLoading, isError } = useQuery({
        queryKey: ['dashboard-metrics'],
        queryFn: async () => {
            const res = await api.get('/dashboard');
            return res.data.data;
        }
    });

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isError || !metrics) {
        return (
            <div className="flex flex-col h-[60vh] items-center justify-center text-center space-y-4">
                <AlertTriangle className="h-12 w-12 text-destructive" />
                <h2 className="text-xl font-bold">Error al cargar métricas</h2>
                <p className="text-muted-foreground">Ocurrió un error de conexión con el servidor.</p>
            </div>
        );
    }

    const stats = [
        {
            title: "Ingresos del Mes",
            value: `$${Number(metrics.payments_this_month).toLocaleString()}`,
            trend: "Este mes",
            trendUp: true,
            icon: TrendingUp,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        },
        {
            title: "Capital por Cobrar",
            value: `$${Number(metrics.total_by_collect).toLocaleString()}`,
            trend: "Pendiente general",
            trendUp: false,
            icon: CreditCard,
            color: "text-amber-500",
            bg: "bg-amber-500/10"
        },
        {
            title: "Capital Vencido",
            value: `$${Number(metrics.total_overdue).toLocaleString()}`,
            trend: "En mora",
            trendUp: false,
            icon: AlertTriangle,
            color: "text-rose-500",
            bg: "bg-rose-500/10"
        },
        {
            title: "Tasa de Recueración",
            value: metrics.recovery_rate,
            trend: "Global",
            trendUp: true,
            icon: Activity,
            color: "text-purple-500",
            bg: "bg-purple-500/10"
        }
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
                    ¡Hola, {user?.name?.split(' ')[0] || 'Administrador'}! 👋
                </h1>
                <p className="text-muted-foreground">
                    Aquí tienes un resumen del estado de tus cobranzas al día de hoy.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => (
                    <div key={i} className="rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
                            <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-baseline gap-2">
                            <h2 className="text-2xl font-bold font-heading w-full truncate" title={stat.value}>{stat.value}</h2>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground mt-1 block">
                            {stat.trend}
                        </span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-2xl border bg-card p-6 shadow-sm flex flex-col justify-center items-center text-center p-10 bg-gradient-to-br from-primary/5 to-primary/10">
                    <div className="p-4 rounded-full bg-primary/20 text-primary mb-4">
                        <Users className="h-8 w-8" />
                    </div>
                    <h3 className="font-bold text-xl mb-2">Gestión de Clientes</h3>
                    <p className="text-muted-foreground mb-4 max-w-sm text-sm">
                        Total de clientes activos en la plataforma: <strong>{metrics.active_customers}</strong>
                    </p>
                    <Link href="/dashboard/customers" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90">
                        Abrir Directorio
                        <ExternalLink className="h-4 w-4" />
                    </Link>
                </div>

                <div className="rounded-2xl border bg-card p-6 shadow-sm flex flex-col justify-center items-center text-center p-10 bg-gradient-to-br from-secondary/5 to-secondary/10">
                    <div className="p-4 rounded-full bg-secondary/20 text-secondary mb-4">
                        <CreditCard className="h-8 w-8" />
                    </div>
                    <h3 className="font-bold text-xl mb-2">Nueva Deuda</h3>
                    <p className="text-muted-foreground mb-4 max-w-sm text-sm">
                        Registra rápidamente nuevos compromisos de pago para tus clientes y envía recordatorios.
                    </p>
                    <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-6 py-3 text-sm font-bold text-secondary-foreground shadow-lg shadow-secondary/20 transition-all hover:bg-secondary/90">
                        Crear Deuda
                    </button>
                </div>
            </div>
        </div>
    );
}
