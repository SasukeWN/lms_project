import { checkAuthRole } from "@/lib/auth"
import connection from "@/lib/db"

// GET /action/student/materials?subject_id=1 — Materi siswa
export async function GET(request: Request) {
    const auth = await checkAuthRole('siswa')
    if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status! })

    try {
        const { searchParams } = new URL(request.url)
        const subject_id = searchParams.get('subject_id')
        const topic_id = searchParams.get('topic_id')

        // Jika tidak ada filter, ambil semua subjects
        if (!subject_id && !topic_id) {
            const [subjects]: any = await connection.execute(`
                SELECT s.*, COUNT(t.id) as jumlah_topik
                FROM subjects s
                LEFT JOIN topic t ON t.subject_id = s.id
                GROUP BY s.id ORDER BY s.id ASC
            `)
            return Response.json({ success: true, data: subjects }, { status: 200 })
        }

        let query = `
            SELECT m.id, m.judul, m.topic_id, t.nama_topik AS nama_topik, m.created_at
            FROM materials m
            JOIN topic t ON m.topic_id = t.id
        `
        const params: any[] = []
        const conds: string[] = []

        if (topic_id) { conds.push('m.topic_id = ?'); params.push(topic_id) }
        if (subject_id) { conds.push('t.subject_id = ?'); params.push(subject_id) }
        if (conds.length) query += ' WHERE ' + conds.join(' AND ')
        query += ' ORDER BY m.id ASC'

        const [materials] = await connection.execute(query, params)
        return Response.json({ success: true, data: materials }, { status: 200 })

    } catch (error: any) {
        return Response.json({ success: false, message: error.message }, { status: 500 })
    }
}
