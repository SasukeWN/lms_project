"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import AdminNavbar from "@/app/component_admin/navbar/Navbar"

export default function AdminDashboard() {
    const router = useRouter()
    const [stats, setStats] = useState({
        total_users: 0,
        total_subjects: 0,
        total_materials: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await axios.get('/action/admin/dashboard')
                setStats(res.data.data)
            } catch (error: any) {
                if (error.response?.status === 401 || error.response?.status === 403) {
                    alert("Sesi berakhir atau Anda bukan Admin!")
                    router.push('/auth/login')
                }
            } finally {
                setLoading(false)
            }
        }
        fetchDashboard()
    }, [router])

    return (
        <div className="h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar dari Komponen Terpisah */}
            <AdminNavbar />

            {/* Main Content (Kanan) */}
            <div className="flex-1 flex flex-col w-full">
                {/* Topbar Desktop */}
                <header className="hidden md:flex h-16 bg-white border-b border-slate-200 items-center justify-between px-8">
                    <h1 className="text-xl font-bold text-slate-800">Dashboard Admin</h1>
                    <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold border-2 border-white shadow-sm">
                            A
                        </div>
                    </div>
                </header>

                {/* Dashboard Area */}
                <main className="p-8 flex-1 overflow-y-auto">
                    {/* Welcome Banner */}
                    <div className="bg-slate-900 rounded-2xl p-8 mb-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-700 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />
                        <div className="relative z-10">
                            <h2 className="text-2xl font-bold text-white mb-2">Selamat datang, Administrator! 👋</h2>
                            <p className="text-slate-400 max-w-lg">
                                Pantau perkembangan aktivitas belajar mengajar. Di sini Anda bisa mengelola pengguna, mata pelajaran, dan metrik sistem lainnya.
                            </p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    {loading ? (
                        <div className="text-center text-slate-500 py-10 animate-pulse">Mengambil data metrik...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Card 1 */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
                                <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-2xl">
                                    👥
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500 mb-1">Total Pengguna</p>
                                    <h3 className="text-3xl font-bold text-slate-900">{stats.total_users}</h3>
                                </div>
                            </div>
                            
                            {/* Card 2 */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
                                <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center text-2xl">
                                    📚
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500 mb-1">Mata Pelajaran</p>
                                    <h3 className="text-3xl font-bold text-slate-900">{stats.total_subjects}</h3>
                                </div>
                            </div>

                            {/* Card 3 */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
                                <div className="w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center text-2xl">
                                    📝
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500 mb-1">Total Materi</p>
                                    <h3 className="text-3xl font-bold text-slate-900">{stats.total_materials}</h3>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
