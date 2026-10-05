import { checkAuthRole } from "@/lib/auth"
import connection from "@/lib/db"

export async function GET(request: Request) {
    const auth = await checkAuthRole('admin')
    if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status! })

    try {
        const [subjects] = await connection.execute('SELECT COUNT(*) as total FROM subjects')
        const [materials] = await connection.execute('SELECT COUNT(*) as total FROM materials')
        const [users] = await connection.execute('SELECT COUNT(*) as total FROM users')

        return Response.json({
            success: true,
            message: "Dashboard Admin",
            data: {
                total_users: (users as any)[0].total,
                total_subjects: (subjects as any)[0].total,
                total_materials: (materials as any)[0].total,
            }
        }, { status: 200 })

    } catch (error: any) {
        return Response.json({ success: false, message: "Gagal mengambil data dashboard" }, { status: 500 })
    }
}

