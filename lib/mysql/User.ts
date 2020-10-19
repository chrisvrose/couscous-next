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

export interface User {
    name: string;
    email: string;
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
        const rf = await db.execute(
            'select uid,pwd,role from users where email=?;',
            [email]
        );
        const rows = rf[0] as RowDataPacket[];
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
        const [
            rows,
            fields,
        ] = await db.execute(
            'insert into users(name,email,pwd,role) values(?,?,?,?)',
            [name, email, hashedpwd, role]
        );
        const result = <ResultSetHeader>rows;
        return { uid: result.insertId };
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
