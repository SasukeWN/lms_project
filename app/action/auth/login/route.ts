import connection from "@/lib/db"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { UserRow } from "@/types"
import { cookies } from 'next/headers'
export async function POST(request: Request) {
    try {


        const body = await request.json()

        const { username, password } = body

        if (!username || !password) {
            return Response.json({
                message: 'username atau password salah',
                success: false
            }, { status: 400 })
        }

        const [userList] = await connection.execute('SELECT * FROM users WHERE username = ?', [username])
        const users = userList as UserRow[]


        if (users.length === 0) {
            return Response.json({
                message: 'Username tidak ditemukan',
                success: false
            }, { status: 401 })
        }

        const user = users[0];
          


        const passwordValid = await bcrypt.compare(password, user.password!)

        if (!passwordValid) {
            return Response.json({
                message: 'Password salah',
                success: false
            }, { status: 401 })
        }

        if ((user as any).status === 'pending') {
            return Response.json({
                message: 'Akun Anda sedang menunggu persetujuan admin',
                success: false
            }, { status: 403 })
        }

        if ((user as any).status === 'rejected') {
            return Response.json({
                message: 'Pendaftaran akun Anda ditolak oleh admin',
                success: false
            }, { status: 403 })
        }


        const payload = {
            id: user.id,
            username: user.username,
            role: user.role
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET as string) as any;

        const cookieStore = await cookies()
        cookieStore.set('token', token, {
            httpOnly: true,  
            secure: false,
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 
        })



        // 5. Login Sukses!
        return Response.json({
            message: "Berhasil login",
            success: true,
            data: payload
        }, { status: 200 })


    } catch (error: any) {
        console.error(error);
        return Response.json({
            message: error?.message || "Terjadi kesalahan sistem",
            success: false
        }, { status: 500 })
    }
}
