import assert from 'assert';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { NextApiRequest } from 'next';
import { getBucket } from '../mongo/database';
import ResponseError from '../types/ResponseError';
import db from './db';
import * as File from './File';
import * as Folder from './Folder';

interface getAttrResult {
    name: string;
    permissions: number;
    type: 'folder' | 'file';
    size?: number;
    mongofileuid?: string;
}

export async function getattr(pathstr: string): Promise<getAttrResult> {
    try {
        const id = await File.getFile(pathstr);
        const [[desc]] = await db.execute<RowDataPacket[]>(
            'select name,permissions,"file" as type,mongofileuid from file where fid=?',
            [id]
        );
        const bucket = await getBucket();
        if (desc.mongofileuid) {
            const [res] = await bucket
                .find(
                    { filename: desc.mongofileuid },
                    { sort: { uploadDate: -1 } }
                )
                .toArray();
            if (res) desc.size = res.length;
            else throw new ResponseError('could not get mongo file', 404);
        } else {
            desc.size = 0;
        }

        return desc as getAttrResult;
        //desc[0]
    } catch (e) {
        if (e instanceof ResponseError && e.statusCode === 404) {
            //this is an error trying to get file, lets try getting a folder
            try {
                const id = await Folder.getFolderID(pathstr);
                if (id) {
                    const [[desc]] = await db.execute<RowDataPacket[]>(
                        'select name,permissions,"folder" as type from folder where foid=?',
                        [id]
                    );

                    return desc as getAttrResult;
                } else {
                    return {
                        name: '/',
                        permissions: 0o755,
                        type: 'folder',
                    };
                }
            } catch (err) {
                if (err instanceof ResponseError && err.statusCode === 404) {
                    throw new ResponseError('could not find', 404);
                }
                // propagate e
                throw err;
            }
        }
        // propagate e
        throw e;
    }
}

/**
 * extract out path and perm for body
 * @param param0 body
 */
export async function getPathPermsFromBody({ body }: NextApiRequest) {
    try {
        assert(body, 'Expected body');
        assert(typeof body.path === 'string', 'Expected path');
        assert(typeof body.permissions === 'number', 'Expected permissions');
        // assert(body);

        /**
         * trim permissions every time to prevent sending random perms
         */
        return {
            path: body.path as string,
            permissions: parseInt(body.permissions) & 0o777,
        };
    } catch (e) {
        throw new ResponseError(e.message ?? 'Malformed request', 400);
    }
}

export async function assertUnique(itemname: string, parentfoid: number) {
    try {
        //morph function call based on if parentfoid is null
        const [rows] = await db.execute<RowDataPacket[]>(
            parentfoid !== null
                ? 'select name from folder where parentfoid=? union select name from file where parentfoid=?'
                : 'select name from folder where parentfoid is null union select name from file where parentfoid is null',
            parentfoid === null ? undefined : [parentfoid, parentfoid]
        );
        const itemnames = rows.map(e => e.name) as string[];
        assert(!itemnames.includes(itemname));
    } catch (e) {
        throw new ResponseError('existing file/folder', 400);
    }
}

export async function chmod(pathstr: string, newPerms: number, uid: number) {
    try {
        const id = await File.getFile(pathstr);
        //update only if user owns orz` belongs to group
        const [result] = await db.execute<ResultSetHeader>(
            'update file set permissions=? where fid=? and (uid=? or gid in (select gid from groupmember where uid=?))',
            [newPerms, id, uid, uid]
        );
        console.log('I>', result);
        return result.affectedRows;
        //desc[0]
    } catch (e) {
        if (e instanceof ResponseError && e.statusCode === 404) {
            //this is an error trying to get file, lets try getting a folder
            try {
                const id = await Folder.getFolderID(pathstr);
                if (id) {
                    const [result] = await db.execute<ResultSetHeader>(
                        'update folder set permissions=? where foid=? and (uid=? or gid in (select gid from groupmember where uid=?))',
                        [id]
                    );

                    return result.affectedRows;
                } else {
                    // cannot chmod the folder
                    throw new ResponseError('cannot allow chmod', 401);
                }
            } catch (err) {
                if (err instanceof ResponseError && err.statusCode === 404) {
                    throw new ResponseError('could not find', 404);
                }
                // propagate e
                throw err;
            }
        }
        // propagate e
        throw e;
    }
}
