import { checkAuthRole } from "@/lib/auth"
import connection from "@/lib/db"

// GET /action/student/scores  — Riwayat nilai milik siswa yang login
export async function GET(request: Request) {
    const auth = await checkAuthRole('siswa')
    if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status! })

    try {
        const studentId = auth.user.id

        const [scores] = await connection.execute(`
            SELECT 
                scores.id,
                quizzes.judul AS quiz_judul,
                subjects.nama AS nama_pelajaran,
                scores.nilai,
                scores.created_at
            FROM scores
            JOIN quizzes ON scores.quiz_id = quizzes.id
            JOIN topic ON quizzes.topic_id = topic.id
            JOIN subjects ON topic.subject_id = subjects.id
            WHERE scores.user_id = ?
            ORDER BY scores.created_at DESC
        `, [studentId])

        return Response.json({ success: true, data: scores }, { status: 200 })

    } catch (error: any) {
        return Response.json({ success: false, message: error.message }, { status: 500 })
    }
}
