"use client"

import { useState } from "react"
import Link from "next/link"
import axios from "axios"
import { useRouter } from "next/navigation"

export default function LoginPage() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        
        try {
            const res = await axios.post('/action/auth/login', {
                username,
                password
            })
            
            // Ambil role dari response API
            const role = res.data.data.role
            
            alert(res.data.message) // "Berhasil login"
            
            // Redirect sesuai role
            if (role === 'admin') {
                router.push('/admin/dashboard')
            } else if (role === 'guru') {
                router.push('/guru/dashboard_guru')
            } else {
                router.push('/siswa/dashboard')
            }
            
        } catch (error: any) {
            // Tangkap pesan error dari backend ("Username tidak ditemukan" / "Password salah")
            if (error.response && error.response.data && error.response.data.message) {
                alert(error.response.data.message)
            } else {
                alert("Terjadi kesalahan pada sistem")
            }
        }
    }

    return (
        <div className="min-h-screen flex bg-white">
            {/* Left Panel — clean, subtle branding */}
            <div className="hidden lg:flex w-[45%] relative bg-slate-50 flex-col justify-between p-14 border-r border-slate-100 overflow-hidden">
                {/* Subtle decorative circles */}
                <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-50 rounded-full" />
                <div className="absolute bottom-10 right-0 w-56 h-56 bg-slate-100 rounded-full" />

                {/* Logo */}
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <span className="text-slate-800 font-bold text-lg tracking-tight">EduPortal LMS</span>
                </div>

                {/* Center quote */}
                <div className="relative z-10 space-y-8">
                    <div className="space-y-4">
                        <h1 className="text-4xl font-bold text-slate-800 leading-tight tracking-tight">
                            Belajar Lebih<br />Cerdas, Bukan<br />Lebih Keras.
                        </h1>
                        <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                            Platform pembelajaran modern yang menghubungkan guru dan siswa dalam satu ekosistem digital.
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { value: "500+", label: "Materi" },
                            { value: "1.2k", label: "Siswa" },
                            { value: "98%", label: "Kepuasan" },
                        ].map((s, i) => (
                            <div key={i} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                                <p className="text-slate-800 text-xl font-bold">{s.value}</p>
                                <p className="text-slate-400 text-xs mt-0.5">{s.label}</p>
                            </div>
                        ))}
                    </div>

                    
                    
                </div>

                <p className="relative z-10 text-slate-400 text-xs">© 2025 EduPortal LMS.</p>
            </div>

            {/* Right Panel — Login Form */}
            <div className="flex-1 flex items-center justify-center px-6 py-16 bg-white">
                <div className="w-full max-w-sm space-y-8">
                    {/* Mobile brand */}
                    <div className="lg:hidden flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                            </svg>
                        </div>
                        <span className="font-bold text-slate-800">EduPortal LMS</span>
                    </div>

                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Selamat datang kembali</h2>
                        <p className="text-slate-500 text-sm">Masuk ke akun Anda untuk melanjutkan</p>
                    </div>

                    <form className="space-y-4" onSubmit={handleLogin}>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-slate-700">Username</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </span>
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all text-slate-800 placeholder:text-slate-400"
                                    placeholder="Masukkan username"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-slate-700">Password</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </span>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all text-slate-800 placeholder:text-slate-400"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-700 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 mt-1"
                        >
                            Masuk
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-500">
                        Belum punya akun?{" "}
                        <Link href="/auth/register" className="font-semibold text-slate-800 hover:text-slate-600 underline underline-offset-4 transition-colors">
                            Daftar di sini
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
