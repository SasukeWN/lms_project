import { checkAuthRole } from "@/lib/auth"
import connection from "@/lib/db"

// =================================================================
// GET: Dashboard Siswa (Melihat pelajaran & materi yang tersedia)
// URL: GET /action/student
// =================================================================
export async function GET(request: Request) {
    const auth = await checkAuthRole('siswa')
    if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status! })

    try {
        const studentId = auth.user.id

        // Ambil daftar mata pelajaran beserta materi
        const [subjects] = await connection.execute('SELECT * FROM subjects')
        
        // Ambil nilai kuis yang pernah dikerjakan oleh siswa ini
        const [myScores] = await connection.execute(`
            SELECT 
                scores.id,
                quizzes.judul AS judul_kuis,
                scores.nilai,
                scores.created_at
            FROM scores
            JOIN quizzes ON scores.quiz_id = quizzes.id
            WHERE scores.user_id = ?
            ORDER BY scores.created_at DESC
        `, [studentId])

        return Response.json({
            success: true,
            message: "Selamat datang di Dashboard Siswa",
            user: {
                id: auth.user.id,
                username: auth.user.username,
                role: auth.user.role
            },
            data: {
                subjects: subjects,
                riwayat_nilai: myScores
            }
        }, { status: 200 })

    } catch (error: any) {
        console.error("Error GET Student:", error)
        return Response.json({ success: false, message: "Terjadi kesalahan saat memuat data siswa" }, { status: 500 })
    }
}
