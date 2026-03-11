// Public pay page has its own layout - no sidebar, no auth guard
export default function PayLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="es">
            <body>{children}</body>
        </html>
    );
}
