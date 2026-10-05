"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import StudentNavbar from "@/component_siswa/Studentnavbar"
import Link from "next/link"

interface Subject {
    id: number
    nama: string
    deskripsi: string
    jumlah_topik: number
}

const SUBJECT_COLORS = [
    "from-violet-500 to-purple-600",
    "from-blue-500 to-indigo-600",
    "from-emerald-500 to-teal-600",
    "from-orange-500 to-amber-600",
    "from-pink-500 to-rose-600",
    "from-cyan-500 to-sky-600",
]

const SUBJECT_EMOJIS = ["📐", "🔬", "📖", "🌍", "🎨", "💻", "🧮", "⚗️", "🗺️", "🎵"]

export default function StudentSubjectsPage() {
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")

    useEffect(() => {
        axios.get('/action/student/materials')
            .then(res => setSubjects(res.data.data))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const filtered = subjects.filter(s =>
        s.nama.toLowerCase().includes(search.toLowerCase()) ||
        (s.deskripsi ?? "").toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex flex-col md:flex-row overflow-hidden">
            <StudentNavbar />
            <div className="flex-1 flex flex-col w-full overflow-hidden">
                <header className="hidden md:flex shrink-0 h-16 bg-white/80 backdrop-blur border-b border-violet-100 items-center justify-between px-8">
                    <h1 className="text-lg font-bold text-slate-700">Mata Pelajaran</h1>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-1">Pilih Mata Pelajaran 📚</h2>
                        <p className="text-slate-500">Pilih pelajaran yang ingin kamu pelajari hari ini</p>
                    </div>

                    {/* Search */}
                    <div className="relative mb-8 max-w-md">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                        <input
                            type="text"
                            placeholder="Cari mata pelajaran..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm shadow-sm"
                        />
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="h-52 bg-slate-100 rounded-3xl animate-pulse"/>
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="text-5xl mb-4">🔍</div>
                            <h3 className="text-xl font-bold text-slate-700">Tidak ditemukan</h3>
                            <p className="text-slate-400 mt-1">Coba kata kunci lain</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filtered.map((subject, idx) => (
                                <Link
                                    key={subject.id}
                                    href={`/siswa/subjects/${subject.id}`}
                                    className="group relative bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                >
                                    {/* Gradient Header */}
                                    <div className={`h-32 bg-gradient-to-br ${SUBJECT_COLORS[idx % SUBJECT_COLORS.length]} flex items-center justify-center relative`}>
                                        <div className="absolute inset-0 opacity-20">
                                            <div className="absolute top-3 right-3 w-20 h-20 border-2 border-white rounded-full"/>
                                            <div className="absolute bottom-2 left-3 w-12 h-12 border-2 border-white rounded-full"/>
                                        </div>
                                        <span className="text-5xl drop-shadow-md">
                                            {SUBJECT_EMOJIS[idx % SUBJECT_EMOJIS.length]}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5">
                                        <h3 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-violet-700 transition-colors">
                                            {subject.nama}
                                        </h3>
                                        <p className="text-slate-400 text-sm line-clamp-2 mb-4">
                                            {subject.deskripsi || "Pelajari topik-topik menarik di sini"}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs bg-violet-50 text-violet-700 font-medium px-3 py-1 rounded-full border border-violet-100">
                                                {subject.jumlah_topik ?? 0} Topik
                                            </span>
                                            <span className="text-violet-500 text-sm font-semibold group-hover:translate-x-1 transition-transform inline-block">
                                                Mulai →
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
