import assert from 'assert';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { NextApiRequest } from 'next';
import * as FileUtils from '../FileUtils';
// import path from 'path';
import ResponseError from '../types/ResponseError';
import db from './db';
import * as Folder from './Folder';

export async function getFile(pathstr: string) {
    const parentPath = FileUtils.folderPath(pathstr);
    const parentfoid = await Folder.getFolderID(parentPath);
    const fileName = FileUtils.fileName(pathstr);
    console.log(fileName);
    let rows: RowDataPacket[];
    if (parentfoid === null)
        rows = (
            await db.execute<RowDataPacket[]>(
                'select name,fid from file where parentfoid is null',
                [parentfoid]
            )
        )[0];
    else
        rows = (
            await db.execute<RowDataPacket[]>(
                'select name,fid from file where parentfoid=?',
                [parentfoid]
            )
        )[0];
    console.log(rows, parentfoid);
    // TODO
    let ans = rows.filter(e => e.name == fileName) as {
        name: string;
        fid: number;
    }[];

    // this is a warning test
    if (ans.length > 1) {
        console.warn(`W>Multiple files under foid ${parentfoid}`);
    }

    if (ans.length === 0) throw new ResponseError('Could not find file', 404);
    return ans[0].fid;
}

export async function getPathOperationFromBody({ body }: NextApiRequest) {
    try {
        assert(body, 'Expected body');
        assert(typeof body.path === 'string', 'Expected path');
        assert(typeof body.operation === 'number', 'Expected operation');
        return {
            path: body.path,
            operation: body.operation,
        };
    } catch (e) {
        throw new ResponseError(e.message ?? 'Malformed request', 400);
    }
}

export async function getPathFdFromBody({ body }: NextApiRequest) {
    try {
        assert(body, 'Expected body');
        assert(typeof body.path === 'string', 'Expected path');
        assert(typeof body.fd === 'number', 'Expected file descriptor');
        return {
            path: body.path,
            fd: body.fd,
        };
    } catch (e) {
        throw new ResponseError(e.message ?? 'Malformed request', 400);
    }
}

// TODO implement checks
/**
 * Open a file, creating a fd
 * @param pathstr Path string
 * @param uid User id
 * @param flags operation being done
 * @returns new fd
 */
export async function open(pathstr: string, uid: number, flags: number) {
    const fid = await getFile(pathstr);
    console.log(fid);
    const [res] = await db.execute<ResultSetHeader>(
        'INSERT INTO usersession(uid,operation,fid) values(?,?,?)',
        [uid, flags, fid]
    );
    console.log(res.insertId);
    return res.insertId;
}

/**
 * Release a file descriptor
 * @param pathstr Path string
 * @param uid User id
 * @param fd file descriptor
 */
export async function release(pathstr: string, uid: number, fd: number) {
    const [res] = await db.execute<ResultSetHeader>(
        'DELETE from usersession where uid=? and sessionid=?',
        [uid, fd]
    );
    return res.affectedRows;
}
