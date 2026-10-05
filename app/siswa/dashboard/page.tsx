"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import StudentNavbar from "@/component_siswa/Studentnavbar"
import Link from "next/link"

interface Stats {
    total_pelajaran: number
    total_kuis_selesai: number
    rata_rata_nilai: number
}

interface RecentScore {
    id: number
    judul_kuis: string
    nilai: number
    created_at: string
}

export default function StudentDashboard() {
    const [siswa, setSiswa] = useState<any>(null)
    const [stats, setStats] = useState<Stats | null>(null)
    const [recent, setRecent] = useState<RecentScore[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axios.get('/action/student/dashboard')
            .then(res => {
                setSiswa(res.data.siswa)
                setStats(res.data.stats)
                setRecent(res.data.riwayat_nilai)
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const getGrade = (nilai: number) => {
        if (nilai >= 90) return { label: "A", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" }
        if (nilai >= 75) return { label: "B", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" }
        if (nilai >= 60) return { label: "C", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" }
        return { label: "D", color: "text-red-500", bg: "bg-red-50 border-red-200" }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"/>
                    <p className="text-violet-600 font-medium">Memuat dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex flex-col md:flex-row overflow-hidden">
            <StudentNavbar />
            <div className="flex-1 flex flex-col w-full overflow-hidden">
                {/* Header */}
                <header className="hidden md:flex shrink-0 h-16 bg-white/80 backdrop-blur border-b border-violet-100 items-center justify-between px-8">
                    <h1 className="text-lg font-bold text-slate-700">Dashboard Siswa</h1>
                    <div className="flex items-center gap-3">
                        <div className="text-sm text-slate-500">Halo, <span className="text-violet-700 font-semibold">{siswa?.username}</span> 👋</div>
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                            {siswa?.username?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {/* Welcome Banner */}
                    <div className="relative bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-3xl p-8 mb-8 text-white overflow-hidden shadow-xl shadow-violet-200">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3"/>
                        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-white/5 rounded-full translate-y-1/2"/>
                        <div className="relative">
                            <div className="text-4xl mb-3">👋</div>
                            <h2 className="text-2xl md:text-3xl font-bold mb-1">
                                Selamat Datang, {siswa?.username}!
                            </h2>
                            <p className="text-violet-200 text-sm md:text-base">
                                Semangat belajar hari ini! Cek materi & kuis yang menunggumu.
                            </p>
                            <Link href="/siswa/subjects" className="mt-5 inline-flex items-center gap-2 bg-white text-violet-700 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-violet-50 transition-colors shadow-md">
                                Mulai Belajar 🚀
                            </Link>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white rounded-2xl border border-violet-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center text-2xl mb-4">📚</div>
                            <div className="text-3xl font-bold text-slate-800">{stats?.total_pelajaran ?? 0}</div>
                            <div className="text-sm text-slate-500 mt-1">Mata Pelajaran Tersedia</div>
                        </div>
                        <div className="bg-white rounded-2xl border border-purple-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-2xl mb-4">✅</div>
                            <div className="text-3xl font-bold text-slate-800">{stats?.total_kuis_selesai ?? 0}</div>
                            <div className="text-sm text-slate-500 mt-1">Kuis Diselesaikan</div>
                        </div>
                        <div className="bg-white rounded-2xl border border-indigo-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-2xl mb-4">⭐</div>
                            <div className="text-3xl font-bold text-slate-800">{stats?.rata_rata_nilai ?? 0}</div>
                            <div className="text-sm text-slate-500 mt-1">Rata-rata Nilai</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Recent Scores */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="font-bold text-slate-800 text-lg">Nilai Terbaru</h3>
                                <Link href="/siswa/scores" className="text-sm text-violet-600 hover:text-violet-800 font-medium">
                                    Lihat Semua →
                                </Link>
                            </div>
                            {recent.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-4xl mb-3">📝</div>
                                    <p className="text-slate-400 text-sm">Belum ada kuis yang dikerjakan</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {recent.map(score => {
                                        const grade = getGrade(score.nilai)
                                        return (
                                            <div key={score.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-sm ${grade.bg} ${grade.color}`}>
                                                    {grade.label}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-slate-700 text-sm truncate">{score.judul_kuis}</div>
                                                    <div className="text-xs text-slate-400">
                                                        {new Date(score.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </div>
                                                </div>
                                                <div className={`font-bold text-lg ${grade.color}`}>{score.nilai}</div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Quick Access */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                            <h3 className="font-bold text-slate-800 text-lg mb-5">Akses Cepat</h3>
                            <div className="space-y-3">
                                <Link href="/siswa/subjects" className="flex items-center gap-4 p-4 bg-violet-50 hover:bg-violet-100 rounded-xl transition-colors group">
                                    <div className="w-10 h-10 bg-violet-100 group-hover:bg-violet-200 rounded-xl flex items-center justify-center text-xl transition-colors">📚</div>
                                    <div>
                                        <div className="font-semibold text-slate-700 text-sm">Jelajahi Mata Pelajaran</div>
                                        <div className="text-xs text-slate-400">Lihat semua pelajaran yang tersedia</div>
                                    </div>
                                    <span className="ml-auto text-slate-400 group-hover:text-violet-600 transition-colors">→</span>
                                </Link>
                                <Link href="/siswa/scores" className="flex items-center gap-4 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors group">
                                    <div className="w-10 h-10 bg-purple-100 group-hover:bg-purple-200 rounded-xl flex items-center justify-center text-xl transition-colors">📊</div>
                                    <div>
                                        <div className="font-semibold text-slate-700 text-sm">Lihat Rapor Nilai</div>
                                        <div className="text-xs text-slate-400">Pantau perkembangan belajarmu</div>
                                    </div>
                                    <span className="ml-auto text-slate-400 group-hover:text-purple-600 transition-colors">→</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
