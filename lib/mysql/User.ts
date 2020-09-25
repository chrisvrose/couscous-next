import bcrypt from 'bcryptjs';
import { assert } from 'console';
import { RowDataPacket } from 'mysql2';
import db from './db';

export interface authPassResult {
    uid: number;
    role: boolean;
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
