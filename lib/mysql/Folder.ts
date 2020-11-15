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

/**
 * Clean folder path, and attach to root
 * @param pathStr path
 */
export function toRoot(pathStr: string) {
    return path.join('/', path.normalize(pathStr));
}

/**
 * Split path into array of folders, cleaning the folder string requested
 * @param pathstr Path string
 */
export async function splitPath(pathstr: string) {
    const currentPath = toRoot(pathstr);
    return currentPath.split('/').filter(e => e);
}

export async function openDir(path: string) {
    const result = await db.execute<RowDataPacket[]>(
        'SELECT * from file,employee'
    );
    return;
}

/**
 * Traverse folders and get foid of folder required
 * @param pathstr folder location
 */
export async function getFolderID(pathstr: string): Promise<number> {
    const loc = await splitPath(pathstr);
    // This is asking root, don't bother
    if (loc.length === 0) {
        return null;
    } else {
        //need to traverse
        let id: number = null;
        let res: { name: string; foid: number }[];
        /*
         * iterate through all folders, ensuring they're all there and print out their foids
         */
        for (let str of loc) {
            console.log('searching:', str);
            console.log('id:', id);
            // null finds in sql cannot be with =, need 'is'
            if (id === null) {
                res = (
                    await db.execute<RowDataPacket[]>(
                        'select name,foid from folder where parentfoid is null'
                    )
                )[0] as { name: string; foid: number }[];
            } else {
                res = (
                    await db.execute<RowDataPacket[]>(
                        'select name,foid from folder where parentfoid=?',
                        [id]
                    )
                )[0] as { name: string; foid: number }[];
            }
            // find if the foldername is actually there in this hierarchy
            let ans = res.find(element => element.name === str)?.foid;
            if (ans) {
                id = ans;
            } else {
                throw new ResponseError('Could not find', 404);
            }
        }
        return id;
    }
}

/**
 * Get contents of a folder path
 * @param pathstr path string of folder
 */
export async function getContents(pathstr: string): Promise<string[]> {
    let foid: number = await getFolderID(pathstr);

    let res: RowDataPacket[];
    if (foid === null) {
        res = (
            await db.execute<RowDataPacket[]>(
                'select name from folder where parentfoid is null UNION select name from file where parentfoid is null;'
            )
        )[0];
    } else {
        res = (
            await db.execute<RowDataPacket[]>(
                'select name from folder where parentfoid=? UNION select name from file where parentfoid=?;',
                [foid, foid]
            )
        )[0];
    }
    console.log('result:', foid, res);
    return res.map(e => e.name) as string[];
}
