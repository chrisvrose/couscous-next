// Manage Auth Tokens
import { assert } from 'console';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { GenerateJWToken } from '../MiscAuth';
import db from './db';

/**
 * Add auth token
 * @param uid Auth uid
 * @param role isAdmin
 */
export async function add(uid: number) {
    try {
        const atoken = await GenerateJWToken({ uid }); // generateAuthToken({uid});
        const [rows] = await db.query<ResultSetHeader>(
            'INSERT INTO atokens values(?,?);',
            [uid, atoken]
        );
        assert(rows.affectedRows === 1, 'Internal atoken state error');
        return atoken;
    } catch (e) {
        return null;
    }
}

/**
 * Validate if jwt exists for a given user
 * @param uid User id from JWT
 * @param atoken AuthToken string
 */
export async function getExists(uid: number, atoken: string) {
    try {
        const [rows] = await db.query<RowDataPacket[]>(
            'SELECT COUNT(*) as count from atokens where uid=? and atoken=?;',
            [uid, atoken]
        );
        const { count } = rows[0];
        return count === 1;
    } catch (e) {
        console.log('E', db, e);
        // console.log(e);
        return false;
    }
}

export async function remove(uid: number, atoken: string) {
    try {
        const [rows] = await db.query<ResultSetHeader>(
            'DELETE FROM atokens WHERE uid=? and atoken=?',
            [uid, atoken]
        );
        return rows.affectedRows >= 0;
    } catch (e) {
        return false;
    }
}

export async function removeAll(uid: number) {
    try {
        const [rows] = await db.query<ResultSetHeader>(
            'DELETE FROM atokens WHERE uid=?',
            [uid]
        );
        return rows.affectedRows >= 0;
    } catch (e) {
        return false;
    }
}

export async function isAdmin(atoken: string) {
    try {
        const [rows] = await db.query<RowDataPacket[]>(
            'select uid,role from atokens natural join users where atoken=?;',
            [atoken]
        );
        return { uid: rows[0].uid, role: rows[0].role > 0 };
    } catch (e) {
        //this 'e' is to be able to inspect it while debugging
        return null;
    }
}
