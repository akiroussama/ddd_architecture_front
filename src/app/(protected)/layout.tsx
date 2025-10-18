import type { Metadata } from "next"
import Link from "next/link"
import { Geist, Geist_Mono } from "next/font/google"
import { Toaster } from "sonner"

import { MobileNav } from "@/shared/components/navigation/mobile-nav"
import { MainNav } from "@/shared/components/navigation/main-nav"
import { TooltipProvider } from "@/shared/ui/tooltip"

import "./globals.css"

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
})

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
})

const navItems = [
    {
        href: "/substance-manager",
        label: "Substance Manager",
        description: "Gestion simplifiée des substances V2",
    },
    {
        href: "/inci",
        label: "Référentiel INCI",
        description: "Dénomination ingrédients & inventaires",
    },
    {
        href: "/raw-materials",
        label: "Matières Premières",
        description: "Gestion par site de production",
    },
    {
        href: "/blacklists",
        label: "Blacklists",
        description: "Charte marques et restrictions internes",
    },
    {
        href: "/substances",
        label: "Substances V2",
        description: "Référentiel INCI et restrictions",
    },
]

export const metadata: Metadata = {
    title: "GeberGuard PLM • Module INCI/Substance",
    description:
        "Prototype Next.js pour visualiser le module INCI/Substance du PLM cosmétique.",
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="fr" suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} bg-slate-50 text-slate-900 antialiased`}
            >
                <TooltipProvider>
                    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
                        <aside className="hidden border-r border-slate-200 bg-white/80 px-6 py-10 backdrop-blur lg:block">
                            <Link href="/substances" className="block text-left">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-2xl">🧴</span>
                                    <div>
                                        <span className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-color">
                                            ChromaSoft
                                        </span>
                                        <p className="text-xs text-secondary-color dark:text-slate-400">v1.2</p>
                                    </div>
                                </div>
                            </Link>
                            <div className="mt-10">
                                <MainNav items={navItems} />
                            </div>
                        </aside>
                        <div className="flex min-h-screen flex-col">
                            <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
                                <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
                                    <div className="flex flex-col gap-1">
                                        <p className="text-xs font-medium uppercase tracking-[0.25em] text-slate-500">
                                            Module INCI / Substance
                                        </p>
                                        <h1 className="text-lg font-semibold text-slate-900">
                                            Référentiel ingrédients cosmétique
                                        </h1>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MobileNav items={navItems} />
                                        <span className="hidden rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 sm:inline-flex">
                                            MVP interactif • Oct 2025
                                        </span>
                                    </div>
                                </div>
                            </header>
                            <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
                        </div>
                    </div>
                </TooltipProvider>
                <Toaster position="bottom-right" expand richColors closeButton />
            </body>
        </html>
    )
}
