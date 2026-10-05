"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import axios from "axios"

export default function AdminNavbar() {
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
            {/* Mobile Header (Topbar pengganti di layar kecil) */}
            <div className="md:hidden flex items-center justify-between bg-white h-16 px-4 border-b border-slate-200 sticky top-0 z-30">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                        </svg>
                    </div>
                    <span className="font-bold text-slate-800">EduPortal</span>
                </div>

                {/* Hamburger Button */}
                <button
                    onClick={() => setIsOpen(true)}
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>

            {/* Overlay Gelap di Mobile pas Drawer kebuka */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <div className={`
                fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 
                flex flex-col justify-between min-h-screen
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div>
                    {/* Header Sidebar Desktop (Di mobile di-hide karena udah ada Mobile Header) */}
                    <div className="h-16 hidden md:flex items-center px-6 border-b border-slate-100">
                        <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                            </svg>
                        </div>
                        <span className="font-bold text-slate-800 text-lg">EduPortal</span>
                    </div>

                    {/* Header Sidebar Mobile (ada tombol close) */}
                    <div className="h-16 flex md:hidden items-center justify-between px-4 border-b border-slate-100">
                        <span className="font-bold text-slate-800">Menu Navigasi</span>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="p-4 space-y-1">
                        <Link
                            href="/admin/dashboard"
                            onClick={() => setIsOpen(false)}
                            className="px-3 py-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-lg font-medium text-sm flex items-center gap-3 transition-colors"
                        >
                            <span className="text-lg">📊</span> Dashboard
                        </Link>
                        <Link
                            href="/admin/subject"
                            onClick={() => setIsOpen(false)}
                            className="px-3 py-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-lg font-medium text-sm flex items-center gap-3 transition-colors"
                        >
                            <span className="text-lg">📚</span> Mata Pelajaran
                        </Link>
                        <Link
                            href="/admin/topic"
                            onClick={() => setIsOpen(false)}
                            className="px-3 py-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-lg font-medium text-sm flex items-center gap-3 transition-colors"
                        >
                            <span className="text-lg">📑</span> Topik / Bab
                        </Link>
                        <Link
                            href="/admin/material"
                            onClick={() => setIsOpen(false)}
                            className="px-3 py-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-lg font-medium text-sm flex items-center gap-3 transition-colors"
                        >
                            <span className="text-lg">📝</span> Modul Materi
                        </Link>
                        <Link
                            href="/admin/quiz"
                            onClick={() => setIsOpen(false)}
                            className="px-3 py-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-lg font-medium text-sm flex items-center gap-3 transition-colors"
                        >
                            <span className="text-lg">🎯</span> Manajemen Kuis
                        </Link>
                        <Link
                            href="/admin/scores"
                            onClick={() => setIsOpen(false)}
                            className="px-3 py-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-lg font-medium text-sm flex items-center gap-3 transition-colors"
                        >
                            <span className="text-lg">📈</span> Rekap Nilai
                        </Link>
                        <Link
                            href="/admin/users"
                            onClick={() => setIsOpen(false)}
                            className="px-3 py-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-lg font-medium text-sm flex items-center gap-3 transition-colors"
                        >
                            <span className="text-lg">👥</span> Manajemen User
                        </Link>

                        <Link
                            href="/admin/topic"
                            onClick={() => setIsOpen(false)}
                            className="px-3 py-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-lg font-medium text-sm flex items-center gap-3 transition-colors"
                        >
                            <span className="text-lg">👥</span> Manajemen topic
                        </Link>
                    </div>
                </div>

                {/* Logout Button */}
                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={handleLogout}
                        className="w-full px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg font-medium text-sm flex items-center gap-3 transition-colors"
                    >
                        <span className="text-lg">🚪</span> Keluar
                    </button>
                </div>
            </div>
        </>
    )
}
