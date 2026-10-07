import { RowDataPacket } from 'mysql2'

export interface UserRow extends RowDataPacket {
    id: number;
    username: string;
    email: string;
    password?: string;
    role: 'admin' | 'guru' | 'siswa';
    created_at: string;
}

export interface SubjectRow extends RowDataPacket {
    id: number;
    nama: string;
    deskripsi: string;
}

export interface MaterialRow extends RowDataPacket {
    id: number;
    subject_id: number;
    judul: string;
    konten: string;
    created_at: string;
}

export interface QuizRow extends RowDataPacket {
    id: number;
    subject_id: number;
    judul: string;
    created_at: string;
}

export interface QuestionRow extends RowDataPacket {
    id: number;
    quiz_id: number;
    soal: string;
    opsi_a: string;
    opsi_b: string;
    opsi_c: string;
    opsi_d: string;
    kunci_jawaban: 'A' | 'B' | 'C' | 'D';
    pembahasan: string | null;
}

export interface ScoreRow extends RowDataPacket {
    id: number;
    user_id: number;
    quiz_id: number;
    nilai: number;
    created_at: string;
}

export interface CountRow extends RowDataPacket {
    total: number;
}

export interface TopicRow extends RowDataPacket{
    id:number;
    
}
