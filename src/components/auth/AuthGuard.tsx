'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2 } from 'lucide-react';

export default function AuthGuard({
    children,
    requiredRole
}: {
    children: React.ReactNode,
    requiredRole?: string
}) {
    const { user, isAuthenticated, isLoading, fetchUser } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (!isHydrated) return;

        const checkAuth = async () => {
            if (!isAuthenticated) {
                try {
                    await fetchUser();
                } catch (error) {
                    router.push('/login');
                }
            }
        };

        checkAuth();
    }, [isHydrated, isAuthenticated, fetchUser, router]);

    useEffect(() => {
        if (!isHydrated) return;

        if (!isLoading && !isAuthenticated && pathname !== '/login') {
            router.push('/login');
        }

        if (isAuthenticated && requiredRole && user && !user.roles.includes(requiredRole)) {
            router.push('/dashboard');
        }
    }, [isHydrated, isAuthenticated, isLoading, user, requiredRole, router, pathname]);

    if (!isHydrated || isLoading || (!isAuthenticated && pathname !== '/login')) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return <>{children}</>;
}
