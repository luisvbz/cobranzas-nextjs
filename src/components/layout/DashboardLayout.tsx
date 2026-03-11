'use client';

import { useAuthStore } from '@/store/useAuthStore';
import {
    LayoutDashboard,
    Users,
    CreditCard,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    Search,
    MessageSquare
} from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AuthGuard from '@/components/auth/AuthGuard';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', exact: true },
    { icon: Users, label: 'Clientes', href: '/dashboard/customers' },
    { icon: CreditCard, label: 'Deudas', href: '/dashboard/debts' },
    { icon: MessageSquare, label: 'Recordatorios', href: '/dashboard/reminders' },
    { icon: Settings, label: 'Configuración', href: '/dashboard/settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, logout } = useAuthStore();
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    return (
        <AuthGuard>
            <div className="flex min-h-screen bg-background">
                {/* Mobile Sidebar Overlay */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside className={`
          fixed inset-y-0 left-0 z-50 w-64 transform border-r border-border bg-white p-6 transition-transform duration-300 ease-in-out dark:bg-black lg:static lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
                    <div className="mb-10 flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <CreditCard className="h-5 w-5" />
                        </div>
                        <span className="font-heading text-xl font-bold tracking-tight">CobroFlow</span>
                    </div>

                    <nav className="space-y-1">
                        {menuItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                  flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all
                  ${(item.exact ? pathname === item.href : pathname.startsWith(item.href))
                                        ? 'bg-primary/10 text-primary font-semibold'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'}
                `}
                                onClick={() => setIsSidebarOpen(false)}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.label}
                            </Link>
                        ))}

                        {user?.roles.includes('super-admin') && (
                            <Link
                                href="/dashboard/admin"
                                className={`
                  flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all text-accent hover:bg-accent/10
                  ${pathname === '/dashboard/admin' ? 'bg-accent/10 font-bold' : ''}
                `}
                                onClick={() => setIsSidebarOpen(false)}
                            >
                                <Settings className="h-5 w-5" />
                                Administración
                            </Link>
                        )}
                    </nav>

                    <div className="absolute bottom-6 left-6 right-6">
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-destructive transition-all hover:bg-destructive/10"
                        >
                            <LogOut className="h-5 w-5" />
                            Cerrar Sesión
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex flex-1 flex-col overflow-hidden">
                    {/* Topbar */}
                    <header className="flex h-16 items-center justify-between border-bottom border-border bg-white px-6 dark:bg-black">
                        <button
                            className="rounded-lg p-2 hover:bg-muted lg:hidden"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu className="h-6 w-6" />
                        </button>

                        <div className="hidden h-10 w-full max-w-md items-center gap-2 rounded-xl bg-muted px-3 lg:flex">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Buscar..."
                                className="w-full bg-transparent text-sm focus:outline-none"
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="relative rounded-full p-2 hover:bg-muted">
                                <Bell className="h-5 w-5" />
                                <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-primary" />
                            </button>

                            <div className="flex items-center gap-3 border-l border-border pl-4">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-semibold">{user?.name}</p>
                                    <p className="text-xs text-muted-foreground capitalize">{user?.roles[0]}</p>
                                </div>
                                <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                    {user?.name?.[0].toUpperCase()}
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Content Area */}
                    <section className="flex-1 overflow-y-auto p-6 lg:p-10">
                        {children}
                    </section>
                </main>
            </div>
        </AuthGuard>
    );
}
