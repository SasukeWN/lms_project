"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import GuruNavbar from "@/app/component_guru/navbar/Navbar"

interface DashboardData {
    totalMateri: number
    totalKuis: number
    rataRataNilai: number
}

export default function GuruDashboard() {
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await axios.get('/action/guru/dashboard')
                setData(res.data.data)
            } catch (error) {
                console.error("Gagal mengambil data dashboard guru", error)
            } finally {
                setLoading(false)
            }
        }
        fetchDashboard()
    }, [])

    return (
        <div className="h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden">
            <GuruNavbar />

            <div className="flex-1 flex flex-col w-full">
                <header className="hidden md:flex h-16 bg-white border-b border-slate-200 items-center justify-between px-8">
                    <h1 className="text-xl font-bold text-slate-800">Beranda Guru</h1>
                    <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold border-2 border-white shadow-sm">
                            G
                        </div>
                    </div>
                </header>

                <main className="p-4 md:p-8 flex-1 overflow-y-auto">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-800">Selamat datang, Guru!</h2>
                        <p className="text-slate-500 mt-1">Pantau perkembangan materi dan pencapaian siswa di sini.</p>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                            {[1,2,3].map(i => (
                                <div key={i} className="bg-slate-200 h-32 rounded-2xl"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Card 1 */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-6">
                                <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 text-2xl">
                                    📝
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-slate-800">{data?.totalMateri || 0}</div>
                                    <div className="text-sm font-medium text-slate-500">Materi Terpublikasi</div>
                                </div>
                            </div>
                            
                            {/* Card 2 */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-6">
                                <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 text-2xl">
                                    🎯
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-slate-800">{data?.totalKuis || 0}</div>
                                    <div className="text-sm font-medium text-slate-500">Kuis & Latihan</div>
                                </div>
                            </div>

                            {/* Card 3 */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-6">
                                <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 text-2xl">
                                    📈
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-slate-800">{data?.rataRataNilai || 0}</div>
                                    <div className="text-sm font-medium text-slate-500">Rata-rata Nilai Siswa</div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
