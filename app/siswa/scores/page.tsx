"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import StudentNavbar from "@/component_siswa/Studentnavbar"

interface Score {
    id: number
    quiz_judul: string
    nama_pelajaran: string
    nilai: number
    created_at: string
}

export default function StudentScoresPage() {
    const [scores, setScores] = useState<Score[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axios.get('/action/student/scores')
            .then(res => setScores(res.data.data))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const avg = scores.length > 0
        ? Math.round(scores.reduce((sum, s) => sum + s.nilai, 0) / scores.length)
        : 0

    const best = scores.length > 0 ? Math.max(...scores.map(s => s.nilai)) : 0

    const getGrade = (nilai: number) => {
        if (nilai >= 90) return { label: "A", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", bar: "bg-emerald-500" }
        if (nilai >= 75) return { label: "B", color: "text-blue-700", bg: "bg-blue-50 border-blue-200", bar: "bg-blue-500" }
        if (nilai >= 60) return { label: "C", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", bar: "bg-amber-500" }
        return { label: "D", color: "text-red-600", bg: "bg-red-50 border-red-200", bar: "bg-red-500" }
    }

    return (
        <div className="h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex flex-col md:flex-row overflow-hidden">
            <StudentNavbar />
            <div className="flex-1 flex flex-col w-full overflow-hidden">
                <header className="hidden md:flex shrink-0 h-16 bg-white/80 backdrop-blur border-b border-violet-100 items-center justify-between px-8">
                    <h1 className="text-lg font-bold text-slate-700">Nilai Saya</h1>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-1">Rapor Nilai 📊</h2>
                        <p className="text-slate-500">Pantau perkembangan belajarmu dari waktu ke waktu</p>
                    </div>

                    {/* Summary Cards */}
                    {!loading && scores.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                            <div className="bg-white rounded-2xl border border-violet-100 p-6 shadow-sm">
                                <div className="w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center text-2xl mb-4">✅</div>
                                <div className="text-3xl font-bold text-slate-800">{scores.length}</div>
                                <div className="text-sm text-slate-500 mt-1">Kuis Selesai</div>
                            </div>
                            <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm">
                                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl mb-4">📈</div>
                                <div className="text-3xl font-bold text-slate-800">{avg}</div>
                                <div className="text-sm text-slate-500 mt-1">Rata-rata Nilai</div>
                            </div>
                            <div className="bg-white rounded-2xl border border-emerald-100 p-6 shadow-sm">
                                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-2xl mb-4">🏆</div>
                                <div className="text-3xl font-bold text-slate-800">{best}</div>
                                <div className="text-sm text-slate-500 mt-1">Nilai Tertinggi</div>
                            </div>
                        </div>
                    )}

                    {/* Score List */}
                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse"/>
                            ))}
                        </div>
                    ) : scores.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                            <div className="text-5xl mb-4">📝</div>
                            <h3 className="text-xl font-bold text-slate-700 mb-2">Belum Ada Nilai</h3>
                            <p className="text-slate-400 text-sm mb-6">Selesaikan kuis pertamamu untuk melihat nilaimu di sini</p>
                            <a href="/siswa/subjects" className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-md transition-all">
                                Mulai Belajar 🚀
                            </a>
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-50">
                                <h3 className="font-bold text-slate-800">Riwayat Kuis</h3>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {scores.map((score, idx) => {
                                    const grade = getGrade(score.nilai)
                                    return (
                                        <div key={score.id} className="p-5 hover:bg-slate-50/50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                {/* Rank */}
                                                <div className="text-slate-300 font-bold text-sm w-6 shrink-0 text-center">{idx + 1}</div>

                                                {/* Grade Badge */}
                                                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center font-black text-lg shrink-0 ${grade.bg} ${grade.color}`}>
                                                    {grade.label}
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold text-slate-800 truncate">{score.quiz_judul}</div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs bg-violet-50 text-violet-600 px-2 py-0.5 rounded-md font-medium">{score.nama_pelajaran}</span>
                                                        <span className="text-xs text-slate-400">
                                                            {new Date(score.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                    {/* Progress bar */}
                                                    <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden w-full max-w-xs">
                                                        <div
                                                            className={`h-full rounded-full transition-all ${grade.bar}`}
                                                            style={{ width: `${score.nilai}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Score */}
                                                <div className={`text-2xl font-black shrink-0 ${grade.color}`}>
                                                    {score.nilai}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
