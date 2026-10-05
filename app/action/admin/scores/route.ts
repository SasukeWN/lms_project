import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import connection from "@/lib/db"

async function checkAdminAuth() {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) return { authorized: false, message: "Akses ditolak", status: 401 }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any
        if (decoded.role !== 'admin') return { authorized: false, message: "Akses khusus Admin", status: 403 }
        return { authorized: true, user: decoded }
    } catch (error) {
        return { authorized: false, message: "Sesi tidak valid", status: 401 }
    }
}

// GET: Ambil daftar nilai beserta nama user dan judul kuis
export async function GET(request: Request) {
    const auth = await checkAdminAuth()
    if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status! })

    try {
        const { searchParams } = new URL(request.url)
        const quiz_id = searchParams.get('quiz_id')

        let query = `
            SELECT 
                scores.id, 
                scores.user_id, 
                scores.quiz_id, 
                scores.nilai, 
                scores.created_at,
                users.username AS user_name,
                users.email AS user_email,
                quizzes.judul AS quiz_judul
            FROM scores
            JOIN users ON scores.user_id = users.id
            JOIN quizzes ON scores.quiz_id = quizzes.id
        `
        let params: any[] = []

        if (quiz_id) {
            query += ' WHERE scores.quiz_id = ?'
            params.push(quiz_id)
        }

        query += ' ORDER BY scores.created_at DESC'

        const [scores] = await connection.execute(query, params)
        return Response.json({ success: true, data: scores }, { status: 200 })
    } catch (error: any) {
        return Response.json({ success: false, message: "Gagal mengambil data nilai" }, { status: 500 })
    }
}

// DELETE: Menghapus nilai (misal agar siswa bisa retake ujian)
export async function DELETE(request: Request) {
    const auth = await checkAdminAuth()
    if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status! })

    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) return Response.json({ success: false, message: "ID diperlukan" }, { status: 400 })

        await connection.execute('DELETE FROM scores WHERE id = ?', [id])
        return Response.json({ success: true, message: "Nilai berhasil dihapus" }, { status: 200 })
    } catch (error: any) {
        return Response.json({ success: false, message: "Gagal menghapus nilai" }, { status: 500 })
    }
}

// PUT: Admin update nilai (manual override)
export async function PUT(request: Request) {
    const auth = await checkAdminAuth()
    if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status! })

    try {
        const body = await request.json()
        const { id, nilai } = body

        if (!id || nilai === undefined) return Response.json({ success: false, message: "ID dan Nilai wajib diisi" }, { status: 400 })

        await connection.execute('UPDATE scores SET nilai = ? WHERE id = ?', [nilai, id])
        return Response.json({ success: true, message: "Nilai berhasil diubah" }, { status: 200 })
    } catch (error: any) {
        return Response.json({ success: false, message: "Gagal mengubah nilai" }, { status: 500 })
    }
}
