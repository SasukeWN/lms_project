import { checkAuthRole } from "@/lib/auth"
import connection from "@/lib/db"

export async function GET(request: Request) {
    const auth = await checkAuthRole('admin')
    if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status! })

    try {
        const [subjects] = await connection.execute('SELECT * FROM subjects')
        return Response.json({ success: true, data: subjects }, { status: 200 })
    } catch (error: any) {
        return Response.json({ success: false, message: "Gagal mengambil data mata pelajaran" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const auth = await checkAuthRole('admin')
    if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status! })

    try {
        const body = await request.json()
        const { nama, deskripsi } = body

        if (!nama || !deskripsi) return Response.json({ success: false, message: "Kolom wajib diisi" }, { status: 400 })

        const [result]: any = await connection.execute(
            'INSERT INTO subjects (nama, deskripsi) VALUES (?, ?)',
            [nama, deskripsi]
        )

        return Response.json({
            success: true, message: "Berhasil menambahkan",
            data: { id: result.insertId, nama, deskripsi }
        }, { status: 201 })
    } catch (error: any) {
        return Response.json({ success: false, message: "Gagal menyimpan" }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    const auth = await checkAuthRole('admin')
    if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status! })

    try {
        const body = await request.json()
        const { id, nama, deskripsi } = body

        if (!id || !nama || !deskripsi) return Response.json({ success: false, message: "Kolom wajib diisi" }, { status: 400 })

        await connection.execute('UPDATE subjects SET nama = ?, deskripsi = ? WHERE id = ?', [nama, deskripsi, id])

        return Response.json({ success: true, message: "Berhasil diupdate" }, { status: 200 })
    } catch (error: any) {
        return Response.json({ success: false, message: "Gagal update" }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    const auth = await checkAuthRole('admin')
    if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status! })

    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) return Response.json({ success: false, message: "ID diperlukan" }, { status: 400 })

        // Note: Pastikan ada ON DELETE CASCADE di database kalau mau delete otomatis data terkait
        await connection.execute('DELETE FROM subjects WHERE id = ?', [id])

        return Response.json({ success: true, message: "Berhasil dihapus" }, { status: 200 })
    } catch (error: any) {
        return Response.json({ success: false, message: "Gagal menghapus (mungkin ada data terkait)" }, { status: 500 })
    }
}
