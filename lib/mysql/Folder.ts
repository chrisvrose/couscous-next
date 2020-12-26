import assert from 'assert';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { NextApiRequest } from 'next';
import * as FileUtils from '../FileUtils';
import ResponseError from '../types/ResponseError';
import db from './db';
import { assertUnique } from './GeneralFSOps';

export async function getPathFromBody({ body }: NextApiRequest) {
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

/**
 * opens directory, dummy
 */
export async function openDir(path: string) {
    return 42;
}

/**
 * Traverse folders and get foid of folder required
 * @param pathstr folder location
 * @throws ResponseError if not found
 */
export async function getFolderID(pathstr: string): Promise<number> {
    const loc = await FileUtils.splitPath(pathstr);
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
                    await db.query<RowDataPacket[]>(
                        'select name,foid from folder where parentfoid is null'
                    )
                )[0] as { name: string; foid: number }[];
            } else {
                res = (
                    await db.query<RowDataPacket[]>(
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
 * Get contents of a folder path - only names
 * @param pathstr path string of folder
 */
export async function getContents(pathstr: string) {
    let foid: number = await getFolderID(pathstr);

    let res: RowDataPacket[];
    if (foid === null) {
        res = (
            await db.query<RowDataPacket[]>(
                'select name from folder where parentfoid is null UNION select name from file where parentfoid is null;'
            )
        )[0];
    } else {
        res = (
            await db.query<RowDataPacket[]>(
                'select name from folder where parentfoid=? UNION select name from file where parentfoid=?;',
                [foid, foid]
            )
        )[0];
    }
    // console.log('result:', foid, res);
    return res.map(e => e.name) as string[];
}

export async function create(pathStr: string, uid: number, mode: number) {
    const parentPath = FileUtils.folderPath(pathStr);
    const parentfoid = await getFolderID(parentPath);
    let gidcalc: number;
    if (parentfoid === null) {
        gidcalc = 1; //the first group ever created
    } else {
        const [rows] = await db.query('select gid from folder where foid=?', [
            parentfoid,
        ]);
        gidcalc = rows[0].gid;
    }
    //now to assert uniqueness
    const itemname = FileUtils.fileName(pathStr);
    await assertUnique(itemname, parentfoid);

    // now to create an entry
    const [rows] = await db.query<ResultSetHeader>(
        'insert into folder(name,uid,gid,permissions,parentfoid) values(?,?,?,?,?)',
        [itemname, uid, gidcalc, mode, parentfoid]
    );
    return rows.insertId;
}

export async function remove(pathStr: string) {
    // const parentPath = FileUtils.folderPath(pathStr);
    const mypath = FileUtils.toRoot(pathStr);
    const myfoid = await getFolderID(mypath);

    // check that we shall not orphan any files and folders, and then proceed to delete them
    const [rows] = await db.query<ResultSetHeader>(
        'delete from folder where foid=? and (select count(foid) from (SELECT * FROM folder) AS X where parentfoid=?)<1 and (select count(fid) from file where parentfoid=?)<1;',
        [myfoid, myfoid, myfoid]
    );
    return rows.affectedRows;
}
