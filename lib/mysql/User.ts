import bcrypt from "bcryptjs";
import { assert } from "console";
import { RowDataPacket } from "mysql2";
import db from "./db";

export default {
    /**
     * Auth against a username and password
     * @param email email address
     * @param pwd password
     */
    async authPass(email: string, pwd: string) {
        try {
            const rf = await db.execute(
                "select uid,pwd from users where email=?;",
                [email]
            );
            const rows = rf[0] as RowDataPacket[];
            assert(rows.length === 1, "could not get auth");
            const expectedPwd: string = rows[0].pwd;
            // assert(rows === 1, 'Need to have exactly 1 result back');
            if (bcrypt.compare(pwd, expectedPwd)) {
                return <number>rows[0].uid;
            } else {
                return null;
            }
        } catch (e) {
            // something died, there's no god
            return null;
        }
    },

    // async getShortAll(){
    //     const [rows,fields] =  db.execute('select uid,email from users')[0];
    // }
};
