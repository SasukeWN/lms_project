import { checkAuthRole } from "@/lib/auth"
import connection from "@/lib/db"

// GET: Dashboard Siswa
export async function GET(request: Request) {
    const auth = await checkAuthRole('siswa')
    if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status! })

    try {
        const studentId = auth.user.id

        // Jumlah mata pelajaran
        const [subjects]: any = await connection.execute('SELECT COUNT(*) as total FROM subjects')

        // Nilai-nilai siswa + nama kuis
        const [myScores]: any = await connection.execute(`
            SELECT 
                scores.id,
                quizzes.judul AS judul_kuis,
                scores.nilai,
                scores.created_at
            FROM scores
            JOIN quizzes ON scores.quiz_id = quizzes.id
            WHERE scores.user_id = ?
            ORDER BY scores.created_at DESC
            LIMIT 5
        `, [studentId])

        // Total kuis yang sudah dikerjakan
        const [totalDone]: any = await connection.execute(
            'SELECT COUNT(*) as total FROM scores WHERE user_id = ?', [studentId]
        )

        // Rata-rata nilai
        const [avgScore]: any = await connection.execute(
            'SELECT ROUND(AVG(nilai), 1) as rata_rata FROM scores WHERE user_id = ?', [studentId]
        )

        return Response.json({
            success: true,
            siswa: {
                id: auth.user.id,
                username: auth.user.username,
                role: auth.user.role
            },
            stats: {
                total_pelajaran: subjects[0].total,
                total_kuis_selesai: totalDone[0].total,
                rata_rata_nilai: avgScore[0].rata_rata ?? 0,
            },
            riwayat_nilai: myScores
        }, { status: 200 })

    } catch (error: any) {
        console.error("Error GET Student Dashboard:", error)
        return Response.json({ success: false, message: error.message }, { status: 500 })
    }
}
