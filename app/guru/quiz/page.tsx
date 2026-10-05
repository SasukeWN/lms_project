"use client"

import { useEffect, useState, Suspense } from "react"
import axios from "axios"
import GuruNavbar from "@/app/component_guru/navbar/Navbar"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

interface Subject {
    id: number
    nama: string
}

interface Topic {
    id: number
    subject_id: number
    nama_topik: string
}

interface Quiz {
    id: number
    topic_id: number
    judul: string
    created_at: string
}

function QuizContent() {
    const searchParams = useSearchParams()
    const initialTopicId = searchParams.get('topic_id') || ""

    const [quizzes, setQuizzes] = useState<Quiz[]>([])
    const [topics, setTopics] = useState<Topic[]>([])
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [loading, setLoading] = useState(true)
    
    // Form state
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editId, setEditId] = useState<number | null>(null)
    const [subjectId, setSubjectId] = useState("")
    const [topicId, setTopicId] = useState(initialTopicId)
    const [judul, setJudul] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Filter state
    const [filterSubjectId, setFilterSubjectId] = useState("")
    const [filterTopicId, setFilterTopicId] = useState(initialTopicId)

    const fetchData = async () => {
        try {
            const [resTopics, resSubjects] = await Promise.all([
                axios.get('/action/guru/topics'),
                axios.get('/action/guru/subjects')
            ])
            setTopics(resTopics.data.data)
            setSubjects(resSubjects.data.data)
        } catch (error) {
            console.error("Gagal mengambil data referensi", error)
        }
    }

    const fetchQuizzes = async (topId: string) => {
        try {
            setLoading(true)
            const url = topId ? `/action/guru/quizzes?topic_id=${topId}` : '/action/guru/quizzes'
            const res = await axios.get(url)
            setQuizzes(res.data.data)
        } catch (error) {
            console.error("Gagal mengambil data kuis", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        fetchQuizzes(filterTopicId)
    }, [filterTopicId])

    // Derive filtered topics for dropdowns
    const formTopics = topics.filter(t => t.subject_id.toString() === subjectId)
    const filterTopics = topics.filter(t => filterSubjectId ? t.subject_id.toString() === filterSubjectId : true)

    const handleOpenAdd = () => {
        setEditId(null)
        setSubjectId(filterSubjectId)
        setTopicId(filterTopicId)
        setJudul("")
        setIsFormOpen(true)
    }

    const handleOpenEdit = (quiz: Quiz) => {
        const quizTopic = topics.find(t => t.id === quiz.topic_id)
        if (quizTopic) {
            setSubjectId(quizTopic.subject_id.toString())
        }
        setEditId(quiz.id)
        setTopicId(quiz.topic_id.toString())
        setJudul(quiz.judul)
        setIsFormOpen(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleDelete = async (id: number) => {
        if (!window.confirm("Yakin ingin menghapus kuis ini? Semua soal akan terhapus juga.")) return
        try {
            await axios.delete(`/action/guru/quizzes?id=${id}`)
            fetchQuizzes(filterTopicId)
        } catch (error: any) {
            alert(error.response?.data?.message || "Gagal menghapus")
        }
    }

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!topicId) {
            alert("Harap pilih topik terlebih dahulu!")
            return
        }
        setIsSubmitting(true)
        try {
            if (editId) {
                await axios.put('/action/guru/quizzes', { id: editId, topic_id: Number(topicId), judul })
                alert("Kuis berhasil diupdate!")
            } else {
                await axios.post('/action/guru/quizzes', { topic_id: Number(topicId), judul })
                alert("Kuis berhasil ditambahkan!")
            }
            setIsFormOpen(false)
            fetchQuizzes(filterTopicId)
        } catch (error: any) {
            alert(error.response?.data?.message || "Terjadi kesalahan")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className="p-4 md:p-8 flex-1 overflow-y-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Manajemen Kuis (Guru)</h2>
                    <p className="text-sm text-slate-500">Kelola kuis dan bank soal</p>
                </div>
                <button 
                    onClick={isFormOpen ? () => setIsFormOpen(false) : handleOpenAdd}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors shadow-sm w-full md:w-auto ${
                        isFormOpen ? "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50" : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                >
                    {isFormOpen ? "Batal" : "+ Tambah Kuis"}
                </button>
            </div>

            {isFormOpen && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6 animate-in slide-in-from-top-4 fade-in duration-200">
                    <h3 className="font-bold text-slate-800 mb-4">{editId ? "Edit Kuis" : "Buat Kuis Baru"}</h3>
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Mata Pelajaran</label>
                                <select
                                    required
                                    value={subjectId}
                                    onChange={(e) => {
                                        setSubjectId(e.target.value)
                                        setTopicId("")
                                    }}
                                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none"
                                >
                                    <option value="" disabled>Pilih Mapel</option>
                                    {subjects.map((sub) => (
                                        <option key={sub.id} value={sub.id}>{sub.nama}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Topik / Bab</label>
                                <select
                                    required
                                    value={topicId}
                                    onChange={(e) => setTopicId(e.target.value)}
                                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none"
                                    disabled={!subjectId}
                                >
                                    <option value="" disabled>Pilih Topik</option>
                                    {formTopics.map((top) => (
                                        <option key={top.id} value={top.id}>{top.nama_topik}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Judul Kuis</label>
                                <input
                                    type="text"
                                    required
                                    value={judul}
                                    onChange={(e) => setJudul(e.target.value)}
                                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none"
                                    placeholder="Contoh: Latihan 1 Aljabar"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                                {isSubmitting ? "Menyimpan..." : (editId ? "Update Kuis" : "Simpan Kuis")}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <span className="text-sm font-medium text-slate-600 whitespace-nowrap">Filter Mapel:</span>
                    <select
                        value={filterSubjectId}
                        onChange={(e) => {
                            setFilterSubjectId(e.target.value)
                            setFilterTopicId("")
                        }}
                        className="w-full md:w-auto px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-slate-900"
                    >
                        <option value="">Semua Mapel</option>
                        {subjects.map((sub) => (
                            <option key={sub.id} value={sub.id}>{sub.nama}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <span className="text-sm font-medium text-slate-600 whitespace-nowrap">Filter Topik:</span>
                    <select
                        value={filterTopicId}
                        onChange={(e) => setFilterTopicId(e.target.value)}
                        className="w-full md:w-auto px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-slate-900"
                        disabled={filterTopics.length === 0}
                    >
                        <option value="">Semua Topik</option>
                        {filterTopics.map((top) => (
                            <option key={top.id} value={top.id}>{top.nama_topik}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center text-slate-500 py-10 animate-pulse">Memuat data...</div>
            ) : (() => {
                const displayedQuizzes = quizzes.filter(quiz => {
                    if (!filterSubjectId) return true;
                    const parentTopic = topics.find(t => t.id === quiz.topic_id);
                    return parentTopic && parentTopic.subject_id.toString() === filterSubjectId;
                });

                if (displayedQuizzes.length === 0) {
                    return (
                        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed">
                            <span className="text-4xl mb-4 block">🎯</span>
                            <h3 className="text-lg font-bold text-slate-700">Belum ada Kuis</h3>
                            <p className="text-slate-500 text-sm mt-1">Silakan tambah kuis baru untuk diujikan.</p>
                        </div>
                    );
                }

                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {displayedQuizzes.map((quiz) => {
                            const parentTopic = topics.find(t => t.id === quiz.topic_id)
                            const parentSubject = parentTopic ? subjects.find(s => s.id === parentTopic.subject_id) : null

                            return (
                            <div key={quiz.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative group flex flex-col h-full">
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleOpenEdit(quiz)} className="p-1.5 bg-slate-100 text-slate-600 rounded-md hover:bg-indigo-100 hover:text-indigo-600 transition-colors">
                                        ✏️
                                    </button>
                                    <button onClick={() => handleDelete(quiz.id)} className="p-1.5 bg-slate-100 text-slate-600 rounded-md hover:bg-red-100 hover:text-red-600 transition-colors">
                                        🗑️
                                    </button>
                                </div>
                                <div className="flex-1 mt-2">
                                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center text-xl mb-4">
                                        🎯
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {parentSubject && (
                                            <div className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase rounded">
                                                {parentSubject.nama}
                                            </div>
                                        )}
                                        <div className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded">
                                            {parentTopic ? parentTopic.nama_topik : `Topik ID: ${quiz.topic_id}`}
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 pr-16">{quiz.judul}</h3>
                                </div>
                                <div className="mt-6 pt-4 border-t border-slate-100 flex gap-2">
                                    <Link 
                                        href={`/guru/question?quiz_id=${quiz.id}`}
                                        className="flex-1 text-center py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg transition-colors border border-slate-200"
                                    >
                                        Kelola Soal
                                    </Link>
                                </div>
                            </div>
                        )
                    })}
                </div>
                )
            })()}
        </main>
    )
}

export default function GuruQuizPage() {
    return (
        <div className="h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden">
            <GuruNavbar />
            <div className="flex-1 flex flex-col w-full">
                <header className="hidden md:flex h-16 bg-white border-b border-slate-200 items-center justify-between px-8">
                    <h1 className="text-xl font-bold text-slate-800">Manajemen Kuis</h1>
                    <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm">
                            G
                        </div>
                    </div>
                </header>
                <Suspense fallback={<div className="p-8 text-center text-slate-500">Memuat...</div>}>
                    <QuizContent />
                </Suspense>
            </div>
        </div>
    )
}

