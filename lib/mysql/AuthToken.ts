import { assert } from 'console';
import { ResultSetHeader } from 'mysql2';
import { GenerateJWToken } from '../authenticate';
import db from './db';

/**
 * Manages refresh tokens
 */
export default {
    /**
     * Add an authtoken to user
     * @param uid UID to add
     */
    async add(uid: number) {
        try {
            const atoken = await GenerateJWToken({ uid }); // generateAuthToken({uid});
            const [rows, field] = <[ResultSetHeader, undefined]>(
                await db.execute('INSERT INTO atokens values(?,?);', [
                    uid,
                    atoken,
                ])
            );
            assert(rows.affectedRows === 1, 'Internal atoken state error');
            return atoken;
        } catch (e) {
            return null;
        }
    },

    async get(uid: number, atoken: string) {
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
    },
};
