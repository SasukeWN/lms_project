import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import connection from "@/lib/db"
import bcrypt from "bcrypt"

async function checkAdminAuth() {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) return { authorized: false, message: "Akses ditolak, Anda belum login", status: 401 }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any
        if (decoded.role !== 'admin') return { authorized: false, message: "Akses ditolak, area khusus Admin!", status: 403 }
        return { authorized: true, user: decoded }
    } catch (error) {
        return { authorized: false, message: "Sesi tidak valid", status: 401 }
    }
}

// GET: Ambil daftar user
export async function GET(request: Request) {
    const auth = await checkAdminAuth()
    if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status! })

    try {
        const { searchParams } = new URL(request.url)
        const role = searchParams.get('role')

        let query = 'SELECT id, username, email, role, status, created_at FROM users'
        let params: any[] = []

        if (role) {
            query += ' WHERE role = ?'
            params.push(role)
        }

        query += ' ORDER BY created_at DESC'

        const [users] = await connection.execute(query, params)
        return Response.json({ success: true, data: users }, { status: 200 })
    } catch (error: any) {
        return Response.json({ success: false, message: "Gagal mengambil data user" }, { status: 500 })
    }
}

// POST: Tambah user baru (Admin bisa tambah guru atau siswa langsung)
export async function POST(request: Request) {
    const auth = await checkAdminAuth()
    if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status! })

    try {
        const body = await request.json()
        const { username, email, password, role } = body

        if (!username || !email || !password || !role) {
            return Response.json({ success: false, message: "Semua kolom wajib diisi" }, { status: 400 })
        }

        const [existing]: any = await connection.execute('SELECT * FROM users WHERE email = ?', [email])
        if (existing.length > 0) return Response.json({ success: false, message: "Email sudah terdaftar" }, { status: 400 })

        const hashedPassword = await bcrypt.hash(password, 10)
        
        await connection.execute(
            'INSERT INTO users (username, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
            [username, email, hashedPassword, role, 'approved'] // Admin creates user -> auto approved
        )

        return Response.json({ success: true, message: "User berhasil dibuat" }, { status: 201 })
    } catch (error: any) {
        return Response.json({ success: false, message: "Gagal membuat user" }, { status: 500 })
    }
}

// PUT: Update role, email atau status user
export async function PUT(request: Request) {
    const auth = await checkAdminAuth()
    if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status! })

    try {
        const body = await request.json()
        const { id, username, email, role, status } = body

        if (!id || !username || !email || !role || !status) {
            return Response.json({ success: false, message: "Kolom wajib diisi" }, { status: 400 })
        }

        await connection.execute(
            'UPDATE users SET username = ?, email = ?, role = ?, status = ? WHERE id = ?', 
            [username, email, role, status, id]

        )

        return Response.json({ success: true, message: "User berhasil diupdate" }, { status: 200 })
    } catch (error: any) {
        return Response.json({ success: false, message: "Gagal update user" }, { status: 500 })
    }
}

// DELETE: Hapus user
export async function DELETE(request: Request) {
    const auth = await checkAdminAuth()
    if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status! })

    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) return Response.json({ success: false, message: "ID diperlukan" }, { status: 400 })

        await connection.execute('DELETE FROM users WHERE id = ?', [id])
        return Response.json({ success: true, message: "User berhasil dihapus" }, { status: 200 })
    } catch (error: any) {
        return Response.json({ success: false, message: "Gagal menghapus user (mungkin ada relasi data)" }, { status: 500 })
    }
}

