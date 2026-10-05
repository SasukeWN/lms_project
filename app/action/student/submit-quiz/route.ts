import { checkAuthRole } from "@/lib/auth"
import connection from "@/lib/db"

// =================================================================
// POST: Siswa mengumpulkan jawaban kuis -> Otomatis dikoreksi & dinilai!
// URL: POST /action/student/submit-quiz
// =================================================================
export async function POST(request: Request) {
    const auth = await checkAuthRole('siswa')
    if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status! })

    try {
        const studentId = auth.user.id
        const body = await request.json()
        const { quiz_id, jawaban } = body 
        // Format jawaban yang dikirim:
        // [
        //   { "question_id": 1, "pilihan": "A" },
        //   { "question_id": 2, "pilihan": "C" }
        // ]

        if (!quiz_id || !Array.isArray(jawaban) || jawaban.length === 0) {
            return Response.json({ 
                success: false, 
                message: "Format pengumpulan jawaban tidak valid (quiz_id dan array jawaban wajib diisi)" 
            }, { status: 400 })
        }

        // 1. Cek apakah siswa sudah pernah mengerjakan kuis ini
        const [existing]: any = await connection.execute(
            'SELECT id FROM scores WHERE user_id = ? AND quiz_id = ?',
            [studentId, quiz_id]
        )
        if (existing.length > 0) {
            return Response.json({ success: false, message: "Kamu sudah mengerjakan kuis ini sebelumnya" }, { status: 409 })
        }

        // 2. Ambil seluruh kunci jawaban asli untuk kuis ini dari database
        const [realQuestions]: any = await connection.execute(
            'SELECT id, kunci_jawaban FROM questions WHERE quiz_id = ?',
            [quiz_id]
        )

        if (realQuestions.length === 0) {
            return Response.json({ 
                success: false, 
                message: "Kuis ini belum memiliki soal" 
            }, { status: 404 })
        }

        // 3. Koreksi jawaban siswa
        let jumlahBenar = 0
        const totalSoal = realQuestions.length

        // Buat mapping kunci jawaban agar pencocokan cepat
        const kunciMap = new Map<number, string>()
        realQuestions.forEach((q: any) => {
            kunciMap.set(q.id, q.kunci_jawaban)
        })

        jawaban.forEach((item: { question_id: number; pilihan: string }) => {
            const kunciAsli = kunciMap.get(item.question_id)
            if (kunciAsli && kunciAsli.toUpperCase() === item.pilihan.toUpperCase()) {
                jumlahBenar++
            }
        })

        // 4. Hitung skor akhir (skala 0 - 100)
        const nilaiAkhir = Math.round((jumlahBenar / totalSoal) * 100)

        // 5. Simpan nilai ke tabel `scores`
        const [result]: any = await connection.execute(
            'INSERT INTO scores (user_id, quiz_id, nilai) VALUES (?, ?, ?)',
            [studentId, quiz_id, nilaiAkhir]
        )

        return Response.json({
            success: true,
            message: "Ujian selesai! Nilai berhasil dihitung dan disimpan.",
            hasil: {
                score_id: result.insertId,
                quiz_id,
                total_soal: totalSoal,
                jumlah_benar: jumlahBenar,
                jumlah_salah: totalSoal - jumlahBenar,
                nilai: nilaiAkhir
            }
        }, { status: 201 })

    } catch (error: any) {
        console.error("Error POST Submit Quiz:", error)
        return Response.json({ success: false, message: "Terjadi kesalahan saat mengoreksi ujian" }, { status: 500 })
    }
}
