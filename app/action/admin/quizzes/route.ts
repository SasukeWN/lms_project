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

export async function GET(request: Request) {
    const auth = await checkAdminAuth()
    if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status! })

    try {
        const { searchParams } = new URL(request.url)
        const topic_id = searchParams.get('topic_id')

        let query = 'SELECT * FROM quizzes'
        let params: any[] = []

        if (topic_id) {
            query += ' WHERE topic_id = ?'
            params.push(topic_id)
        }

        const [quizzes] = await connection.execute(query, params)
        return Response.json({ success: true, data: quizzes }, { status: 200 })
    } catch (error: any) {
        return Response.json({ success: false, message: "Gagal mengambil data kuis" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const auth = await checkAdminAuth()
    if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status! })

    try {
        const body = await request.json()
        const { topic_id, judul } = body

        if (!topic_id || !judul) return Response.json({ success: false, message: "Kolom wajib diisi" }, { status: 400 })

        const [result]: any = await connection.execute(
            'INSERT INTO quizzes (topic_id, judul) VALUES (?, ?)',
            [topic_id, judul]
        )

        return Response.json({ success: true, message: "Kuis berhasil dibuat", data: { id: result.insertId, topic_id, judul } }, { status: 201 })
    } catch (error: any) {
        return Response.json({ success: false, message: "Gagal menyimpan kuis" }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    const auth = await checkAdminAuth()
    if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status! })

    try {
        const body = await request.json()
        const { id, topic_id, judul } = body

        if (!id || !topic_id || !judul) return Response.json({ success: false, message: "Kolom wajib diisi" }, { status: 400 })

        await connection.execute('UPDATE quizzes SET topic_id = ?, judul = ? WHERE id = ?', [topic_id, judul, id])
        return Response.json({ success: true, message: "Berhasil diupdate" }, { status: 200 })
    } catch (error: any) {
        return Response.json({ success: false, message: "Gagal update" }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    const auth = await checkAdminAuth()
    if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status! })

    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) return Response.json({ success: false, message: "ID diperlukan" }, { status: 400 })

        await connection.execute('DELETE FROM quizzes WHERE id = ?', [id])
        return Response.json({ success: true, message: "Berhasil dihapus" }, { status: 200 })
    } catch (error: any) {
        return Response.json({ success: false, message: "Gagal menghapus" }, { status: 500 })
    }
}
