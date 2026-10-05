import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value

    const path = request.nextUrl.pathname

    // Jika user mengakses halaman admin, guru, atau siswa
    if (path.startsWith('/admin') || path.startsWith('/guru') || path.startsWith('/siswa')) {
        if (!token) {
            // Belum login, redirect ke halaman login
            return NextResponse.redirect(new URL('/auth/login', request.url))
        }

        try {
            // Decode payload JWT secara manual (tanpa verifikasi signature karena Edge runtime tidak mendukung jsonwebtoken)
            // Validasi signature sebenarnya tetap dilakukan di API (backend)
            const payloadBase64 = token.split('.')[1]
            if (!payloadBase64) throw new Error("Invalid token")
            
            const decodedPayload = JSON.parse(atob(payloadBase64))
            const userRole = decodedPayload.role

            // Cek akses Admin
            if (path.startsWith('/admin') && userRole !== 'admin') {
                if (userRole === 'guru') return NextResponse.redirect(new URL('/guru/dashboard_guru', request.url))
                if (userRole === 'siswa') return NextResponse.redirect(new URL('/siswa/dashboard', request.url))
                return NextResponse.redirect(new URL('/', request.url))
            }

            // Cek akses Guru
            if (path.startsWith('/guru') && userRole !== 'guru' && userRole !== 'admin') {
                if (userRole === 'siswa') return NextResponse.redirect(new URL('/siswa/dashboard', request.url))
                return NextResponse.redirect(new URL('/', request.url))
            }

            // Cek akses Siswa — hanya siswa yang boleh akses /siswa
            if (path.startsWith('/siswa') && userRole !== 'siswa') {
                if (userRole === 'guru') return NextResponse.redirect(new URL('/guru/dashboard_guru', request.url))
                if (userRole === 'admin') return NextResponse.redirect(new URL('/admin/dashboard', request.url))
                return NextResponse.redirect(new URL('/', request.url))
            }

        } catch (error) {
            // Token error/expired, redirect ke login
            request.cookies.delete('token')
            return NextResponse.redirect(new URL('/auth/login', request.url))
        }
    }

    // Jika user sudah login dan mencoba masuk ke halaman login/register
    if ((path === '/auth/login' || path === '/auth/register') && token) {
        try {
            const payloadBase64 = token.split('.')[1]
            const decodedPayload = JSON.parse(atob(payloadBase64))
            const userRole = decodedPayload.role

            if (userRole === 'admin') return NextResponse.redirect(new URL('/admin/dashboard', request.url))
            if (userRole === 'guru') return NextResponse.redirect(new URL('/guru/dashboard_guru', request.url))
            if (userRole === 'siswa') return NextResponse.redirect(new URL('/siswa/dashboard', request.url))
        } catch (e) {
            // Biarkan lanjut ke halaman login
        }
    }

    return NextResponse.next()
}

// Tentukan rute mana saja yang akan dilewati middleware ini
export const config = {
    matcher: ['/admin/:path*', '/guru/:path*', '/siswa/:path*', '/auth/login', '/auth/register'],
}

