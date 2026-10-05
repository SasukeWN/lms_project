"use client"

import { useEffect, useState, Suspense } from "react"
import axios from "axios"
import AdminNavbar from "@/app/component_admin/navbar/Navbar"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

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
    const [loading, setLoading] = useState(true)
    
    // Form state
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editId, setEditId] = useState<number | null>(null)
    const [topicId, setTopicId] = useState(initialTopicId)
    const [judul, setJudul] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [filterTopicId, setFilterTopicId] = useState(initialTopicId)

    const fetchTopics = async () => {
        try {
            const res = await axios.get('/action/admin/topics')
            setTopics(res.data.data)
        } catch (error) {
            console.error("Gagal mengambil data topik", error)
        }
    }

    const fetchQuizzes = async (topId: string) => {
        try {
            setLoading(true)
            const url = topId ? `/action/admin/quizzes?topic_id=${topId}` : '/action/admin/quizzes'
            const res = await axios.get(url)
            setQuizzes(res.data.data)
        } catch (error) {
            console.error("Gagal mengambil data kuis", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTopics()
        fetchQuizzes(filterTopicId)
    }, [filterTopicId])

    const handleOpenAdd = () => {
        setEditId(null)
        setTopicId(filterTopicId)
        setJudul("")
        setIsFormOpen(true)
    }

    const handleOpenEdit = (quiz: Quiz) => {
        setEditId(quiz.id)
        setTopicId(quiz.topic_id.toString())
        setJudul(quiz.judul)
        setIsFormOpen(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleDelete = async (id: number) => {
        if (!window.confirm("Yakin ingin menghapus kuis ini? Semua soal akan terhapus juga.")) return
        try {
            await axios.delete(`/action/admin/quizzes?id=${id}`)
            fetchQuizzes(filterTopicId)
        } catch (error: any) {
            alert(error.response?.data?.message || "Gagal menghapus")
        }
    }

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            if (editId) {
                await axios.put('/action/admin/quizzes', { id: editId, topic_id: Number(topicId), judul })
                alert("Kuis berhasil diupdate!")
            } else {
                await axios.post('/action/admin/quizzes', { topic_id: Number(topicId), judul })
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
                    <h2 className="text-2xl font-bold text-slate-800">Manajemen Kuis</h2>
                    <p className="text-sm text-slate-500">Kelola kuis dan soal dari setiap topik</p>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Topik / Bab</label>
                                <select
                                    required
                                    value={topicId}
                                    onChange={(e) => setTopicId(e.target.value)}
                                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none"
                                >
                                    <option value="" disabled>Pilih Topik</option>
                                    {topics.map((top) => (
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

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex items-center gap-4">
                <span className="text-sm font-medium text-slate-600 whitespace-nowrap">Filter Topik:</span>
                <select
                    value={filterTopicId}
                    onChange={(e) => setFilterTopicId(e.target.value)}
                    className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-slate-900"
                >
                    <option value="">Semua Topik</option>
                    {topics.map((top) => (
                        <option key={top.id} value={top.id}>{top.nama_topik}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="text-center text-slate-500 py-10 animate-pulse">Memuat data...</div>
            ) : quizzes.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed">
                    <span className="text-4xl mb-4 block">🎯</span>
                    <h3 className="text-lg font-bold text-slate-700">Belum ada Kuis</h3>
                    <p className="text-slate-500 text-sm mt-1">Silakan tambah kuis baru untuk diujikan.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {quizzes.map((quiz) => {
                        const parentTopic = topics.find(t => t.id === quiz.topic_id)
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
                                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                                        {parentTopic ? parentTopic.nama_topik : `Topik ID: ${quiz.topic_id}`}
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 pr-16">{quiz.judul}</h3>
                                </div>
                                <div className="mt-6 pt-4 border-t border-slate-100 flex gap-2">
                                    <Link 
                                        href={`/admin/quiz/${quiz.id}`}
                                        className="flex-1 text-center py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg transition-colors border border-slate-200"
                                    >
                                        Kelola Soal
                                    </Link>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </main>
    )
}

export default function QuizPage() {
    return (
        <div className="h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden">
            <AdminNavbar />
            <div className="flex-1 flex flex-col w-full">
                <header className="hidden md:flex h-16 bg-white border-b border-slate-200 items-center justify-between px-8">
                    <h1 className="text-xl font-bold text-slate-800">Manajemen Kuis</h1>
                    <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold border-2 border-white shadow-sm">
                            A
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
