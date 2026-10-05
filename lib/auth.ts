import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

export async function checkAuthRole(allowedRoles?: ('admin' | 'guru' | 'siswa')[] | ('admin' | 'guru' | 'siswa')) {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
        return { authorized: false, message: "Akses ditolak, Anda belum login", status: 401 }
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any
        
        if (allowedRoles) {
            const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
            if (!rolesArray.includes(decoded.role)) {
                return { 
                    authorized: false, 
                    message: `Akses ditolak, API ini khusus untuk role: ${rolesArray.join(' / ')}!`, 
                    status: 403 
                }
            }
        }
        
        return { authorized: true, user: decoded }
    } catch (error) {
        return { authorized: false, message: "Sesi tidak valid atau kadaluarsa", status: 401 }
    }
}
