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

export interface groupID {
    gid: number;
}

export function getNameFromBody({ body }: NextApiRequest): groupName {
    assert(typeof body?.name === 'string', 'Expected group name');
    return {
        name: body.name,
    };
}

export function getGIDUIDFromBody({ body }: NextApiRequest) {
    assert(typeof body?.gid === 'number', 'Expected Group id');
    assert(typeof body?.uid === 'number', 'Expected User id');
    return {
        gid: parseInt(body.gid),
        uid: parseInt(body.uid),
    };
}

export function getGIDFromBody({ body }: NextApiRequest): groupID {
    assert(typeof body?.gid === 'number', 'Expected Group id');
    return {
        gid: parseInt(body.gid),
    };
}

export function getGIDFromReq({ query }: NextApiRequest): groupID {
    try {
        const res = parseInt(query.gid as string);
        return {
            gid: res,
        };
    } catch {
        assert(false);
    }
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

export async function kick(uid: number, gid: number) {
    try {
        const [res] = await db.execute<ResultSetHeader>(
            'delete from groupmember where uid=? and gid=?',
            [uid, gid]
        );
        return res.affectedRows;
    } catch (e) {
        throw new ResponseError();
    }
}

export async function invite(uid: number, gid: number) {
    try {
        const [res] = await db.execute<ResultSetHeader>(
            'insert ignore into groupmember values(?,?)',
            [uid, gid]
        );
        return res.affectedRows;
    } catch (e) {
        throw new ResponseError();
    }
}

export async function getMembers(gid: number) {
    try {
        const [rows] = await db.execute<RowDataPacket[]>(
            'select uid,name,email,role from groupmember natural join users where gid=?',
            [gid]
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

/**
 * add to group
 *
 * @param name group name
 */
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
