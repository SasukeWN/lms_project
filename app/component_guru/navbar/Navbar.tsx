"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import axios from "axios"

export default function GuruNavbar() {
    const pathname = usePathname()
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)

    const handleLogout = async () => {
        if (window.confirm("Yakin ingin logout?")) {
            try {
                await axios.post("/action/auth/logout")
                router.push("/auth/login")
            } catch (error) {
                console.error("Gagal logout", error)
                alert("Gagal logout, silakan coba lagi.")
            }
        }
    }

    return (
        <>
            {/* Mobile Toggle */}
            <div className="md:hidden flex items-center justify-between bg-white border-b border-slate-200 p-4">
                <div className="font-bold text-xl text-slate-800 tracking-tight flex items-center gap-2">
                    <span className="text-2xl">👨‍🏫</span>
                    LMS Guru
                </div>
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                    </svg>
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`
                fixed md:static inset-y-0 left-0 z-50
                w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300
                ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
            `}>
                <div className="p-6 border-b border-slate-100 hidden md:block">
                    <Link href="/guru/dashboard_guru" className="font-bold text-xl text-slate-800 tracking-tight flex items-center gap-2">
                        <span className="text-2xl">👨‍🏫</span>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-amber-800">
                            Guru Panel
                        </span>
                    </Link>
                </div>

                <div className="flex-1 overflow-y-auto py-4">
                    <div className="px-4 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Main Menu
                    </div>
                    <div className="px-3 space-y-1">
                        <Link 
                            href="/guru/dashboard_guru" 
                            onClick={() => setIsOpen(false)}
                            className={`px-3 py-2.5 rounded-lg font-medium text-sm flex items-center gap-3 transition-colors
                                ${pathname.includes('/dashboard_guru') ? 'bg-amber-50 text-amber-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                            `}
                        >
                            <span className="text-lg">📊</span> Dashboard
                        </Link>
                    </div>

                    <div className="px-4 mt-6 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Akademik & Konten
                    </div>
                    <div className="px-3 space-y-1">
                        <Link 
                            href="/guru/subject" 
                            onClick={() => setIsOpen(false)}
                            className={`px-3 py-2.5 rounded-lg font-medium text-sm flex items-center gap-3 transition-colors
                                ${pathname.includes('/subject') ? 'bg-amber-50 text-amber-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                            `}
                        >
                            <span className="text-lg">📚</span> Mata Pelajaran
                        </Link>
                        <Link 
                            href="/guru/topic" 
                            onClick={() => setIsOpen(false)}
                            className={`px-3 py-2.5 rounded-lg font-medium text-sm flex items-center gap-3 transition-colors
                                ${pathname.includes('/topic') ? 'bg-amber-50 text-amber-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                            `}
                        >
                            <span className="text-lg">🏷️</span> Topik / Bab
                        </Link>
                        <Link 
                            href="/guru/material" 
                            onClick={() => setIsOpen(false)}
                            className={`px-3 py-2.5 rounded-lg font-medium text-sm flex items-center gap-3 transition-colors
                                ${pathname.includes('/material') ? 'bg-amber-50 text-amber-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                            `}
                        >
                            <span className="text-lg">📝</span> Modul Materi
                        </Link>
                        <Link 
                            href="/guru/quiz" 
                            onClick={() => setIsOpen(false)}
                            className={`px-3 py-2.5 rounded-lg font-medium text-sm flex items-center gap-3 transition-colors
                                ${pathname.includes('/quiz') || pathname.includes('/question') ? 'bg-amber-50 text-amber-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                            `}
                        >
                            <span className="text-lg">🎯</span> Kuis & Soal
                        </Link>
                    </div>

                    <div className="px-4 mt-6 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Evaluasi
                    </div>
                    <div className="px-3 space-y-1">
                        <Link 
                            href="/guru/scores" 
                            onClick={() => setIsOpen(false)}
                            className={`px-3 py-2.5 rounded-lg font-medium text-sm flex items-center gap-3 transition-colors
                                ${pathname.includes('/scores') ? 'bg-amber-50 text-amber-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                            `}
                        >
                            <span className="text-lg">📈</span> Rekap Nilai
                        </Link>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-100">
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <span className="text-lg">🚪</span> Keluar
                    </button>
                </div>
            </aside>

            {/* Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    )
}
