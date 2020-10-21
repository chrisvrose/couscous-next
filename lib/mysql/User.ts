import assert from 'assert';
import bcrypt from 'bcryptjs';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { NextApiRequest } from 'next';
import ResponseError from '../types/ResponseError';
import db from './db';

export interface authPassResult {
    uid: number;
    role: boolean;
}

export interface UserDetails {
    name: string;
    email: string;
}

export interface User extends UserDetails {
    pwd: string;
    role: boolean;
}
export interface UserID {
    uid: number;
}

/**
 * Auth against a username and password
 * @param email email address
 * @param pwd password
 */
export async function authPass(
    email: string,
    pwd: string
): Promise<authPassResult> {
    try {
        const [rows] = await db.execute<RowDataPacket[]>(
            'select uid,pwd,role from users where email=?;',
            [email]
        );
        // const rows = rf[0] as RowDataPacket[];
        assert(rows.length === 1, 'could not get auth');
        const expectedPwd: string = rows[0].pwd;
        // assert(rows === 1, 'Need to have exactly 1 result back');
        if (bcrypt.compare(pwd, expectedPwd)) {
            return { uid: <number>rows[0].uid, role: <boolean>rows[0].role };
        } else {
            return null;
        }
    } catch (e) {
        // something died, there's no god
        return null;
    }
}

// async getShortAll(){
//     const [rows,fields] =  db.execute('select uid,email from users')[0];
// }
export async function add({ name, email, pwd, role }: User): Promise<UserID> {
    try {
        const salt = await bcrypt.genSalt();
        const hashedpwd = await bcrypt.hash(pwd, salt);
        const [rows] = await db.execute<ResultSetHeader>(
            'insert into users(name,email,pwd,role) values(?,?,?,?)',
            [name, email, hashedpwd, role]
        );

        return { uid: rows.insertId };
    } catch (e) {
        // return null;
        throw new ResponseError('Could not add');
    }
}

export async function getFromBody({ body }: NextApiRequest): Promise<User> {
    try {
        assert(body?.name, 'Expected name');
        assert(body?.email, 'Expected email');
        assert(body?.pwd, 'Expected pwd');
        assert(body?.name, 'Expected name');
        assert(body?.role === true || body?.role === false, 'Expected role');

        return {
            name: body.name,
            email: body.email,
            pwd: body.pwd,
            role: !!body.role,
        };
    } catch (e) {
        throw new ResponseError(e.message ?? 'Malformed request', 400);
    }
}

export async function updatePwd(uid: number, newPwd: string) {
    try {
        const salt = await bcrypt.genSalt();
        const hashedPwd = await bcrypt.hash(newPwd, salt);
        const [rows] = await db.execute<ResultSetHeader>(
            'update users set pwd=? where uid=?',
            [hashedPwd, uid]
        );
        return rows.affectedRows === 1;
    } catch (e) {
        throw new ResponseError('Could not add');
    }
}

export async function getUser(uid: number) {
    try {
        const [rows] = await db.execute<RowDataPacket[]>(
            'select name,email from users where uid=?',
            [uid]
        );
        return rows[0];
    } catch (e) {
        throw new ResponseError('Could not fetch from database');
    }
}
