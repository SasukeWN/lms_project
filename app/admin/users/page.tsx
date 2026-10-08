"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import AdminNavbar from "@/app/component_admin/navbar/Navbar"

interface User {
    id: number
    username: string
    email: string
    role: string
    status: string
    created_at: string
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    
    // Form state
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editId, setEditId] = useState<number | null>(null)
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [role, setRole] = useState("siswa")
    const [status, setStatus] = useState("approved")

    const [isSubmitting, setIsSubmitting] = useState(false)

    // Filter
    const [filterRole, setFilterRole] = useState("")

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const url = filterRole ? `/action/admin/users?role=${filterRole}` : '/action/admin/users'
            const res = await axios.get(url)
            setUsers(res.data.data)
        } catch (error) {
            console.error("Gagal mengambil data user", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [filterRole])

    const handleOpenAdd = () => {
        setEditId(null)
        setUsername("")
        setEmail("")
        setPassword("")
        setRole(filterRole || "siswa")
        setStatus("approved")
        setIsFormOpen(true)
    }

    const handleOpenEdit = (user: User) => {
        setEditId(user.id)
        setUsername(user.username)
        setEmail(user.email)
        setPassword("") 
        setRole(user.role)
        setStatus(user.status || "pending")
        setIsFormOpen(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleStatusChange = async (user: User, newStatus: string) => {
        if (!window.confirm(`Yakin ingin mengubah status user ini menjadi ${newStatus}?`)) return
        try {
            await axios.put('/action/admin/users', {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                status: newStatus
            })
            fetchUsers()
        } catch (error: any) {
            alert(error.response?.data?.message || "Gagal mengupdate status")
        }
    }

    const handleDelete = async (id: number) => {
        if (!window.confirm("Yakin ingin menghapus user ini?")) return
        try {
            await axios.delete(`/action/admin/users?id=${id}`)
            fetchUsers()
        } catch (error: any) {
            alert(error.response?.data?.message || "Gagal menghapus")
        }
    }

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            if (editId) {
                await axios.put('/action/admin/users', {
                    id: editId,
                    username,
                    email,
                    role,
                    status
                })
                alert("User berhasil diupdate!")
            } else {
                await axios.post('/action/admin/users', { 
                    username, 
                    email, 
                    password,
                    role 
                })
                alert("User berhasil ditambahkan!")
            }

            setIsFormOpen(false)
            fetchUsers()
        } catch (error: any) {
            alert(error.response?.data?.message || "Terjadi kesalahan")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="h-[100dvh] bg-slate-50 flex flex-col md:flex-row overflow-hidden">
            <AdminNavbar />

            <div className="flex-1 flex flex-col w-full overflow-hidden">
                <header className="hidden md:flex h-16 bg-white border-b border-slate-200 items-center justify-between px-8">
                    <h1 className="text-xl font-bold text-slate-800">Manajemen User</h1>
                    <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold border-2 border-white shadow-sm">
                            A
                        </div>
                    </div>
                </header>

                <main className="p-4 md:p-8 flex-1 overflow-y-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">Daftar Pengguna</h2>
                            <p className="text-sm text-slate-500">Kelola admin, guru, dan siswa dalam sistem</p>
                        </div>
                        <button 
                            onClick={isFormOpen ? () => setIsFormOpen(false) : handleOpenAdd}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors shadow-sm w-full md:w-auto ${
                                isFormOpen ? "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50" : "bg-slate-900 text-white hover:bg-slate-800"
                            }`}
                        >
                            {isFormOpen ? "Batal" : "+ Tambah User"}
                        </button>
                    </div>

                    {isFormOpen && (
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6 animate-in slide-in-from-top-4 fade-in duration-200">
                            <h3 className="font-bold text-slate-800 mb-4">{editId ? "Edit Pengguna" : "Buat Pengguna Baru"}</h3>
                            <form onSubmit={handleFormSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Lengkap</label>
                                        <input
                                            type="text"
                                            required
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none"
                                            placeholder="Contoh: Budi Santoso"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none"
                                            placeholder="Contoh: budi@sekolah.com"
                                        />
                                    </div>
                                    {!editId && (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                                            <input
                                                type="password"
                                                required={!editId}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none"
                                                placeholder="Password minimal 6 karakter"
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Peran (Role)</label>
                                        <select
                                            required
                                            value={role}
                                            onChange={(e) => setRole(e.target.value)}
                                            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none"
                                        >
                                            <option value="siswa">Siswa</option>
                                            <option value="guru">Guru</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                                        <select
                                            required
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="approved">Approved</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end pt-2">
                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting}
                                        className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                    >
                                        {isSubmitting ? "Menyimpan..." : (editId ? "Update User" : "Simpan User")}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Filter Bar */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex items-center gap-4">
                        <span className="text-sm font-medium text-slate-600 whitespace-nowrap">Filter Role:</span>
                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-slate-900"
                        >
                            <option value="">Semua Pengguna</option>
                            <option value="admin">Admin</option>
                            <option value="guru">Guru</option>
                            <option value="siswa">Siswa</option>
                        </select>
                    </div>

                    {loading ? (
                        <div className="text-center text-slate-500 py-10 animate-pulse">Memuat data...</div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed">
                            <span className="text-4xl mb-4 block">👥</span>
                            <h3 className="text-lg font-bold text-slate-700">Tidak ada User</h3>
                            <p className="text-slate-500 text-sm mt-1">Belum ada pengguna terdaftar dengan peran ini.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold">Nama & Email</th>
                                            <th className="px-6 py-4 font-semibold">Role</th>
                                            <th className="px-6 py-4 font-semibold">Status</th>
                                            <th className="px-6 py-4 font-semibold">Tanggal Daftar</th>
                                            <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {users.map((user) => (
                                            <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
                                                            {user.username.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-slate-900">{user.username}</div>
                                                            <div className="text-slate-500">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize
                                                        ${user.role === 'admin' ? 'bg-red-50 text-red-700' : 
                                                          user.role === 'guru' ? 'bg-amber-50 text-amber-700' : 
                                                          'bg-emerald-50 text-emerald-700'}`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize
                                                        ${user.status === 'approved' ? 'bg-blue-50 text-blue-700' : 
                                                          user.status === 'rejected' ? 'bg-gray-100 text-gray-600' : 
                                                          'bg-orange-50 text-orange-600 border border-orange-200'}`}>
                                                        {user.status || 'pending'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500">
                                                    {new Date(user.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {user.status === 'pending' && (
                                                            <>
                                                                <button 
                                                                    onClick={() => handleStatusChange(user, 'approved')}
                                                                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors font-bold text-xs"
                                                                    title="Approve"
                                                                >
                                                                    ✅ Approve
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleStatusChange(user, 'rejected')}
                                                                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors font-bold text-xs"
                                                                    title="Reject"
                                                                >
                                                                    ❌ Reject
                                                                </button>
                                                            </>
                                                        )}
                                                        <button 
                                                            onClick={() => handleOpenEdit(user)}
                                                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(user.id)}
                                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Hapus"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}

