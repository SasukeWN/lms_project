"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import StudentNavbar from "@/component_siswa/Studentnavbar"
import Link from "next/link"
// unused

interface Topic {
    id: number
    nama: string
    deskripsi: string
    jumlah_materi: number
    jumlah_kuis: number
}

interface Subject {
    id: number
    nama: string
    deskripsi: string
}

import { useParams } from "next/navigation"

export default function SubjectDetailPage() {
    const params = useParams()
    const id = params.id as string
    const [subject, setSubject] = useState<Subject | null>(null)
    const [topics, setTopics] = useState<Topic[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axios.get(`/action/student/learn?subject_id=${id}`)
            .then(res => {
                setSubject(res.data.subject)
                setTopics(res.data.topics)
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [id])

    return (
        <div className="h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex flex-col md:flex-row overflow-hidden">
            <StudentNavbar />
            <div className="flex-1 flex flex-col w-full overflow-hidden">
                <header className="hidden md:flex shrink-0 h-16 bg-white/80 backdrop-blur border-b border-violet-100 items-center px-8 gap-3">
                    <Link href="/siswa/subjects" className="text-slate-400 hover:text-violet-600 transition-colors text-sm">
                        ← Mata Pelajaran
                    </Link>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-700 font-semibold text-sm">{subject?.nama}</span>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {loading ? (
                        <div className="space-y-4">
                            <div className="h-32 bg-slate-100 rounded-3xl animate-pulse"/>
                            {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse"/>)}
                        </div>
                    ) : (
                        <>
                            {/* Subject Header */}
                            <div className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-3xl p-8 mb-8 text-white relative overflow-hidden shadow-lg shadow-violet-200">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4"/>
                                <div className="relative">
                                    <div className="text-4xl mb-3">📚</div>
                                    <h2 className="text-2xl md:text-3xl font-bold mb-2">{subject?.nama}</h2>
                                    <p className="text-violet-200 text-sm">{subject?.deskripsi || "Pelajari semua topik di mata pelajaran ini"}</p>
                                    <div className="mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur rounded-xl px-4 py-2 text-sm font-medium">
                                        📑 {topics.length} Topik Tersedia
                                    </div>
                                </div>
                            </div>

                            {/* Topics */}
                            <h3 className="text-xl font-bold text-slate-800 mb-4">Pilih Topik / Bab</h3>

                            {topics.length === 0 ? (
                                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
                                    <div className="text-4xl mb-3">📭</div>
                                    <p className="text-slate-500">Belum ada topik untuk pelajaran ini</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {topics.map((topic, idx) => (
                                        <Link
                                            key={topic.id}
                                            href={`/siswa/learn/${topic.id}`}
                                            className="flex items-center gap-5 bg-white rounded-2xl border border-slate-100 p-5 hover:border-violet-300 hover:shadow-md transition-all duration-200 group"
                                        >
                                            <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-purple-100 rounded-xl flex items-center justify-center font-bold text-violet-700 text-lg shrink-0">
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-slate-800 group-hover:text-violet-700 transition-colors">
                                                    {topic.nama}
                                                </div>
                                                <div className="text-xs text-slate-400 mt-1">
                                                    {topic.deskripsi || "Klik untuk melihat materi dan kuis"}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-slate-400 shrink-0">
                                                <span className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg font-medium">
                                                    📖 {topic.jumlah_materi ?? 0} Materi
                                                </span>
                                                <span className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2.5 py-1 rounded-lg font-medium">
                                                    🎯 {topic.jumlah_kuis ?? 0} Kuis
                                                </span>
                                                <span className="text-violet-400 group-hover:translate-x-1 transition-transform">→</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    )
}
