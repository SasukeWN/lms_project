import { checkAuthRole } from "@/lib/auth"
import connection from "@/lib/db"

// GET /action/student/questions?quiz_id=1
// Kunci jawaban DISEMBUNYIKAN dari siswa
export async function GET(request: Request) {
    const auth = await checkAuthRole('siswa')
    if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status! })

    try {
        const { searchParams } = new URL(request.url)
        const quiz_id = searchParams.get('quiz_id')

        if (!quiz_id) return Response.json({ success: false, message: "quiz_id wajib diisi" }, { status: 400 })

        const [questions] = await connection.execute(`
            SELECT id, quiz_id, soal, opsi_a, opsi_b, opsi_c, opsi_d
            FROM questions WHERE quiz_id = ? ORDER BY id ASC
        `, [quiz_id])

        return Response.json({
            success: true,
            quiz_id: Number(quiz_id),
            total_soal: (questions as any[]).length,
            soal_list: questions
        }, { status: 200 })

    } catch (error: any) {
        return Response.json({ success: false, message: error.message }, { status: 500 })
    }
}
