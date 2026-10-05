import connection from "@/lib/db";
import bcrypt from "bcrypt"



export async function GET(){
    try{

    const [rows] = await connection.execute('SELECT * FROM users')
    return Response.json({
        message:"berhasil ambil data",
        success: true,
        data:rows
    },{status:200})
    }catch(error: unknown){
        console.error(error);
        return Response.json({
            message:"terjadi kesalahan server (Gagal mengambil data)",
            success:false
        },{status : 500})
    }

}


