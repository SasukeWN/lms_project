"use client"

import { useEffect, useState, Suspense } from "react"
import axios from "axios"
import AdminNavbar from "@/app/component_admin/navbar/Navbar"
import { useSearchParams } from "next/navigation"

interface Topic {
    id: number
    subject_id: number
    nama_topik: string
}

interface Material {
    id: number
    topic_id: number
    judul: string
    konten: string
    created_at: string
}

function MaterialContent() {
    const searchParams = useSearchParams()
    const initialTopicId = searchParams.get('topic_id') || ""

    const [materials, setMaterials] = useState<Material[]>([])
    const [topics, setTopics] = useState<Topic[]>([])
    const [loading, setLoading] = useState(true)
    
    // Form state
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editId, setEditId] = useState<number | null>(null)
    const [topicId, setTopicId] = useState(initialTopicId)
    const [judul, setJudul] = useState("")
    const [konten, setKonten] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Filter state
    const [filterTopicId, setFilterTopicId] = useState(initialTopicId)

    const fetchTopics = async () => {
        try {
            const res = await axios.get('/action/admin/topics')
            setTopics(res.data.data)
        } catch (error) {
            console.error("Gagal mengambil data topik", error)
        }
    }

    const fetchMaterials = async (topId: string) => {
        try {
            setLoading(true)
            const url = topId ? `/action/admin/materials?topic_id=${topId}` : '/action/admin/materials'
            const res = await axios.get(url)
            setMaterials(res.data.data)
        } catch (error) {
            console.error("Gagal mengambil materi", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTopics()
        fetchMaterials(filterTopicId)
    }, [filterTopicId])

    const handleOpenAdd = () => {
        setEditId(null)
        setTopicId(filterTopicId) // default filter
        setJudul("")
        setKonten("")
        setIsFormOpen(true)
    }

    const handleOpenEdit = (mat: Material) => {
        setEditId(mat.id)
        setTopicId(mat.topic_id.toString())
        setJudul(mat.judul)
        setKonten(mat.konten)
        setIsFormOpen(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleDelete = async (id: number) => {
        if (!window.confirm("Yakin ingin menghapus materi ini?")) return
        try {
            await axios.delete(`/action/admin/materials?id=${id}`)
            fetchMaterials(filterTopicId)
        } catch (error: any) {
            alert(error.response?.data?.message || "Gagal menghapus")
        }
    }

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            if (editId) {
                await axios.put('/action/admin/materials', {
                    id: editId,
                    topic_id: Number(topicId),
                    judul,
                    konten
                })
                alert("Materi berhasil diupdate!")
            } else {
                await axios.post('/action/admin/materials', { 
                    topic_id: Number(topicId), 
                    judul, 
                    konten 
                })
                alert("Materi berhasil ditambahkan!")
            }
            setIsFormOpen(false)
            fetchMaterials(filterTopicId)
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
                    <h2 className="text-2xl font-bold text-slate-800">Manajemen Materi</h2>
                    <p className="text-sm text-slate-500">Kelola konten bacaan dari setiap topik</p>
                </div>
                <button 
                    onClick={isFormOpen ? () => setIsFormOpen(false) : handleOpenAdd}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors shadow-sm w-full md:w-auto ${
                        isFormOpen ? "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50" : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                >
                    {isFormOpen ? "Batal" : "+ Tambah Materi"}
                </button>
            </div>

            {isFormOpen && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6 animate-in slide-in-from-top-4 fade-in duration-200">
                    <h3 className="font-bold text-slate-800 mb-4">{editId ? "Edit Materi" : "Buat Materi Baru"}</h3>
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
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Judul Materi</label>
                                <input
                                    type="text"
                                    required
                                    value={judul}
                                    onChange={(e) => setJudul(e.target.value)}
                                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none"
                                    placeholder="Contoh: Pengenalan Aljabar"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Isi Konten Materi</label>
                            <textarea
                                required
                                rows={8}
                                value={konten}
                                onChange={(e) => setKonten(e.target.value)}
                                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none resize-none"
                                placeholder="Tuliskan modul atau materi pembelajaran di sini..."
                            />
                        </div>
                        <div className="flex justify-end">
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                                {isSubmitting ? "Menyimpan..." : (editId ? "Update Materi" : "Simpan Materi")}
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
            ) : materials.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed">
                    <span className="text-4xl mb-4 block">📄</span>
                    <h3 className="text-lg font-bold text-slate-700">Belum ada Materi</h3>
                    <p className="text-slate-500 text-sm mt-1">
                        {filterTopicId ? "Tidak ada materi untuk topik ini." : "Silakan tambah materi baru."}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {materials.map((mat) => {
                        const parentTopic = topics.find(t => t.id === mat.topic_id)
                        return (
                            <div key={mat.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative group">
                                <div className="absolute top-5 right-5 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleOpenEdit(mat)} className="p-1.5 bg-slate-100 text-slate-600 rounded-md hover:bg-indigo-100 hover:text-indigo-600 transition-colors">
                                        ✏️
                                    </button>
                                    <button onClick={() => handleDelete(mat.id)} className="p-1.5 bg-slate-100 text-slate-600 rounded-md hover:bg-red-100 hover:text-red-600 transition-colors">
                                        🗑️
                                    </button>
                                </div>
                                <div className="flex justify-between items-start mb-3 pr-20">
                                    <div>
                                        <div className="inline-block px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-md mb-2">
                                            {parentTopic ? parentTopic.nama_topik : `Topik ID: ${mat.topic_id}`}
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900">{mat.judul}</h3>
                                    </div>
                                    <span className="text-xs text-slate-400 font-medium bg-slate-50 px-2 py-1 rounded">
                                        {new Date(mat.created_at).toLocaleDateString('id-ID')}
                                    </span>
                                </div>
                                <p className="text-slate-600 text-sm whitespace-pre-wrap mt-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    {mat.konten}
                                </p>
                            </div>
                        )
                    })}
                </div>
            )}
        </main>
    )
}

export default function MaterialPage() {
    return (
        <div className="h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden">
            <AdminNavbar />
            <div className="flex-1 flex flex-col w-full">
                <header className="hidden md:flex h-16 bg-white border-b border-slate-200 items-center justify-between px-8">
                    <h1 className="text-xl font-bold text-slate-800">Modul Pembelajaran</h1>
                    <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold border-2 border-white shadow-sm">
                            A
                        </div>
                    </div>
                </header>
                <Suspense fallback={<div className="p-8 text-center text-slate-500">Memuat...</div>}>
                    <MaterialContent />
                </Suspense>
            </div>
        </div>
    )
}
