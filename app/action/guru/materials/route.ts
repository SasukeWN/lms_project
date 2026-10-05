import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import connection from "@/lib/db"

async function checkGuruAuth() {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) return { authorized: false, message: "Akses ditolak", status: 401 }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any
        if (decoded.role !== 'guru' && decoded.role !== 'admin') {
            return { authorized: false, message: "Akses khusus Guru", status: 403 }
        }
        return { authorized: true, user: decoded }
    } catch (error) {
        return { authorized: false, message: "Sesi tidak valid", status: 401 }
    }
}

export async function GET(request: Request) {
    const auth = await checkGuruAuth()
    if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status! })

    try {
        const { searchParams } = new URL(request.url)
        const topic_id = searchParams.get('topic_id')
        let query = 'SELECT * FROM materials'
        let params: any[] = []
        if (topic_id) {
            query += ' WHERE topic_id = ?'
            params.push(topic_id)
        }
        const [materials] = await connection.execute(query, params)
        return Response.json({ success: true, data: materials }, { status: 200 })
    } catch (error: any) {
        return Response.json({ success: false, message: "Gagal mengambil materi" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const auth = await checkGuruAuth()
    if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status! })
    try {
        const body = await request.json()
        const { topic_id, judul, konten } = body
        if (!topic_id || !judul || !konten) return Response.json({ success: false, message: "Kolom wajib diisi" }, { status: 400 })
        const [result]: any = await connection.execute('INSERT INTO materials (topic_id, judul, konten) VALUES (?, ?, ?)', [topic_id, judul, konten])
        return Response.json({ success: true, message: "Materi berhasil dibuat" }, { status: 201 })
    } catch (error: any) {
        return Response.json({ success: false, message: "Gagal menyimpan materi" }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    const auth = await checkGuruAuth()
    if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status! })
    try {
        const body = await request.json()
        const { id, topic_id, judul, konten } = body
        if (!id || !topic_id || !judul || !konten) return Response.json({ success: false, message: "Kolom wajib diisi" }, { status: 400 })
        await connection.execute('UPDATE materials SET topic_id = ?, judul = ?, konten = ? WHERE id = ?', [topic_id, judul, konten, id])
        return Response.json({ success: true, message: "Materi berhasil diupdate" }, { status: 200 })
    } catch (error: any) {
        return Response.json({ success: false, message: "Gagal update materi" }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    const auth = await checkGuruAuth()
    if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status! })
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        if (!id) return Response.json({ success: false, message: "ID diperlukan" }, { status: 400 })
        await connection.execute('DELETE FROM materials WHERE id = ?', [id])
        return Response.json({ success: true, message: "Materi berhasil dihapus" }, { status: 200 })
    } catch (error: any) {
        return Response.json({ success: false, message: "Gagal menghapus materi" }, { status: 500 })
    }
}
