"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import StudentNavbar from "@/component_siswa/Studentnavbar"
import Link from "next/link"
// unused

interface Material {
    id: number
    judul: string
    konten: string
    created_at: string
}

interface Quiz {
    id: number
    judul: string
    deskripsi: string
    jumlah_soal: number
    nilai_saya: number | null
    dikerjakan_pada: string | null
}

interface Topic {
    id: number
    nama: string
    deskripsi: string
    nama_pelajaran: string
    subject_id: number
}

import { useParams } from "next/navigation"

export default function LearnTopicPage() {
    const params = useParams()
    const topic_id = params.topic_id as string
    const [topic, setTopic] = useState<Topic | null>(null)
    const [materials, setMaterials] = useState<Material[]>([])
    const [quizzes, setQuizzes] = useState<Quiz[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'materi' | 'kuis'>('materi')

    useEffect(() => {
        axios.get(`/action/student/learn?topic_id=${topic_id}`)
            .then(res => {
                setTopic(res.data.topic)
                setMaterials(res.data.materials)
                setQuizzes(res.data.quizzes)
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [topic_id])

    const getScoreStyle = (nilai: number) => {
        if (nilai >= 90) return "bg-emerald-50 text-emerald-700 border-emerald-200"
        if (nilai >= 75) return "bg-blue-50 text-blue-700 border-blue-200"
        if (nilai >= 60) return "bg-amber-50 text-amber-700 border-amber-200"
        return "bg-red-50 text-red-600 border-red-200"
    }

    return (
        <div className="h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex flex-col md:flex-row overflow-hidden">
            <StudentNavbar />
            <div className="flex-1 flex flex-col w-full overflow-hidden">
                <header className="hidden md:flex shrink-0 h-16 bg-white/80 backdrop-blur border-b border-violet-100 items-center px-8 gap-3">
                    <Link href="/siswa/subjects" className="text-slate-400 hover:text-violet-600 text-sm transition-colors">
                        ← Mata Pelajaran
                    </Link>
                    {topic && (
                        <>
                            <span className="text-slate-300">/</span>
                            <Link href={`/siswa/subjects/${topic.subject_id}`} className="text-slate-400 hover:text-violet-600 text-sm transition-colors">
                                {topic.nama_pelajaran}
                            </Link>
                            <span className="text-slate-300">/</span>
                            <span className="text-slate-700 font-semibold text-sm">{topic.nama}</span>
                        </>
                    )}
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {loading ? (
                        <div className="space-y-4">
                            <div className="h-40 bg-slate-100 rounded-3xl animate-pulse"/>
                            {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse"/>)}
                        </div>
                    ) : (
                        <>
                            {/* Topic Header */}
                            <div className="bg-gradient-to-r from-indigo-600 to-violet-700 rounded-3xl p-8 mb-8 text-white relative overflow-hidden shadow-lg">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/4"/>
                                <div className="relative">
                                    <div className="text-xs font-semibold text-indigo-200 mb-2 uppercase tracking-wider">
                                        📚 {topic?.nama_pelajaran}
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-bold mb-2">{topic?.nama}</h2>
                                    <p className="text-indigo-200 text-sm">{topic?.deskripsi || "Pelajari materi dan kerjakan kuis di topik ini"}</p>
                                    <div className="flex items-center gap-3 mt-4">
                                        <span className="bg-white/20 backdrop-blur rounded-xl px-3 py-1.5 text-sm font-medium">
                                            📖 {materials.length} Materi
                                        </span>
                                        <span className="bg-white/20 backdrop-blur rounded-xl px-3 py-1.5 text-sm font-medium">
                                            🎯 {quizzes.length} Kuis
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1 border border-slate-100 shadow-sm w-fit">
                                <button
                                    onClick={() => setActiveTab('materi')}
                                    className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === 'materi'
                                        ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md'
                                        : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    📖 Materi ({materials.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('kuis')}
                                    className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === 'kuis'
                                        ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md'
                                        : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    🎯 Kuis ({quizzes.length})
                                </button>
                            </div>

                            {/* Materi Tab */}
                            {activeTab === 'materi' && (
                                <div className="space-y-3">
                                    {materials.length === 0 ? (
                                        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
                                            <div className="text-4xl mb-3">📭</div>
                                            <p className="text-slate-500">Belum ada materi di topik ini</p>
                                        </div>
                                    ) : materials.map((mat, idx) => (
                                        <Link
                                            key={mat.id}
                                            href={`/siswa/material/${mat.id}`}
                                            className="flex items-center gap-4 bg-white rounded-2xl border border-slate-100 p-5 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
                                        >
                                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl shrink-0 group-hover:bg-blue-100 transition-colors">
                                                📄
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">
                                                    {mat.judul}
                                                </div>
                                                <div className="text-xs text-slate-400 mt-1">
                                                    Materi {idx + 1} • {new Date(mat.created_at).toLocaleDateString('id-ID')}
                                                </div>
                                            </div>
                                            <span className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all">→</span>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* Kuis Tab */}
                            {activeTab === 'kuis' && (
                                <div className="space-y-3">
                                    {quizzes.length === 0 ? (
                                        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
                                            <div className="text-4xl mb-3">🎯</div>
                                            <p className="text-slate-500">Belum ada kuis di topik ini</p>
                                        </div>
                                    ) : quizzes.map(quiz => (
                                        <div key={quiz.id} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md transition-all duration-200">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-2xl shrink-0">
                                                    🎯
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold text-slate-800">{quiz.judul}</div>
                                                    <div className="text-xs text-slate-400 mt-0.5">{quiz.jumlah_soal} soal</div>
                                                </div>
                                                <div className="flex items-center gap-3 shrink-0">
                                                    {quiz.nilai_saya !== null ? (
                                                        <div className="text-right">
                                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-bold ${getScoreStyle(quiz.nilai_saya)}`}>
                                                                ✅ {quiz.nilai_saya}
                                                            </div>
                                                            <div className="text-xs text-slate-400 mt-1">Sudah dikerjakan</div>
                                                        </div>
                                                    ) : (
                                                        <Link
                                                            href={`/siswa/quiz/${quiz.id}`}
                                                            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:shadow-md hover:shadow-amber-200 transition-all"
                                                        >
                                                            Kerjakan 🚀
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
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
