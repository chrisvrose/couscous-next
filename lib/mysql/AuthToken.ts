import { assert } from "console";
import { ResultSetHeader } from "mysql2";
import { GenerateJWToken } from "../authenticate";
import db from "./db";
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
                await db.execute("INSERT INTO atokens values(?,?);", [
                    uid,
                    atoken,
                ])
            );
            assert(rows.affectedRows === 1, "Internal atoken state error");
            return atoken;
        } catch (e) {
            return null;
        }
    },
};
