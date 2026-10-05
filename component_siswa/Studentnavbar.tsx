"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import axios from "axios"

export default function StudentNavbar() {
    const pathname = usePathname()
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)

    const handleLogout = async () => {
        if (window.confirm("Yakin ingin keluar?")) {
            try {
                await axios.post("/action/auth/logout")
                router.push("/auth/login")
            } catch (error) {
                console.error("Gagal logout", error)
                alert("Gagal logout, silakan coba lagi.")
            }
        }
    }

    const navItems = [
        { href: "/siswa/dashboard", label: "Dashboard", icon: "🏠", section: "main" },
        { href: "/siswa/subjects", label: "Mata Pelajaran", icon: "📚", section: "belajar" },
        { href: "/siswa/scores", label: "Nilai Saya", icon: "📊", section: "evaluasi" },
    ]

    const isActive = (href: string) => pathname.startsWith(href)

    return (
        <>
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between bg-white border-b border-violet-100 p-4 shadow-sm">
                <div className="font-bold text-xl text-violet-700 tracking-tight flex items-center gap-2">
                    <span className="text-2xl">🎓</span>
                    <span>EduSpace</span>
                </div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 text-slate-500 hover:bg-violet-50 rounded-xl transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                    </svg>
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`
                fixed md:static inset-y-0 left-0 z-50
                w-64 bg-white border-r border-violet-100 flex flex-col transition-transform duration-300 shadow-lg md:shadow-none
                ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
            `}>
                {/* Logo */}
                <div className="p-6 border-b border-violet-50 hidden md:block">
                    <Link href="/siswa/dashboard" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-200">
                            <span className="text-xl">🎓</span>
                        </div>
                        <div>
                            <div className="font-bold text-lg text-slate-800 leading-tight">EduSpace</div>
                            <div className="text-xs text-violet-500 font-medium">Student Portal</div>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    <div className="px-2 mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Menu Utama</div>

                    <Link
                        href="/siswa/dashboard"
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200
                            ${isActive("/siswa/dashboard")
                                ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md shadow-violet-200"
                                : "text-slate-500 hover:bg-violet-50 hover:text-violet-700"
                            }`}
                    >
                        <span className="text-lg">🏠</span> Dashboard
                    </Link>

                    <div className="px-2 mt-5 mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Belajar</div>

                    <Link
                        href="/siswa/subjects"
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200
                            ${isActive("/siswa/subjects") || isActive("/siswa/learn") || isActive("/siswa/material") || isActive("/siswa/quiz")
                                ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md shadow-violet-200"
                                : "text-slate-500 hover:bg-violet-50 hover:text-violet-700"
                            }`}
                    >
                        <span className="text-lg">📚</span> Mata Pelajaran
                    </Link>

                    <div className="px-2 mt-5 mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Evaluasi</div>

                    <Link
                        href="/siswa/scores"
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200
                            ${isActive("/siswa/scores")
                                ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md shadow-violet-200"
                                : "text-slate-500 hover:bg-violet-50 hover:text-violet-700"
                            }`}
                    >
                        <span className="text-lg">📊</span> Nilai Saya
                    </Link>
                </div>

                {/* Logout */}
                <div className="p-4 border-t border-violet-50">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                        <span className="text-lg">🚪</span> Keluar
                    </button>
                </div>
            </aside>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    )
}
