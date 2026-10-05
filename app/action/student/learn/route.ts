import { checkAuthRole } from "@/lib/auth"
import connection from "@/lib/db"

// GET: Topics + materials + quizzes untuk satu topic
// GET /action/student/learn?topic_id=1
// GET /action/student/learn?subject_id=1  (untuk halaman subjects/[id])
export async function GET(request: Request) {
    const auth = await checkAuthRole('siswa')
    if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status! })

    try {
        const studentId = auth.user.id
        const { searchParams } = new URL(request.url)
        const topic_id = searchParams.get('topic_id')
        const subject_id = searchParams.get('subject_id')

        if (topic_id) {
            // Detail topic: materi + kuis (beserta status sudah dikerjakan atau belum)
            const [topic]: any = await connection.execute(
                'SELECT t.id, t.subject_id, t.nama_topik AS nama, t.created_at, s.nama as nama_pelajaran FROM topic t JOIN subjects s ON t.subject_id = s.id WHERE t.id = ?',
                [topic_id]
            )
            if (!topic[0]) return Response.json({ success: false, message: "Topik tidak ditemukan" }, { status: 404 })

            const [materials]: any = await connection.execute(
                'SELECT id, judul, konten, created_at FROM materials WHERE topic_id = ? ORDER BY id ASC',
                [topic_id]
            )

            const [quizzes]: any = await connection.execute(`
                SELECT q.id, q.judul,
                    COUNT(qs.id) AS jumlah_soal,
                    s.nilai AS nilai_saya,
                    s.created_at AS dikerjakan_pada
                FROM quizzes q
                LEFT JOIN questions qs ON qs.quiz_id = q.id
                LEFT JOIN scores s ON s.quiz_id = q.id AND s.user_id = ?
                WHERE q.topic_id = ?
                GROUP BY q.id, s.nilai, s.created_at
                ORDER BY q.id ASC
            `, [studentId, topic_id])

            return Response.json({
                success: true,
                topic: topic[0],
                materials,
                quizzes
            }, { status: 200 })
        }

        if (subject_id) {
            // Semua topik untuk sebuah subject
            const [subject]: any = await connection.execute('SELECT * FROM subjects WHERE id = ?', [subject_id])
            if (!subject[0]) return Response.json({ success: false, message: "Pelajaran tidak ditemukan" }, { status: 404 })

            const [topics]: any = await connection.execute(`
                SELECT t.id, t.subject_id, t.nama_topik AS nama, t.created_at, 
                    COUNT(DISTINCT m.id) as jumlah_materi,
                    COUNT(DISTINCT qz.id) as jumlah_kuis
                FROM topic t
                LEFT JOIN materials m ON m.topic_id = t.id
                LEFT JOIN quizzes qz ON qz.topic_id = t.id
                WHERE t.subject_id = ?
                GROUP BY t.id ORDER BY t.id ASC
            `, [subject_id])

            return Response.json({ success: true, subject: subject[0], topics }, { status: 200 })
        }

        return Response.json({ success: false, message: "Parameter topic_id atau subject_id diperlukan" }, { status: 400 })

    } catch (error: any) {
        return Response.json({ success: false, message: error.message }, { status: 500 })
    }
}
