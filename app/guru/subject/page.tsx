"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import GuruNavbar from "@/app/component_guru/navbar/Navbar"
import Link from "next/link"

interface Subject {
    id: number
    nama: string
    deskripsi: string
}

export default function SubjectPage() {
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [loading, setLoading] = useState(true)

    const fetchSubjects = async () => {
        try {
            setLoading(true)
            const res = await axios.get('/action/guru/subjects')
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

    return (
        <div className="h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden">
            <GuruNavbar />

            <div className="flex-1 flex flex-col w-full">
                <header className="hidden md:flex h-16 bg-white border-b border-slate-200 items-center justify-between px-8">
                    <h1 className="text-xl font-bold text-slate-800">Mata Pelajaran</h1>
                    <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm">
                            G
                        </div>
                    </div>
                </header>

                <main className="p-4 md:p-8 flex-1 overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">Daftar Mata Pelajaran</h2>
                            <p className="text-sm text-slate-500">Pilih mata pelajaran untuk mengelola topik dan materinya</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center text-slate-500 py-10 animate-pulse">Memuat data...</div>
                    ) : subjects.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed">
                            <span className="text-4xl mb-4 block">📚</span>
                            <h3 className="text-lg font-bold text-slate-700">Belum ada Mapel</h3>
                            <p className="text-slate-500 text-sm mt-1">Admin belum menambahkan mata pelajaran apapun.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {subjects.map((subject) => (
                                <div key={subject.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full relative group">
                                    <div className="flex-1 mt-2">
                                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-xl mb-4">
                                            📘
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-1">{subject.nama}</h3>
                                        <p className="text-slate-500 text-sm line-clamp-2 pr-10">{subject.deskripsi}</p>
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-slate-100 flex gap-2">
                                        <Link 
                                            href={`/guru/topic?subject_id=${subject.id}`}
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
