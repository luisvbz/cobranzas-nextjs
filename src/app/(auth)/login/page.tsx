'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, Mail, ChevronRight, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const loginSchema = z.object({
    email: z.string().email('Ingresa un correo electrónico válido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const [serverError, setServerError] = useState('');
    const { login, isLoading } = useAuthStore();
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        setServerError('');
        try {
            await login(data);
            router.push('/dashboard');
        } catch (err: any) {
            setServerError(err.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.');
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
            {/* Dynamic Background Gradients */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                    rotate: [0, 90, 0],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute -top-[20%] -left-[10%] h-[60%] w-[60%] rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 blur-[120px]"
            />
            <motion.div
                animate={{
                    scale: [1.2, 1, 1.2],
                    opacity: [0.2, 0.4, 0.2],
                    rotate: [0, -90, 0],
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-[20%] -right-[10%] h-[60%] w-[60%] rounded-full bg-gradient-to-tr from-accent/20 to-primary/20 blur-[120px]"
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="z-10 w-full max-w-md"
            >
                <div className="text-center mb-6">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/30"
                    >
                        <Lock className="h-7 w-7" />
                    </motion.div>
                    <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground">
                        CobroFlow
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground font-medium">
                        Gestión inteligente de cobranzas SaaS.
                    </p>
                </div>

                {/* Glassmorphism Card */}
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>

                    <div className="relative rounded-3xl border border-white/20 bg-white/40 p-6 backdrop-blur-xl backdrop-saturate-150 dark:border-white/10 dark:bg-black/40 lg:p-8 shadow-xl">
                        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
                            <AnimatePresence mode="wait">
                                {serverError && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="flex items-center gap-2 rounded-xl bg-red-500/10 p-3 text-xs font-semibold text-red-600 dark:text-red-400 border border-red-500/20"
                                    >
                                        <AlertCircle className="h-4 w-4 shrink-0" />
                                        {serverError}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-foreground/70 ml-1 uppercase tracking-wider" htmlFor="email">
                                    Correo Electrónico
                                </label>
                                <div className="space-y-1">
                                    <div className="relative group/field">
                                        <Mail className="absolute top-1/2 left-3.5 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground group-focus-within/field:text-primary transition-colors" />
                                        <input
                                            {...register('email')}
                                            id="email"
                                            type="email"
                                            placeholder="admin@ejemplo.com"
                                            className={`flex h-11 w-full rounded-xl border transition-all bg-white/50 dark:bg-black/50 px-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/40 ${errors.email ? 'border-red-500 focus-visible:ring-red-500/40 focus-visible:border-red-500' : 'border-border'}`}
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="ml-1 text-[11px] font-bold text-red-500 animate-in fade-in slide-in-from-top-1">
                                            {errors.email.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="text-xs font-bold text-foreground/70 uppercase tracking-wider" htmlFor="password">
                                        Contraseña
                                    </label>
                                    <button type="button" className="text-[10px] font-bold text-primary hover:underline">
                                        ¿Olvidaste tu contraseña?
                                    </button>
                                </div>
                                <div className="space-y-1">
                                    <div className="relative group/field">
                                        <Lock className="absolute top-1/2 left-3.5 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground group-focus-within/field:text-primary transition-colors" />
                                        <input
                                            {...register('password')}
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            className={`flex h-11 w-full rounded-xl border transition-all bg-white/50 dark:bg-black/50 px-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/40 ${errors.password ? 'border-red-500 focus-visible:ring-red-500/40 focus-visible:border-red-500' : 'border-border'}`}
                                        />
                                    </div>
                                    {errors.password && (
                                        <p className="ml-1 text-[11px] font-bold text-red-500 animate-in fade-in slide-in-from-top-1">
                                            {errors.password.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={isLoading}
                                className="group relative flex h-11 w-full items-center justify-center overflow-hidden rounded-xl bg-primary px-4 py-2 font-heading font-bold text-sm text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 disabled:opacity-70"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            Entrar a la Plataforma
                                            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </>
                                    )}
                                </span>
                                <div className="absolute inset-x-0 bottom-0 h-0 bg-white/10 transition-all group-hover:h-full" />
                            </motion.button>
                        </form>

                        <div className="mt-8 text-center text-[13px]">
                            <p className="font-medium text-muted-foreground">
                                ¿Nuevo en CobroFlow?{' '}
                                <a href="#" className="font-bold text-foreground hover:text-primary transition-colors">
                                    Prueba 14 días gratis
                                </a>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Trusted By / Footer Label */}
                <p className="mt-12 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground/50">
                    Infraestructura Segura • 99.9% Uptime
                </p>
            </motion.div>
        </div>
    );
}
