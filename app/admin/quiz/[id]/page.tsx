"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import AdminNavbar from "@/app/component_admin/navbar/Navbar"
import Link from "next/link"

interface Question {
    id: number
    quiz_id: number
    soal: string
    opsi_a: string
    opsi_b: string
    opsi_c: string
    opsi_d: string
    kunci_jawaban: string
    pembahasan: string | null
}

import { useParams } from "next/navigation"

export default function QuestionsPage() {
    const params = useParams()
    const quizId = params.id as string

    const [questions, setQuestions] = useState<Question[]>([])
    const [loading, setLoading] = useState(true)
    
    // Form state
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editId, setEditId] = useState<number | null>(null)
    const [soal, setSoal] = useState("")
    const [opsiA, setOpsiA] = useState("")
    const [opsiB, setOpsiB] = useState("")
    const [opsiC, setOpsiC] = useState("")
    const [opsiD, setOpsiD] = useState("")
    const [kunciJawaban, setKunciJawaban] = useState("A")
    const [pembahasan, setPembahasan] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const fetchQuestions = async () => {
        try {
            setLoading(true)
            const res = await axios.get(`/action/admin/questions?quiz_id=${quizId}`)
            setQuestions(res.data.data)
        } catch (error) {
            console.error("Gagal mengambil data soal", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchQuestions()
    }, [quizId])

    const handleOpenAdd = () => {
        setEditId(null)
        setSoal("")
        setOpsiA("")
        setOpsiB("")
        setOpsiC("")
        setOpsiD("")
        setKunciJawaban("A")
        setPembahasan("")
        setIsFormOpen(true)
    }

    const handleOpenEdit = (q: Question) => {
        setEditId(q.id)
        setSoal(q.soal)
        setOpsiA(q.opsi_a)
        setOpsiB(q.opsi_b)
        setOpsiC(q.opsi_c)
        setOpsiD(q.opsi_d)
        setKunciJawaban(q.kunci_jawaban)
        setPembahasan(q.pembahasan || "")
        setIsFormOpen(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleDelete = async (id: number) => {
        if (!window.confirm("Yakin ingin menghapus soal ini?")) return
        try {
            await axios.delete(`/action/admin/questions?id=${id}`)
            fetchQuestions()
        } catch (error: any) {
            alert(error.response?.data?.message || "Gagal menghapus")
        }
    }

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const payload = {
                quiz_id: Number(quizId),
                soal,
                opsi_a: opsiA,
                opsi_b: opsiB,
                opsi_c: opsiC,
                opsi_d: opsiD,
                kunci_jawaban: kunciJawaban,
                pembahasan
            }

            if (editId) {
                await axios.put('/action/admin/questions', { id: editId, ...payload })
                alert("Soal berhasil diupdate!")
            } else {
                await axios.post('/action/admin/questions', payload)
                alert("Soal berhasil ditambahkan!")
            }
            setIsFormOpen(false)
            fetchQuestions()
        } catch (error: any) {
            alert(error.response?.data?.message || "Terjadi kesalahan")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden">
            <AdminNavbar />

            <div className="flex-1 flex flex-col w-full h-screen overflow-hidden">
                <header className="hidden md:flex shrink-0 h-16 bg-white border-b border-slate-200 items-center justify-between px-8">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/quiz" className="text-slate-400 hover:text-slate-600 transition-colors">
                            ← Kembali
                        </Link>
                        <h1 className="text-xl font-bold text-slate-800">Manajemen Soal</h1>
                    </div>
                </header>

                <main className="p-4 md:p-8 flex-1 overflow-y-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">Daftar Soal</h2>
                            <p className="text-sm text-slate-500">Kuis ID: {quizId}</p>
                        </div>
                        <button 
                            onClick={isFormOpen ? () => setIsFormOpen(false) : handleOpenAdd}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors shadow-sm w-full md:w-auto ${
                                isFormOpen ? "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50" : "bg-slate-900 text-white hover:bg-slate-800"
                            }`}
                        >
                            {isFormOpen ? "Batal" : "+ Tambah Soal"}
                        </button>
                    </div>

                    {isFormOpen && (
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6 animate-in slide-in-from-top-4 fade-in duration-200">
                            <h3 className="font-bold text-slate-800 mb-4">{editId ? "Edit Soal" : "Buat Soal Baru"}</h3>
                            <form onSubmit={handleFormSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Pertanyaan</label>
                                    <textarea
                                        required
                                        rows={3}
                                        value={soal}
                                        onChange={(e) => setSoal(e.target.value)}
                                        className="w-full px-4 py-3 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none resize-none"
                                        placeholder="Tuliskan pertanyaan di sini..."
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Opsi A</label>
                                        <input type="text" required value={opsiA} onChange={(e) => setOpsiA(e.target.value)} className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Opsi B</label>
                                        <input type="text" required value={opsiB} onChange={(e) => setOpsiB(e.target.value)} className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Opsi C</label>
                                        <input type="text" required value={opsiC} onChange={(e) => setOpsiC(e.target.value)} className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Opsi D</label>
                                        <input type="text" required value={opsiD} onChange={(e) => setOpsiD(e.target.value)} className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Kunci Jawaban</label>
                                        <select
                                            required
                                            value={kunciJawaban}
                                            onChange={(e) => setKunciJawaban(e.target.value)}
                                            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none font-bold"
                                        >
                                            <option value="A">A</option>
                                            <option value="B">B</option>
                                            <option value="C">C</option>
                                            <option value="D">D</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Pembahasan (Opsional)</label>
                                        <input type="text" value={pembahasan} onChange={(e) => setPembahasan(e.target.value)} className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none" placeholder="Penjelasan singkat jawaban benar" />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-2">
                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting}
                                        className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                    >
                                        {isSubmitting ? "Menyimpan..." : (editId ? "Update Soal" : "Simpan Soal")}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center text-slate-500 py-10 animate-pulse">Memuat data...</div>
                    ) : questions.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed">
                            <span className="text-4xl mb-4 block">📝</span>
                            <h3 className="text-lg font-bold text-slate-700">Belum ada Soal</h3>
                            <p className="text-slate-500 text-sm mt-1">Silakan klik tombol Tambah Soal.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {questions.map((q, index) => (
                                <div key={q.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative group">
                                    <div className="absolute top-5 right-5 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleOpenEdit(q)} className="p-1.5 bg-slate-100 text-slate-600 rounded-md hover:bg-indigo-100 hover:text-indigo-600 transition-colors">
                                            ✏️
                                        </button>
                                        <button onClick={() => handleDelete(q.id)} className="p-1.5 bg-slate-100 text-slate-600 rounded-md hover:bg-red-100 hover:text-red-600 transition-colors">
                                            🗑️
                                        </button>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 shrink-0 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center font-bold text-sm">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 pr-16">
                                            <p className="font-medium text-slate-900 mb-4 whitespace-pre-wrap">{q.soal}</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                                <div className={`p-3 rounded-xl border text-sm ${q.kunci_jawaban === 'A' ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-medium' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                                                    <span className="font-bold mr-2 opacity-50">A.</span> {q.opsi_a}
                                                </div>
                                                <div className={`p-3 rounded-xl border text-sm ${q.kunci_jawaban === 'B' ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-medium' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                                                    <span className="font-bold mr-2 opacity-50">B.</span> {q.opsi_b}
                                                </div>
                                                <div className={`p-3 rounded-xl border text-sm ${q.kunci_jawaban === 'C' ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-medium' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                                                    <span className="font-bold mr-2 opacity-50">C.</span> {q.opsi_c}
                                                </div>
                                                <div className={`p-3 rounded-xl border text-sm ${q.kunci_jawaban === 'D' ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-medium' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                                                    <span className="font-bold mr-2 opacity-50">D.</span> {q.opsi_d}
                                                </div>
                                            </div>
                                            {q.pembahasan && (
                                                <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl">
                                                    <div className="text-xs font-bold text-amber-800 uppercase mb-1">💡 Pembahasan</div>
                                                    <p className="text-sm text-amber-900">{q.pembahasan}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
