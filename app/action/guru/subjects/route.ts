import { checkAuthRole } from "@/lib/auth"
import connection from "@/lib/db"

export async function GET(request: Request) {
    const auth = await checkAuthRole(['guru', 'admin'])
    if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status! })

    try {
        const [subjects] = await connection.execute('SELECT * FROM subjects')
        return Response.json({ success: true, data: subjects }, { status: 200 })
    } catch (error: any) {
        console.error(error)
        return Response.json({ success: false, message: error.message || "Gagal mengambil data" }, { status: 500 })
    }
}
