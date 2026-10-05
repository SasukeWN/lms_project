import { checkAuthRole } from "@/lib/auth"
import connection from "@/lib/db"

// =================================================================
// GET: Guru melihat rekap nilai siswa pada kuis yang dibuat
// =================================================================
export async function GET(request: Request) {
    const auth = await checkAuthRole(['guru', 'admin'])
    if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status! })

    try {
        const { searchParams } = new URL(request.url)
        const quiz_id = searchParams.get('quiz_id')
        const user_id = searchParams.get('user_id')

        let query = `
            SELECT 
                scores.id,
                scores.user_id,
                users.username AS user_name,
                users.email AS user_email,
                scores.quiz_id,
                quizzes.judul AS quiz_judul,
                subjects.nama AS nama_pelajaran,
                scores.nilai,
                scores.created_at
            FROM scores
            JOIN users ON scores.user_id = users.id
            JOIN quizzes ON scores.quiz_id = quizzes.id
            JOIN topic ON quizzes.topic_id = topic.id
            JOIN subjects ON topic.subject_id = subjects.id
        `
        let conditions: string[] = []
        let params: any[] = []

        if (quiz_id) {
            conditions.push('scores.quiz_id = ?')
            params.push(quiz_id)
        }

        if (user_id) {
            conditions.push('scores.user_id = ?')
            params.push(user_id)
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ')
        }

        query += ' ORDER BY scores.created_at DESC'

        const [scoresResult] = await connection.execute(query, params)

        return Response.json({
            success: true,
            data: scoresResult
        }, { status: 200 })

    } catch (error: any) {
        console.error("Error GET Guru Scores:", error)
        return Response.json({ success: false, message: "Gagal mengambil data nilai siswa" }, { status: 500 })
    }
}

// =================================================================
// DELETE: Hapus nilai agar siswa bisa mengulang kuis
// =================================================================
export async function DELETE(request: Request) {
    const auth = await checkAuthRole(['guru', 'admin'])
    if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status! })

    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) return Response.json({ success: false, message: "ID diperlukan" }, { status: 400 })

        await connection.execute('DELETE FROM scores WHERE id = ?', [id])
        return Response.json({ success: true, message: "Berhasil dihapus" }, { status: 200 })
    } catch (error: any) {
        return Response.json({ success: false, message: "Gagal menghapus" }, { status: 500 })
    }
}

// =================================================================
// PUT: Guru bisa mengedit nilai secara manual jika perlu
// =================================================================
export async function PUT(request: Request) {
    const auth = await checkAuthRole(['guru', 'admin'])
    if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status! })

    try {
        const body = await request.json()
        const { id, nilai } = body

        if (!id || nilai === undefined) return Response.json({ success: false, message: "Data tidak lengkap" }, { status: 400 })

        await connection.execute('UPDATE scores SET nilai = ? WHERE id = ?', [nilai, id])

        return Response.json({ success: true, message: "Berhasil diupdate" }, { status: 200 })
    } catch (error: any) {
        return Response.json({ success: false, message: "Gagal update" }, { status: 500 })
    }
}

