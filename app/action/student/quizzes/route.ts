import { checkAuthRole } from "@/lib/auth"
import connection from "@/lib/db"

// GET /action/student/quizzes?topic_id=1  — Daftar kuis per topik
export async function GET(request: Request) {
    const auth = await checkAuthRole('siswa')
    if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status! })

    try {
        const { searchParams } = new URL(request.url)
        const topic_id = searchParams.get('topic_id')

        let query = `
            SELECT q.id, q.judul, q.topic_id,
                COUNT(qs.id) AS jumlah_soal
            FROM quizzes q
            LEFT JOIN questions qs ON qs.quiz_id = q.id
        `
        const params: any[] = []

        if (topic_id) {
            query += ' WHERE q.topic_id = ?'
            params.push(topic_id)
        }

        query += ' GROUP BY q.id ORDER BY q.id DESC'

        const [quizzes] = await connection.execute(query, params)
        return Response.json({ success: true, data: quizzes }, { status: 200 })

    } catch (error: any) {
        return Response.json({ success: false, message: error.message }, { status: 500 })
    }
}
