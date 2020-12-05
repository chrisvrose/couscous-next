// import assert from 'assert';
import assert from 'assert';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { NextApiRequest } from 'next';
// import { NextApiRequest } from 'next';
import ResponseError from '../types/ResponseError';
import db from './db';

export interface groupName {
    name: string;
}

export function getNameFromBody({ body }: NextApiRequest): groupName {
    assert(typeof body?.name === 'string', 'Expected group name');
    return {
        name: body.name,
    };
}

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

export async function add(name: string) {
    try {
        const [res] = await db.execute<ResultSetHeader>(
            'insert into usergroups(name) values(?)',
            [name]
        );
        return res.insertId;
    } catch (e) {
        throw new ResponseError();
    }
}
