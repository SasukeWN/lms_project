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
    nama_topik: string
    topic_id: number
    nama_pelajaran: string
    subject_id: number
    created_at: string
}

import { useParams } from "next/navigation"

export default function MaterialDetailPage() {
    const params = useParams()
    const id = params.id as string
    const [material, setMaterial] = useState<Material | null>(null)
    const [prev, setPrev] = useState<{ id: number; judul: string } | null>(null)
    const [next, setNext] = useState<{ id: number; judul: string } | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        axios.get(`/action/student/material?id=${id}`)
            .then(res => {
                setMaterial(res.data.material)
                setPrev(res.data.prev)
                setNext(res.data.next)
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [id])

    return (
        <div className="h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex flex-col md:flex-row overflow-hidden">
            <StudentNavbar />
            <div className="flex-1 flex flex-col w-full overflow-hidden">
                <header className="hidden md:flex shrink-0 h-16 bg-white/80 backdrop-blur border-b border-violet-100 items-center px-8 gap-2 text-sm">
                    <Link href="/siswa/subjects" className="text-slate-400 hover:text-violet-600 transition-colors">← Pelajaran</Link>
                    {material && (
                        <>
                            <span className="text-slate-300">/</span>
                            <Link href={`/siswa/subjects/${material.subject_id}`} className="text-slate-400 hover:text-violet-600 transition-colors">{material.nama_pelajaran}</Link>
                            <span className="text-slate-300">/</span>
                            <Link href={`/siswa/learn/${material.topic_id}`} className="text-slate-400 hover:text-violet-600 transition-colors">{material.nama_topik}</Link>
                            <span className="text-slate-300">/</span>
                            <span className="text-slate-700 font-semibold">{material.judul}</span>
                        </>
                    )}
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {loading ? (
                        <div className="max-w-3xl mx-auto space-y-4">
                            <div className="h-12 bg-slate-100 rounded-2xl animate-pulse w-2/3"/>
                            <div className="h-64 bg-slate-100 rounded-2xl animate-pulse"/>
                        </div>
                    ) : !material ? (
                        <div className="text-center py-20">
                            <div className="text-5xl mb-4">😕</div>
                            <p className="text-slate-500">Materi tidak ditemukan</p>
                            <Link href="/siswa/subjects" className="mt-4 inline-block text-violet-600 hover:underline">Kembali ke Pelajaran</Link>
                        </div>
                    ) : (
                        <div className="max-w-3xl mx-auto">
                            {/* Header Card */}
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 mb-8 text-white shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/4 translate-x-1/4"/>
                                <div className="relative">
                                    <div className="text-xs font-medium text-blue-200 mb-2 uppercase tracking-wide">📖 {material.nama_topik} • {material.nama_pelajaran}</div>
                                    <h1 className="text-2xl md:text-3xl font-bold">{material.judul}</h1>
                                    <div className="text-blue-200 text-xs mt-3">
                                        Diperbarui: {new Date(material.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 mb-6">
                                <div
                                    className="prose prose-slate max-w-none prose-headings:font-bold prose-p:text-slate-600 prose-p:leading-relaxed text-slate-700 leading-relaxed whitespace-pre-wrap text-base"
                                >
                                    {material.konten}
                                </div>
                            </div>

                            {/* Prev/Next Navigation */}
                            <div className="flex gap-4">
                                {prev ? (
                                    <Link href={`/siswa/material/${prev.id}`} className="flex-1 bg-white border border-slate-100 rounded-2xl p-4 hover:border-violet-300 hover:shadow-md transition-all group text-left">
                                        <div className="text-xs text-slate-400 mb-1">← Materi Sebelumnya</div>
                                        <div className="font-semibold text-slate-700 group-hover:text-violet-700 text-sm truncate">{prev.judul}</div>
                                    </Link>
                                ) : <div className="flex-1"/>}

                                <Link
                                    href={`/siswa/learn/${material.topic_id}`}
                                    className="flex items-center gap-2 bg-violet-50 text-violet-700 border border-violet-200 rounded-2xl px-5 font-semibold text-sm hover:bg-violet-100 transition-colors shrink-0"
                                >
                                    📑 Topik
                                </Link>

                                {next ? (
                                    <Link href={`/siswa/material/${next.id}`} className="flex-1 bg-white border border-slate-100 rounded-2xl p-4 hover:border-violet-300 hover:shadow-md transition-all group text-right">
                                        <div className="text-xs text-slate-400 mb-1">Materi Berikutnya →</div>
                                        <div className="font-semibold text-slate-700 group-hover:text-violet-700 text-sm truncate">{next.judul}</div>
                                    </Link>
                                ) : <div className="flex-1"/>}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
