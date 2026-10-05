"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import AdminNavbar from "@/app/component_admin/navbar/Navbar"
import Link from "next/link"

interface Subject {
    id: number
    nama: string
    deskripsi: string
}

export default function SubjectPage() {
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [loading, setLoading] = useState(true)
    
    // Form state
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editId, setEditId] = useState<number | null>(null)
    const [nama, setNama] = useState("")
    const [deskripsi, setDeskripsi] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const fetchSubjects = async () => {
        try {
            setLoading(true)
            const res = await axios.get('/action/admin/subjects')
            setSubjects(res.data.data)
        } catch (error) {
            console.error("Gagal mengambil data", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSubjects()
    }, [])

    const handleOpenAdd = () => {
        setEditId(null)
        setNama("")
        setDeskripsi("")
        setIsFormOpen(true)
    }

    const handleOpenEdit = (subject: Subject) => {
        setEditId(subject.id)
        setNama(subject.nama)
        setDeskripsi(subject.deskripsi)
        setIsFormOpen(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleDelete = async (id: number) => {
        if (!window.confirm("Yakin ingin menghapus mata pelajaran ini? Data topik dan materi di dalamnya mungkin akan ikut terhapus atau error.")) return
        
        try {
            await axios.delete(`/action/admin/subjects?id=${id}`)
            fetchSubjects()
        } catch (error: any) {
            alert(error.response?.data?.message || "Gagal menghapus")
        }
    }

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            if (editId) {
                await axios.put('/action/admin/subjects', { id: editId, nama, deskripsi })
                alert("Berhasil diupdate!")
            } else {
                await axios.post('/action/admin/subjects', { nama, deskripsi })
                alert("Berhasil ditambahkan!")
            }
            setIsFormOpen(false)
            fetchSubjects()
        } catch (error: any) {
            alert(error.response?.data?.message || "Terjadi kesalahan")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden">
            <AdminNavbar />

            <div className="flex-1 flex flex-col w-full">
                <header className="hidden md:flex h-16 bg-white border-b border-slate-200 items-center justify-between px-8">
                    <h1 className="text-xl font-bold text-slate-800">Manajemen Mata Pelajaran</h1>
                    <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold border-2 border-white shadow-sm">
                            A
                        </div>
                    </div>
                </header>

                <main className="p-4 md:p-8 flex-1 overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">Daftar Mata Pelajaran</h2>
                            <p className="text-sm text-slate-500">Kategori utama dalam sistem LMS</p>
                        </div>
                        <button 
                            onClick={isFormOpen ? () => setIsFormOpen(false) : handleOpenAdd}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors shadow-sm ${
                                isFormOpen ? "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50" : "bg-slate-900 text-white hover:bg-slate-800"
                            }`}
                        >
                            {isFormOpen ? "Batal" : "+ Tambah Mapel"}
                        </button>
                    </div>

                    {isFormOpen && (
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6 animate-in slide-in-from-top-4 fade-in duration-200">
                            <h3 className="font-bold text-slate-800 mb-4">{editId ? "Edit Mata Pelajaran" : "Mata Pelajaran Baru"}</h3>
                            <form onSubmit={handleFormSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Mata Pelajaran</label>
                                        <input
                                            type="text"
                                            required
                                            value={nama}
                                            onChange={(e) => setNama(e.target.value)}
                                            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
                                            placeholder="Contoh: Matematika Dasar"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Deskripsi Singkat</label>
                                        <input
                                            type="text"
                                            required
                                            value={deskripsi}
                                            onChange={(e) => setDeskripsi(e.target.value)}
                                            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
                                            placeholder="Contoh: Belajar aljabar dan trigonometri"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting}
                                        className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                    >
                                        {isSubmitting ? "Menyimpan..." : (editId ? "Update Mapel" : "Simpan Mapel")}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center text-slate-500 py-10 animate-pulse">Memuat data...</div>
                    ) : subjects.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed">
                            <span className="text-4xl mb-4 block">📚</span>
                            <h3 className="text-lg font-bold text-slate-700">Belum ada Mapel</h3>
                            <p className="text-slate-500 text-sm mt-1">Silakan tambah kategori mata pelajaran.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {subjects.map((subject) => (
                                <div key={subject.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full relative group">
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleOpenEdit(subject)} className="p-1.5 bg-slate-100 text-slate-600 rounded-md hover:bg-indigo-100 hover:text-indigo-600 transition-colors">
                                            ✏️
                                        </button>
                                        <button onClick={() => handleDelete(subject.id)} className="p-1.5 bg-slate-100 text-slate-600 rounded-md hover:bg-red-100 hover:text-red-600 transition-colors">
                                            🗑️
                                        </button>
                                    </div>
                                    <div className="flex-1 mt-2">
                                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-xl mb-4">
                                            📘
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-1">{subject.nama}</h3>
                                        <p className="text-slate-500 text-sm line-clamp-2 pr-10">{subject.deskripsi}</p>
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-slate-100 flex gap-2">
                                        <Link 
                                            href={`/admin/topic?subject_id=${subject.id}`}
                                            className="flex-1 text-center py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg transition-colors border border-slate-200"
                                        >
                                            Kelola Topik
                                        </Link>
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
