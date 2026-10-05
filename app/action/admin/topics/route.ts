import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import connection from "@/lib/db"

async function checkAdminAuth() {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) return { authorized: false, message: "Akses ditolak, Anda belum login", status: 401 }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any
        if (decoded.role !== 'admin') return { authorized: false, message: "Akses ditolak, area khusus Admin!", status: 403 }
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
        const subject_id = searchParams.get('subject_id')

        let query = 'SELECT * FROM topic'
        let params: any[] = []

        if (subject_id) {
            query += ' WHERE subject_id = ?'
            params.push(subject_id)
        }

        const [topics] = await connection.execute(query, params)
        return Response.json({ success: true, data: topics }, { status: 200 })
    } catch (error: any) {
        return Response.json({ success: false, message: "Gagal mengambil data" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const auth = await checkAdminAuth()
    if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status! })

    try {
        const body = await request.json()
        const { subject_id, nama_topik } = body

        if (!subject_id || !nama_topik) return Response.json({ success: false, message: "Kolom wajib diisi" }, { status: 400 })

        const [result]: any = await connection.execute(
            'INSERT INTO topic (subject_id, nama_topik) VALUES (?, ?)',
            [subject_id, nama_topik]
        )

        return Response.json({ success: true, data: { id: result.insertId, subject_id, nama_topik } }, { status: 201 })
    } catch (error: any) {
        return Response.json({ success: false, message: "Gagal menyimpan" }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    const auth = await checkAdminAuth()
    if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status! })

    try {
        const body = await request.json()
        const { id, subject_id, nama_topik } = body

        if (!id || !subject_id || !nama_topik) return Response.json({ success: false, message: "Kolom wajib diisi" }, { status: 400 })

        await connection.execute('UPDATE topic SET subject_id = ?, nama_topik = ? WHERE id = ?', [subject_id, nama_topik, id])

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

        await connection.execute('DELETE FROM topic WHERE id = ?', [id])
        return Response.json({ success: true, message: "Berhasil dihapus" }, { status: 200 })
    } catch (error: any) {
        return Response.json({ success: false, message: "Gagal menghapus" }, { status: 500 })
    }
}
