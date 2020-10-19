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
        const [rows, field] = <[ResultSetHeader, undefined]>(
            await db.execute('INSERT INTO atokens values(?,?);', [uid, atoken])
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
        const [
            rows,
            field,
        ] = await db.execute(
            'SELECT COUNT(*) as count from atokens where uid=? and atoken=?;',
            [uid, atoken]
        );
        const { count } = rows[0];
        return count === 1;
    } catch (e) {
        return false;
    }
}

export async function remove(uid: number, atoken: string) {
    try {
        const [
            rows,
            field,
        ] = await db.execute('DELETE FROM atokens WHERE uid=? and atoken=?', [
            uid,
            atoken,
        ]);
        const result = <ResultSetHeader>rows;
        return result?.affectedRows >= 0;
    } catch (e) {
        return false;
    }
}

export async function removeAll(uid: number) {
    try {
        const [
            rows,
            field,
        ] = await db.execute('DELETE FROM atokens WHERE uid=?', [uid]);
        const result = <ResultSetHeader>rows;
        return result?.affectedRows >= 0;
    } catch (e) {
        return false;
    }
}

export async function isAdmin(atoken: string) {
    try {
        const [
            rows,
            field,
        ] = await db.execute(
            'select uid,role from atokens natural join users where atoken=?;',
            [atoken]
        );
        const result = <RowDataPacket[]>rows;
        console.log(result);
        return { uid: result[0].uid, role: result[0].role > 0 };
    } catch (e) {
        console.error('e', e);
        return null;
    }
}
