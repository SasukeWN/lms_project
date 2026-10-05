import { checkAuthRole } from "@/lib/auth"
import connection from "@/lib/db"

export async function GET(request: Request) {
    const auth = await checkAuthRole(['guru', 'admin'])
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
        return Response.json({ success: false, message: "Gagal mengambil data topik" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const auth = await checkAuthRole(['guru', 'admin'])
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
    const auth = await checkAuthRole(['guru', 'admin'])
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
    const auth = await checkAuthRole(['guru', 'admin'])
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
