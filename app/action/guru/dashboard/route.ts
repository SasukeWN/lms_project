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

export async function GET() {
    const auth = await checkGuruAuth()
    if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status! })

    try {
        // Ambil total materi
        const [materiResult]: any = await connection.execute('SELECT COUNT(*) as total FROM materials')
        
        // Ambil total kuis
        const [kuisResult]: any = await connection.execute('SELECT COUNT(*) as total FROM quizzes')
        
        // Ambil rata-rata nilai
        const [nilaiResult]: any = await connection.execute('SELECT AVG(nilai) as rata_rata FROM scores')

        return Response.json({
            success: true,
            data: {
                totalMateri: materiResult[0].total,
                totalKuis: kuisResult[0].total,
                rataRataNilai: Math.round(nilaiResult[0].rata_rata || 0)
            }
        }, { status: 200 })

    } catch (error: any) {
        return Response.json({ success: false, message: "Gagal mengambil data dashboard" }, { status: 500 })
    }
}
