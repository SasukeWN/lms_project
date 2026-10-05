"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import StudentNavbar from "@/component_siswa/Studentnavbar"
import Link from "next/link"
import { useParams } from "next/navigation"

interface Question {
    id: number
    soal: string
    opsi_a: string
    opsi_b: string
    opsi_c: string
    opsi_d: string
}

interface QuizInfo {
    id: number
    judul: string
    deskripsi: string
    topic_id: number
}

type Step = 'start' | 'doing' | 'result'

interface SubmitResult {
    nilai: number
    jumlah_benar: number
    jumlah_salah: number
    total_soal: number
}

export default function QuizPage() {
    const params = useParams()
    const id = params.id as string

    const [step, setStep] = useState<Step>('start')
    const [quiz, setQuiz] = useState<QuizInfo | null>(null)
    const [questions, setQuestions] = useState<Question[]>([])
    const [answers, setAnswers] = useState<Record<number, string>>({})
    const [current, setCurrent] = useState(0)
    const [result, setResult] = useState<SubmitResult | null>(null)
    const [existingScore, setExistingScore] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        // Cek info kuis dan status pengerjaan siswa
        Promise.all([
            axios.get(`/action/student/quiz-info?quiz_id=${id}`),
        ]).catch(() => {})

        // Ambil info kuis dari questions endpoint
        axios.get(`/action/student/questions?quiz_id=${id}`)
            .then(res => {
                setQuestions(res.data.soal_list)
            })
            .catch(console.error)

        // Cek apakah sudah pernah mengerjakan
        axios.get(`/action/student/scores`)
            .then(res => {
                // Tidak ada endpoint per-quiz, ambil dari scores page
                // Will be checked server side
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [id])

    // Load quiz detail
    useEffect(() => {
        axios.get(`/action/student/learn?topic_id=0`).catch(() => {})
        // We get quiz title from questions response; fallback
        setQuiz({ id: Number(id), judul: "Kuis", deskripsi: "", topic_id: 0 })
    }, [id])

    const handleAnswer = (questionId: number, pilihan: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: pilihan }))
    }

    const handleSubmit = async () => {
        const jawaban = questions.map(q => ({
            question_id: q.id,
            pilihan: answers[q.id] ?? ""
        }))
        setSubmitting(true)
        try {
            const res = await axios.post('/action/student/submit-quiz', { quiz_id: Number(id), jawaban })
            setResult(res.data.hasil)
            setStep('result')
        } catch (err: any) {
            alert(err.response?.data?.message || "Gagal mengumpulkan kuis")
        } finally {
            setSubmitting(false)
        }
    }

    const answeredCount = Object.keys(answers).length
    const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0

    const getGradeInfo = (nilai: number) => {
        if (nilai >= 90) return { label: "Luar Biasa! 🏆", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", msg: "Nilai sempurna! Kamu menguasai materi ini dengan sangat baik." }
        if (nilai >= 75) return { label: "Bagus! 🎉", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", msg: "Kerja bagus! Tetap semangat belajar ya." }
        if (nilai >= 60) return { label: "Cukup 👍", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", msg: "Lumayan! Pelajari lagi materi yang belum dipahami." }
        return { label: "Perlu Belajar Lagi 💪", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", msg: "Jangan menyerah! Baca ulang materi dan coba lagi." }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"/>
                    <p className="text-violet-600 font-medium">Memuat soal...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex flex-col md:flex-row overflow-hidden">
            <StudentNavbar />
            <div className="flex-1 flex flex-col w-full overflow-hidden">
                <header className="hidden md:flex shrink-0 h-16 bg-white/80 backdrop-blur border-b border-violet-100 items-center justify-between px-8">
                    <h1 className="text-lg font-bold text-slate-700">Pengerjaan Kuis</h1>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-2xl mx-auto">

                        {/* START Screen */}
                        {step === 'start' && (
                            <div className="text-center">
                                <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl p-10 text-white mb-8 shadow-xl shadow-amber-200 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/4 translate-x-1/4"/>
                                    <div className="text-6xl mb-4">🎯</div>
                                    <h2 className="text-3xl font-bold mb-2">Siap Mengerjakan Kuis?</h2>
                                    <p className="text-amber-100 text-base">{questions.length} soal pilihan ganda menunggumu</p>
                                </div>
                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6 text-left space-y-3">
                                    <h3 className="font-bold text-slate-800 mb-4">📋 Peraturan Kuis</h3>
                                    {[
                                        "Baca setiap soal dengan cermat sebelum menjawab",
                                        "Jawab semua soal sebelum mengumpulkan",
                                        "Kuis hanya bisa dikerjakan sekali",
                                        "Nilai akan langsung muncul setelah submit"
                                    ].map((rule, i) => (
                                        <div key={i} className="flex items-start gap-3 text-sm text-slate-600">
                                            <span className="w-6 h-6 bg-violet-100 text-violet-700 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">{i + 1}</span>
                                            {rule}
                                        </div>
                                    ))}
                                </div>
                                {questions.length === 0 ? (
                                    <div className="text-slate-500 text-sm bg-amber-50 rounded-2xl p-4">Kuis ini belum memiliki soal. Coba lagi nanti.</div>
                                ) : (
                                    <button
                                        onClick={() => setStep('doing')}
                                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-amber-200 transition-all active:scale-95"
                                    >
                                        Mulai Kuis! 🚀
                                    </button>
                                )}
                            </div>
                        )}

                        {/* DOING - Quiz Questions */}
                        {step === 'doing' && questions.length > 0 && (
                            <>
                                {/* Progress Bar */}
                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6">
                                    <div className="flex items-center justify-between text-sm mb-3">
                                        <span className="font-semibold text-slate-700">Soal {current + 1} dari {questions.length}</span>
                                        <span className="text-violet-600 font-medium">{answeredCount} dijawab</span>
                                    </div>
                                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all duration-500"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Question Card */}
                                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 mb-6">
                                    <div className="text-xs font-semibold text-violet-500 mb-4 uppercase tracking-wide">Pertanyaan {current + 1}</div>
                                    <p className="text-slate-800 font-semibold text-lg leading-relaxed mb-8">{questions[current].soal}</p>

                                    <div className="space-y-3">
                                        {(['a', 'b', 'c', 'd'] as const).map(opt => {
                                            const key = `opsi_${opt}` as keyof Question
                                            const value = questions[current][key] as string
                                            const isSelected = answers[questions[current].id] === opt.toUpperCase()
                                            return (
                                                <button
                                                    key={opt}
                                                    onClick={() => handleAnswer(questions[current].id, opt.toUpperCase())}
                                                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200
                                                        ${isSelected
                                                            ? 'border-violet-500 bg-violet-50 shadow-md shadow-violet-100'
                                                            : 'border-slate-100 hover:border-violet-300 hover:bg-violet-50/50'
                                                        }`}
                                                >
                                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-colors
                                                        ${isSelected ? 'bg-violet-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                        {opt.toUpperCase()}
                                                    </div>
                                                    <span className={`text-sm font-medium ${isSelected ? 'text-violet-800' : 'text-slate-700'}`}>{value}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Navigation */}
                                <div className="flex gap-3 mb-6">
                                    <button
                                        onClick={() => setCurrent(c => Math.max(0, c - 1))}
                                        disabled={current === 0}
                                        className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-600 font-semibold disabled:opacity-40 hover:bg-slate-50 transition-colors"
                                    >
                                        ← Sebelumnya
                                    </button>
                                    {current < questions.length - 1 ? (
                                        <button
                                            onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))}
                                            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold hover:shadow-md transition-all"
                                        >
                                            Selanjutnya →
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleSubmit}
                                            disabled={submitting || answeredCount < questions.length}
                                            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold hover:shadow-md disabled:opacity-50 transition-all"
                                        >
                                            {submitting ? "Mengoreksi..." : `Kumpulkan ✅ (${answeredCount}/${questions.length})`}
                                        </button>
                                    )}
                                </div>

                                {/* Question dots */}
                                <div className="bg-white rounded-2xl border border-slate-100 p-4">
                                    <div className="text-xs text-slate-400 mb-3 font-medium">Navigasi Soal</div>
                                    <div className="flex flex-wrap gap-2">
                                        {questions.map((q, idx) => (
                                            <button
                                                key={q.id}
                                                onClick={() => setCurrent(idx)}
                                                className={`w-9 h-9 rounded-xl text-xs font-bold transition-all
                                                    ${idx === current ? 'bg-violet-600 text-white shadow-md' :
                                                    answers[q.id] ? 'bg-emerald-100 text-emerald-700' :
                                                    'bg-slate-100 text-slate-500 hover:bg-violet-100'}`}
                                            >
                                                {idx + 1}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* RESULT Screen */}
                        {step === 'result' && result && (() => {
                            const grade = getGradeInfo(result.nilai)
                            return (
                                <div className="text-center">
                                    <div className={`rounded-3xl p-10 mb-6 border-2 ${grade.bg} ${grade.border} shadow-lg`}>
                                        <div className="text-6xl mb-4">
                                            {result.nilai >= 90 ? '🏆' : result.nilai >= 75 ? '🎉' : result.nilai >= 60 ? '👍' : '💪'}
                                        </div>
                                        <div className={`text-5xl font-black mb-2 ${grade.color}`}>{result.nilai}</div>
                                        <div className={`text-xl font-bold mb-3 ${grade.color}`}>{grade.label}</div>
                                        <p className="text-slate-500 text-sm">{grade.msg}</p>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3 mb-6">
                                        <div className="bg-white rounded-2xl border border-slate-100 p-4">
                                            <div className="text-2xl font-bold text-slate-800">{result.total_soal}</div>
                                            <div className="text-xs text-slate-400 mt-1">Total Soal</div>
                                        </div>
                                        <div className="bg-white rounded-2xl border border-emerald-100 p-4">
                                            <div className="text-2xl font-bold text-emerald-600">{result.jumlah_benar}</div>
                                            <div className="text-xs text-slate-400 mt-1">Benar</div>
                                        </div>
                                        <div className="bg-white rounded-2xl border border-red-100 p-4">
                                            <div className="text-2xl font-bold text-red-500">{result.jumlah_salah}</div>
                                            <div className="text-xs text-slate-400 mt-1">Salah</div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <Link href="/siswa/subjects" className="flex-1 py-3.5 rounded-2xl border border-violet-200 text-violet-700 font-semibold hover:bg-violet-50 transition-colors">
                                            ← Kembali Belajar
                                        </Link>
                                        <Link href="/siswa/scores" className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold hover:shadow-md transition-all">
                                            Lihat Semua Nilai 📊
                                        </Link>
                                    </div>
                                </div>
                            )
                        })()}
                    </div>
                </main>
            </div>
        </div>
    )
}
