import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "PathFinder - Configuración de Perfil",
    description:
        "Completa tu perfil en PathFinder y prepárate para tu primera experiencia profesional",
};

export default function PrivateLayout({
                                          children,
                                      }: {
    children: React.ReactNode;
}) {
    return <main className="min-h-screen bg-background">{children}</main>;
}