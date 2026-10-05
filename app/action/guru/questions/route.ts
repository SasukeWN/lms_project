import { checkAuthRole } from "@/lib/auth"
import connection from "@/lib/db"

// =================================================================
// 1. GET: Guru melihat daftar soal (bisa difilter per quiz_id)
// URL: GET /action/guru/questions?quiz_id=1
// =================================================================
export async function GET(request: Request) {
    const auth = await checkAuthRole(['guru', 'admin'])
    if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status! })

    try {
        const { searchParams } = new URL(request.url)
        const quiz_id = searchParams.get('quiz_id')

        let query = 'SELECT * FROM questions'
        let params: any[] = []

        if (quiz_id) {
            query += ' WHERE quiz_id = ?'
            params.push(quiz_id)
        }

        const [questions] = await connection.execute(query, params)

        return Response.json({ success: true, data: questions }, { status: 200 })
    } catch (error: any) {
        console.error("Error GET Guru Questions:", error)
        return Response.json({ success: false, message: "Gagal mengambil data soal" }, { status: 500 })
    }
}

// =================================================================
// 2. POST: Guru membuat soal pilihan ganda baru untuk kuis
// URL: POST /action/guru/questions
// =================================================================
export async function POST(request: Request) {
    const auth = await checkAuthRole(['guru', 'admin'])
    if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status! })

    try {
        const body = await request.json()
        const { 
            quiz_id, 
            soal, 
            opsi_a, 
            opsi_b, 
            opsi_c, 
            opsi_d, 
            kunci_jawaban, 
            pembahasan 
        } = body

        if (!quiz_id || !soal || !opsi_a || !opsi_b || !opsi_c || !opsi_d || !kunci_jawaban) {
            return Response.json({ 
                success: false, 
                message: "Semua kolom (quiz_id, soal, opsi_a-d, kunci_jawaban) wajib diisi" 
            }, { status: 400 })
        }

        const validKunci = ['A', 'B', 'C', 'D']
        const upperKunci = kunci_jawaban.toUpperCase()
        if (!validKunci.includes(upperKunci)) {
            return Response.json({
                success: false,
                message: "Kunci jawaban harus berupa salah satu dari: 'A', 'B', 'C', atau 'D'"
            }, { status: 400 })
        }

        const [result]: any = await connection.execute(
            `INSERT INTO questions 
            (quiz_id, soal, opsi_a, opsi_b, opsi_c, opsi_d, kunci_jawaban, pembahasan) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [quiz_id, soal, opsi_a, opsi_b, opsi_c, opsi_d, upperKunci, pembahasan || null]
        )

        return Response.json({
            success: true,
            message: "Berhasil menambahkan soal baru",
            data: {
                id: result.insertId,
                quiz_id,
                soal,
                opsi_a,
                opsi_b,
                opsi_c,
                opsi_d,
                kunci_jawaban: upperKunci,
                pembahasan: pembahasan || null
            }
        }, { status: 201 })

    } catch (error: any) {
        console.error("Error POST Guru Questions:", error)
        return Response.json({ success: false, message: "Gagal menyimpan soal ke database" }, { status: 500 })
    }
}
