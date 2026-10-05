import connection from "@/lib/db"
import bcrypt from "bcrypt"
import { UserRow } from "@/types"

export async function POST(request: Request) {
    try {

        const body = await request.json()

        const { username, email, password, role } = body

        if (!username || !email || !password) {
            return Response.json({
                message: "harus di isi untuk register",
                success: false
            }, { status: 400 })
        }

        const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email])
        const users = rows as UserRow[]
        if (users.length > 0) {
            return Response.json({
                message: 'Email sudah terdaftar, gunakan email lain',
                success: false
            }, { status: 400 })
        }




        const saltround: number = 10
        const hashedPassword = await bcrypt.hash(password, saltround)

        const query = await connection.execute('INSERT INTO users (username, email, password, role) VALUES (?, ?, ? , ?)', [username, email, hashedPassword, role || "siswa"])

        return Response.json({
            message: "Berhasil membuat akun. Akun Anda sedang menunggu persetujuan admin.",
            success: true,
            data: {
                username: username,
                email: email,
                role: role || 'siswa'
            }
        }, { status: 201 })

    } catch (error: unknown) {
        console.error(error);
        return Response.json({
            success: false,
            message: error || "terjadi kesalahan server"
        }, { status: 500 })
    }
}