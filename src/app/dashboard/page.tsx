'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { CreditCard, TrendingUp, Users, Activity, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function DashboardHome() {
    const { user } = useAuthStore();

    const stats = [
        {
            title: "Ingresos del Mes",
            value: "$14,500.00",
            trend: "+12.5%",
            trendUp: true,
            icon: TrendingUp,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        },
        {
            title: "Deudas Pendientes",
            value: "24",
            trend: "-3.2%",
            trendUp: false,
            icon: CreditCard,
            color: "text-amber-500",
            bg: "bg-amber-500/10"
        },
        {
            title: "Clientes Activos",
            value: "156",
            trend: "+4.1%",
            trendUp: true,
            icon: Users,
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            title: "Tasa de Recuperación",
            value: "89.2%",
            trend: "+2.4%",
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
                            <h2 className="text-2xl font-bold font-heading">{stat.value}</h2>
                            <span className={`text-xs font-medium ${stat.trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {stat.trend}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-2xl border bg-card p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg">Últimas Acciones</h3>
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border bg-muted/20">
                                <div>
                                    <p className="font-medium text-sm">Pago recibido de Carlos Mendoza</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">Hace 2 horas</p>
                                </div>
                                <span className="font-bold text-emerald-500">+$250.00</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl border bg-card p-6 shadow-sm flex flex-col justify-center items-center text-center p-10 bg-gradient-to-br from-primary/5 to-primary/10">
                    <div className="p-4 rounded-full bg-primary/20 text-primary mb-4">
                        <Users className="h-8 w-8" />
                    </div>
                    <h3 className="font-bold text-xl mb-2">Gestión de Clientes</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm text-sm">
                        Explora la información detallada de todos tus clientes, sus deudas actuales y el historial completo de pagos.
                    </p>
                    <Link href="/dashboard/customers" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90">
                        Ir al Directorio Restructurado
                        <ExternalLink className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
