import { checkAuthRole } from "@/lib/auth"
import connection from "@/lib/db"

// GET /action/student/material?id=1 — Detail satu materi
export async function GET(request: Request) {
    const auth = await checkAuthRole('siswa')
    if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status! })

    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) return Response.json({ success: false, message: "id materi wajib diisi" }, { status: 400 })

        const [rows]: any = await connection.execute(`
            SELECT m.*, t.nama_topik AS nama_topik, t.id AS topic_id, s.nama AS nama_pelajaran, s.id AS subject_id
            FROM materials m
            JOIN topic t ON m.topic_id = t.id
            JOIN subjects s ON t.subject_id = s.id
            WHERE m.id = ?
        `, [id])

        if (!rows[0]) return Response.json({ success: false, message: "Materi tidak ditemukan" }, { status: 404 })

        // Materi prev/next dalam topik yang sama
        const [siblings]: any = await connection.execute(
            'SELECT id, judul FROM materials WHERE topic_id = ? ORDER BY id ASC',
            [rows[0].topic_id]
        )

        const currentIdx = siblings.findIndex((m: any) => m.id === rows[0].id)
        const prev = currentIdx > 0 ? siblings[currentIdx - 1] : null
        const next = currentIdx < siblings.length - 1 ? siblings[currentIdx + 1] : null

        return Response.json({ success: true, material: rows[0], prev, next }, { status: 200 })

    } catch (error: any) {
        return Response.json({ success: false, message: error.message }, { status: 500 })
    }
}
