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
        const quiz_id = searchParams.get('quiz_id')

        let query = 'SELECT * FROM questions'
        let params: any[] = []

        if (quiz_id) {
            query += ' WHERE quiz_id = ?'
            params.push(quiz_id)
        }

        const [questions] = await connection.execute(query, params)
        return Response.json({ success: true, data: questions }, { status: 200 })
    } catch (error: any) {
        return Response.json({ success: false, message: "Gagal mengambil data soal" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const auth = await checkAdminAuth()
    if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status! })

    try {
        const body = await request.json()
        const { quiz_id, soal, opsi_a, opsi_b, opsi_c, opsi_d, kunci_jawaban, pembahasan } = body

        if (!quiz_id || !soal || !opsi_a || !opsi_b || !opsi_c || !opsi_d || !kunci_jawaban) {
            return Response.json({ success: false, message: "Semua kolom wajib diisi kecuali pembahasan" }, { status: 400 })
        }

        const [result]: any = await connection.execute(
            'INSERT INTO questions (quiz_id, soal, opsi_a, opsi_b, opsi_c, opsi_d, kunci_jawaban, pembahasan) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [quiz_id, soal, opsi_a, opsi_b, opsi_c, opsi_d, kunci_jawaban, pembahasan || null]
        )

        return Response.json({ success: true, message: "Soal berhasil dibuat", data: { id: result.insertId } }, { status: 201 })
    } catch (error: any) {
        return Response.json({ success: false, message: "Gagal menyimpan soal" }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    const auth = await checkAdminAuth()
    if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status! })

    try {
        const body = await request.json()
        const { id, quiz_id, soal, opsi_a, opsi_b, opsi_c, opsi_d, kunci_jawaban, pembahasan } = body

        if (!id || !quiz_id || !soal || !opsi_a || !opsi_b || !opsi_c || !opsi_d || !kunci_jawaban) {
            return Response.json({ success: false, message: "Semua kolom wajib diisi kecuali pembahasan" }, { status: 400 })
        }

        await connection.execute(
            'UPDATE questions SET quiz_id=?, soal=?, opsi_a=?, opsi_b=?, opsi_c=?, opsi_d=?, kunci_jawaban=?, pembahasan=? WHERE id=?', 
            [quiz_id, soal, opsi_a, opsi_b, opsi_c, opsi_d, kunci_jawaban, pembahasan || null, id]
        )
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

        await connection.execute('DELETE FROM questions WHERE id = ?', [id])
        return Response.json({ success: true, message: "Berhasil dihapus" }, { status: 200 })
    } catch (error: any) {
        return Response.json({ success: false, message: "Gagal menghapus" }, { status: 500 })
    }
}
