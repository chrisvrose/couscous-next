import assert from 'assert';
import { RowDataPacket } from 'mysql2';
import { NextApiRequest } from 'next';
import path from 'path';
import ResponseError from '../types/ResponseError';
import db from './db';

export async function getFromBody({ body }: NextApiRequest) {
    try {
        assert(body, 'Expected body');
        assert(typeof body.path === 'string', 'Expected path');
        // assert(body);

        return {
            path: body.path,
        };
    } catch (e) {
        throw new ResponseError(e.message ?? 'Malformed request', 400);
    }
}

export async function toFlags(flags) {
    flags = flags & 3;
    if (flags === 0) return 'r';
    if (flags === 1) return 'w';
    return 'r+';
}

export async function splitPath(pathstr: string) {
    return path
        .normalize(pathstr)
        .split('/')
        .filter(e => e);
}

export async function openDir(path: string) {
    const result = await db.execute<RowDataPacket[]>(
        'SELECT * from file,employee'
    );
    return;
}

export async function getContents(pathstr: string) {
    const loc = await splitPath(pathstr);
    console.log('Requesting Folder:', loc);
    let id: number = null;
    if (loc.length === 0 || (loc.length == 1 && loc[0] == '.')) {
        const [res] = await db.execute<RowDataPacket[]>(
            'select name from folder where parentfoid is null UNION select name from file where parentfoid is null;'
        );
        return res.map(e => e.name);
    } else {
        // TODOC
        let res: { name: string; foid: number }[];
        for (let str of loc) {
            console.log('searching:', str);
            console.log('id:', id);
            if (id === null) {
                res = (
                    await db.execute<RowDataPacket[]>(
                        'select name,foid from folder where parentfoid is null'
                    )
                )[0] as { name: string; foid: number }[];

                // console.log('response1:', res);
                let ans = res.find(element => element.name === str)?.foid;
                if (ans) {
                    id = ans;
                } else {
                    throw new ResponseError('Could not find', 404);
                }
                // .map(e => e.name);
            } else {
                res = (
                    await db.execute<RowDataPacket[]>(
                        'select name,foid from folder where parentfoid=?',
                        [id]
                    )
                )[0] as { name: string; foid: number }[];
                // console.log(res);

                let ans = res.find(element => element.name === str)?.foid;
                if (ans) {
                    id = ans;
                } else {
                    throw new ResponseError('Could not find', 404);
                }
                //id
            }

            console.log('final foid', id);

            return (
                await db.execute<RowDataPacket[]>(
                    'select name from folder where parentfoid=? UNION select name from file where parentfoid=?;',
                    [id, id]
                )
            )[0].map(e => e.name);
        }
    }
}
