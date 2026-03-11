'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { Bell, Mail, MessageSquare, Shield, User, Building2, Save, Loader2 } from 'lucide-react';
import { useState } from 'react';

function SettingSection({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
    return (
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 border-b bg-muted/20">
                <Icon className="h-4 w-4 text-primary" />
                <h2 className="font-bold text-sm">{title}</h2>
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

function Toggle({ label, description, defaultChecked = false }: { label: string; description?: string; defaultChecked?: boolean }) {
    const [on, setOn] = useState(defaultChecked);
    return (
        <div className="flex items-center justify-between py-3 border-b last:border-0">
            <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
            </div>
            <button
                onClick={() => setOn(v => !v)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${on ? 'bg-primary' : 'bg-muted-foreground/30'}`}
            >
                <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${on ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </div>
    );
}

export default function SettingsPage() {
    const { user } = useAuthStore();
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        await new Promise(r => setTimeout(r, 800));
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="space-y-6 max-w-3xl pb-10">
            {/* Header */}
            <div>
                <h1 className="font-heading text-3xl font-bold text-foreground">Configuración</h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    Administra tu perfil, preferencias de notificación y configuración de la organización.
                </p>
            </div>

            {/* Profile */}
            <SettingSection title="Perfil de Usuario" icon={User}>
                <div className="flex items-center gap-4 mb-6">
                    <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl font-bold">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                        <p className="font-bold text-foreground">{user?.name || 'Usuario'}</p>
                        <p className="text-sm text-muted-foreground">{user?.email || 'email@example.com'}</p>
                        <p className="text-xs text-primary mt-0.5 font-medium capitalize">{user?.roles?.[0] || 'admin'}</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Nombre</label>
                        <input
                            defaultValue={user?.name}
                            className="flex h-10 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email</label>
                        <input
                            defaultValue={user?.email}
                            type="email"
                            className="flex h-10 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contraseña Nueva <span className="normal-case font-normal text-muted-foreground">(dejar en blanco para no cambiar)</span></label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="flex h-10 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        />
                    </div>
                </div>
            </SettingSection>

            {/* Organization */}
            <SettingSection title="Organización" icon={Building2}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Nombre de la Empresa</label>
                        <input
                            defaultValue={user?.organization?.name || ''}
                            className="flex h-10 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            placeholder="Mi Empresa S.A."
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">RUC / RFC / NIT</label>
                        <input
                            className="flex h-10 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            placeholder="20123456789"
                        />
                    </div>
                </div>
            </SettingSection>

            {/* Notification Preferences */}
            <SettingSection title="Preferencias de Notificación" icon={Bell}>
                <div className="mb-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        <Mail className="h-3.5 w-3.5" /> Email
                    </div>
                    <Toggle label="Recordatorio de cuota próxima a vencer" description="Se envía 3 días antes del vencimiento" defaultChecked />
                    <Toggle label="Notificación de cuota vencida" description="Se envía el día del vencimiento" defaultChecked />
                    <Toggle label="Confirmación de pago recibido" defaultChecked />
                </div>
                <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        <MessageSquare className="h-3.5 w-3.5" /> WhatsApp
                    </div>
                    <Toggle label="Recordatorio de cuota por WhatsApp" description="Requiere configurar la API de WhatsApp" />
                    <Toggle label="Notificación de vencimiento por WhatsApp" />
                </div>
            </SettingSection>

            {/* Security */}
            <SettingSection title="Seguridad" icon={Shield}>
                <Toggle label="Autenticación de dos factores (2FA)" description="Añade una capa extra de seguridad a tu cuenta" />
                <Toggle label="Notificar sobre inicios de sesión nuevos" defaultChecked />
            </SettingSection>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:opacity-60"
                >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {saved ? '¡Guardado!' : 'Guardar Cambios'}
                </button>
            </div>
        </div>
    );
}
