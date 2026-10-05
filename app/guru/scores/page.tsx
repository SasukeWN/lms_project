"use client"

import { useEffect, useState, Suspense } from "react"
import axios from "axios"
import GuruNavbar from "@/app/component_guru/navbar/Navbar"

interface Score {
    id: number
    user_id: number
    quiz_id: number
    nilai: number
    created_at: string
    user_name: string
    user_email: string
    quiz_judul: string
}

interface Quiz {
    id: number
    judul: string
}

function ScoresContent() {
    const [scores, setScores] = useState<Score[]>([])
    const [quizzes, setQuizzes] = useState<Quiz[]>([])
    const [loading, setLoading] = useState(true)

    // Filter
    const [filterQuizId, setFilterQuizId] = useState("")

    // Form Edit State
    const [editId, setEditId] = useState<number | null>(null)
    const [editNilai, setEditNilai] = useState<number>(0)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const fetchQuizzes = async () => {
        try {
            const res = await axios.get('/action/guru/quizzes')
            setQuizzes(res.data.data)
        } catch (error) {
            console.error("Gagal mengambil kuis", error)
        }
    }

    const fetchScores = async (qId: string) => {
        try {
            setLoading(true)
            const url = qId ? `/action/guru/scores?quiz_id=${qId}` : '/action/guru/scores'
            const res = await axios.get(url)
            setScores(res.data.data)
        } catch (error) {
            console.error("Gagal mengambil data nilai", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchQuizzes()
    }, [])

    useEffect(() => {
        fetchScores(filterQuizId)
    }, [filterQuizId])

    const handleDelete = async (id: number) => {
        if (!window.confirm("Yakin ingin menghapus nilai ini? Menghapus nilai memungkinkan siswa untuk mengulang kuis.")) return
        try {
            await axios.delete(`/action/guru/scores?id=${id}`)
            fetchScores(filterQuizId)
        } catch (error: any) {
            alert(error.response?.data?.message || "Gagal menghapus")
        }
    }

    const handleSaveEdit = async () => {
        if (!editId) return
        setIsSubmitting(true)
        try {
            await axios.put('/action/guru/scores', { id: editId, nilai: editNilai })
            alert("Nilai berhasil diubah!")
            setEditId(null)
            fetchScores(filterQuizId)
        } catch (error: any) {
            alert(error.response?.data?.message || "Terjadi kesalahan saat mengubah nilai")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className="p-4 md:p-8 flex-1 overflow-y-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Rekap Nilai Siswa</h2>
                    <p className="text-sm text-slate-500">Pantau hasil pengerjaan kuis siswa</p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex items-center gap-4">
                <span className="text-sm font-medium text-slate-600 whitespace-nowrap">Filter Kuis:</span>
                <select
                    value={filterQuizId}
                    onChange={(e) => setFilterQuizId(e.target.value)}
                    className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-slate-900 w-full max-w-xs"
                >
                    <option value="">Semua Kuis</option>
                    {quizzes.map((q) => (
                        <option key={q.id} value={q.id}>{q.judul}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="text-center text-slate-500 py-10 animate-pulse">Memuat data...</div>
            ) : scores.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed">
                    <span className="text-4xl mb-4 block">📈</span>
                    <h3 className="text-lg font-bold text-slate-700">Belum ada Nilai</h3>
                    <p className="text-slate-500 text-sm mt-1">Belum ada siswa yang menyelesaikan kuis ini.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Nama Siswa</th>
                                    <th className="px-6 py-4 font-semibold">Kuis</th>
                                    <th className="px-6 py-4 font-semibold text-center">Nilai Akhir</th>
                                    <th className="px-6 py-4 font-semibold">Tanggal Pengerjaan</th>
                                    <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {scores.map((score) => (
                                    <tr key={score.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-bold text-slate-900">{score.user_name}</div>
                                                <div className="text-slate-500 text-xs">{score.user_email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-block px-2.5 py-1 bg-amber-50 text-amber-700 font-medium rounded-md">
                                                {score.quiz_judul}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {editId === score.id ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <input 
                                                        type="number" 
                                                        className="w-16 px-2 py-1 border rounded text-center" 
                                                        value={editNilai}
                                                        onChange={(e) => setEditNilai(Number(e.target.value))}
                                                        min={0} max={100}
                                                    />
                                                    <button onClick={handleSaveEdit} disabled={isSubmitting} className="text-xs bg-indigo-600 text-white px-2 py-1 rounded">Save</button>
                                                    <button onClick={() => setEditId(null)} className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded">X</button>
                                                </div>
                                            ) : (
                                                <span className={`font-bold text-lg ${score.nilai >= 75 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                    {score.nilai}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {new Date(score.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => { setEditId(score.id); setEditNilai(score.nilai); }}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Edit Manual"
                                                >
                                                    ✏️
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(score.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Hapus Nilai (Retake)"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </main>
    )
}

export default function GuruScoresPage() {
    return (
        <div className="h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden">
            <GuruNavbar />
            <div className="flex-1 flex flex-col w-full h-screen overflow-hidden">
                <header className="hidden md:flex shrink-0 h-16 bg-white border-b border-slate-200 items-center justify-between px-8">
                    <h1 className="text-xl font-bold text-slate-800">Rekap Nilai</h1>
                    <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm">
                            G
                        </div>
                    </div>
                </header>
                <Suspense fallback={<div className="p-8 text-center text-slate-500">Memuat...</div>}>
                    <ScoresContent />
                </Suspense>
            </div>
        </div>
    )
}
