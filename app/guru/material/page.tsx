"use client"

import { useEffect, useState, Suspense } from "react"
import axios from "axios"
import GuruNavbar from "@/app/component_guru/navbar/Navbar"
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
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [loading, setLoading] = useState(true)
    
    // Form state
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editId, setEditId] = useState<number | null>(null)
    const [subjectId, setSubjectId] = useState("")
    const [topicId, setTopicId] = useState(initialTopicId)
    const [judul, setJudul] = useState("")
    const [konten, setKonten] = useState("")
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

    const fetchMaterials = async (topId: string) => {
        try {
            setLoading(true)
            const url = topId ? `/action/guru/materials?topic_id=${topId}` : '/action/guru/materials'
            const res = await axios.get(url)
            setMaterials(res.data.data)
        } catch (error) {
            console.error("Gagal mengambil materi", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        fetchMaterials(filterTopicId)
    }, [filterTopicId])

    // Derive filtered topics for dropdowns
    const formTopics = topics.filter(t => t.subject_id.toString() === subjectId)
    const filterTopics = topics.filter(t => filterSubjectId ? t.subject_id.toString() === filterSubjectId : true)

    const handleOpenAdd = () => {
        setEditId(null)
        setSubjectId(filterSubjectId) // inherit filter subject
        setTopicId(filterTopicId) // inherit filter topic
        setJudul("")
        setKonten("")
        setIsFormOpen(true)
    }

    const handleOpenEdit = (mat: Material) => {
        const matTopic = topics.find(t => t.id === mat.topic_id)
        if (matTopic) {
            setSubjectId(matTopic.subject_id.toString())
        }
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
            await axios.delete(`/action/guru/materials?id=${id}`)
            fetchMaterials(filterTopicId)
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
                await axios.put('/action/guru/materials', {
                    id: editId,
                    topic_id: Number(topicId),
                    judul,
                    konten
                })
                alert("Materi berhasil diupdate!")
            } else {
                await axios.post('/action/guru/materials', { 
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
                    <h2 className="text-2xl font-bold text-slate-800">Manajemen Materi (Guru)</h2>
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Mata Pelajaran</label>
                                <select
                                    required
                                    value={subjectId}
                                    onChange={(e) => {
                                        setSubjectId(e.target.value)
                                        setTopicId("") // reset topic when subject changes
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

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <span className="text-sm font-medium text-slate-600 whitespace-nowrap">Filter Mapel:</span>
                    <select
                        value={filterSubjectId}
                        onChange={(e) => {
                            setFilterSubjectId(e.target.value)
                            setFilterTopicId("") // reset topic when mapel changes
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
                const displayedMaterials = materials.filter(mat => {
                    if (!filterSubjectId) return true;
                    const parentTopic = topics.find(t => t.id === mat.topic_id);
                    return parentTopic && parentTopic.subject_id.toString() === filterSubjectId;
                });

                if (displayedMaterials.length === 0) {
                    return (
                        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed">
                            <span className="text-4xl mb-4 block">📄</span>
                            <h3 className="text-lg font-bold text-slate-700">Belum ada Materi</h3>
                            <p className="text-slate-500 text-sm mt-1">
                                {filterTopicId || filterSubjectId ? "Tidak ada materi untuk filter ini." : "Silakan tambah materi baru."}
                            </p>
                        </div>
                    );
                }

                return (
                    <div className="space-y-4">
                        {displayedMaterials.map((mat) => {
                            const parentTopic = topics.find(t => t.id === mat.topic_id)
                            const parentSubject = parentTopic ? subjects.find(s => s.id === parentTopic.subject_id) : null

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
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {parentSubject && (
                                                <div className="inline-block px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-md">
                                                    {parentSubject.nama}
                                                </div>
                                            )}
                                            <div className="inline-block px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md">
                                                {parentTopic ? parentTopic.nama_topik : `Topik ID: ${mat.topic_id}`}
                                            </div>
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
                )
            })()}
        </main>
    )
}

export default function GuruMaterialPage() {
    return (
        <div className="h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden">
            <GuruNavbar />
            <div className="flex-1 flex flex-col w-full">
                <header className="hidden md:flex h-16 bg-white border-b border-slate-200 items-center justify-between px-8">
                    <h1 className="text-xl font-bold text-slate-800">Modul Pembelajaran</h1>
                    <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm">
                            G
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

