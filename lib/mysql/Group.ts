// import assert from 'assert';
import { RowDataPacket } from 'mysql2';
// import { NextApiRequest } from 'next';
import ResponseError from '../types/ResponseError';
import db from './db';

export async function getAll() {
    try {
        const [rows] = await db.execute<RowDataPacket[]>(
            'select * from usergroups'
        );
        return rows;
    } catch (e) {
        throw new ResponseError();
    }
}

export async function getOneMemberList(uid: number) {
    try {
        const [rows] = await db.execute<RowDataPacket[]>(
            'select gid,name from usergroups natural join groupmember where uid=?',
            [uid]
        );
        return rows;
    } catch (e) {
        throw new ResponseError();
    }
}
