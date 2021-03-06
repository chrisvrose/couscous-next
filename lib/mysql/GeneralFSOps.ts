import assert from 'assert';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { NextApiRequest } from 'next';
import * as FileUtils from '../FileUtils';
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

export function getUIDGIDFromBody({ body }: NextApiRequest) {
    try {
        assert(body, 'Expected body');
        assert(typeof body.path === 'string', 'Expected path');
        assert(typeof body?.uid === 'number', 'expected uid');
        assert(typeof body?.gid === 'number', 'expected uid');

        return {
            path: body.path as string,
            uid: parseInt(body.uid),
            gid: parseInt(body.gid),
        };
    } catch (e) {
        throw new ResponseError(e.message ?? 'Malformed request', 400);
    }
}

export function getSrcDestFromBody({ body }: NextApiRequest) {
    try {
        assert(body, 'Expected body');
        assert(typeof body?.src === 'string', 'Expected src');
        assert(typeof body?.dest === 'string', 'Expected dest');
        // assert(body);

        /**
         * trim permissions every time to prevent sending random perms
         */
        return {
            src: body.src as string,
            dest: body.dest as string,
        };
    } catch (e) {
        throw new ResponseError(e.message ?? 'Malformed request', 400);
    }
}

export function getTimesFromBody({ body }: NextApiRequest) {
    try {
        assert(body, 'Expected body');
        assert(typeof body.path === 'string', 'Expected string');
        assert(typeof body.atime === 'number', 'Expected atime');
        assert(typeof body.mtime === 'number', 'Expected mtime');
        return {
            path: body.path as string,
            atime: new Date(body.atime),
            mtime: new Date(body.mtime),
        };
    } catch (e) {
        throw new ResponseError(e.message ?? 'Malformed request', 400);
    }
}

export async function getattr(pathstr: string): Promise<getAttrResult> {
    try {
        const id = await File.getFile(pathstr);
        const [[desc]] = await db.query<RowDataPacket[]>(
            'select name,permissions,uid,gid,atime,ctime,mtime,"file" as type,mongofileuid from file where fid=?',
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
                    const [[desc]] = await db.query<RowDataPacket[]>(
                        'select name,permissions,uid,gid,atime,ctime,mtime,"folder" as type from folder where foid=?',
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

export async function assertUnique(itemname: string, parentfoid: number) {
    try {
        //morph function call based on if parentfoid is null
        const [rows] = await db.query<RowDataPacket[]>(
            parentfoid !== null
                ? 'select name from folder where parentfoid=? union select name from file where parentfoid=?'
                : 'select name from folder where parentfoid is null union select name from file where parentfoid is null',
            parentfoid === null ? undefined : [parentfoid, parentfoid]
        );
        const itemnames = rows.map(e => e.name) as string[];
        assert(!itemnames.includes(itemname));
        return true;
    } catch (e) {
        throw new ResponseError('existing file/folder', 400);
    }
}

/**
 * Get one item or none
 * @param itemname item name
 * @param parentfoid parent folder id
 */
export async function getOneOrNone(itemname: string, parentfoid: number) {
    try {
        //morph function call based on if parentfoid is null
        const [rows] = await db.query<RowDataPacket[]>(
            parentfoid !== null
                ? 'select name,"folder" as type  from folder where parentfoid=? union select name,"file" as type from file where parentfoid=?'
                : 'select name,"folder" as type from folder where parentfoid is null union select name,"file" as type from file where parentfoid is null',
            parentfoid === null ? undefined : [parentfoid, parentfoid]
        );
        const itemnames = rows.map(e => {
            return { name: e.name, type: e.type };
        });
        // assert(!itemnames.includes(itemname));
        return itemnames.find(e => e.name === itemname);
    } catch (e) {
        throw new ResponseError('existing file/folder', 400);
    }
}

export async function chmod(pathstr: string, newPerms: number, uid: number) {
    try {
        const id = await File.getFile(pathstr);
        //update only if user owns orz` belongs to group
        const [result] = await db.query<ResultSetHeader>(
            'update file set permissions=? where fid=? and (uid=? or gid in (select gid from groupmember where uid=?))',
            [newPerms, id, uid, uid]
        );
        // console.log('I>', result);
        return result.affectedRows;
        //desc[0]
    } catch (e) {
        if (e instanceof ResponseError && e.statusCode === 404) {
            //this is an error trying to get file, lets try getting a folder
            try {
                const id = await Folder.getFolderID(pathstr);
                if (id) {
                    const [result] = await db.query<ResultSetHeader>(
                        'update folder set permissions=? where foid=? and (uid=? or gid in (select gid from groupmember where uid=?))',
                        [newPerms, id, uid, uid]
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

export async function chown(
    pathstr: string,
    newuid: number,
    newgid: number,
    uid: number
) {
    try {
        const id = await File.getFile(pathstr);
        //update only if user owns orz` belongs to group
        const [result] = await db.query<ResultSetHeader>(
            'update file set uid=?,gid=? where fid=? and (uid=? or gid in (select gid from groupmember where uid=?))',
            [newuid, newgid, id, uid, uid]
        );
        // console.log('I>', result);
        return result.affectedRows;
        //desc[0]
    } catch (e) {
        if (e instanceof ResponseError && e.statusCode === 404) {
            //this is an error trying to get file, lets try getting a folder
            try {
                const id = await Folder.getFolderID(pathstr);
                if (id) {
                    const [result] = await db.query<ResultSetHeader>(
                        'update folder set uid=?,gid=? where foid=? and (uid=? or gid in (select gid from groupmember where uid=?))',
                        [newuid, newgid, id, uid, uid]
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

export async function rename(src: string, dest: string, uid: number) {
    try {
        const id = await File.getFile(src);
        //update only if user owns orz` belongs to group
        // const newparent = await FileUtils
        const parentPath = FileUtils.folderPath(dest);
        const newName = FileUtils.fileName(dest);
        const parentfoid = await Folder.getFolderID(parentPath);
        await assertUnique(newName, parentfoid);

        const [result] = await db.query<ResultSetHeader>(
            'update file set parentfoid=?,name=? where fid=? and (uid=? or gid in (select gid from groupmember where uid=?))',
            [parentfoid, newName, id, uid, uid]
        );

        // console.log('I>', result);
        return result.affectedRows;
        //desc[0]
    } catch (e) {
        if (e instanceof ResponseError && e.statusCode === 404) {
            //this is an error trying to get file, lets try getting a folder
            try {
                const id = await Folder.getFolderID(src);

                const newName = FileUtils.fileName(dest);
                const parentPath = FileUtils.folderPath(dest);
                const parentfoid = await Folder.getFolderID(parentPath);
                await assertUnique(newName, parentfoid);
                if (id) {
                    const [result] = await db.query<ResultSetHeader>(
                        'update folder set parentfoid=?,name=? where foid=? and (uid=? or gid in (select gid from groupmember where uid=?))',
                        [parentfoid, newName, id, uid, uid]
                    );

                    return result.affectedRows;
                } else {
                    // cannot rename the folder
                    throw new ResponseError('cannot allow rename', 401);
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
 * Touch a file
 * @param pathstr Path string
 * @param mtime modified time
 * @param atime accessed time
 * @param uid uid
 */
export async function utime(
    pathstr: string,
    mtime: Date,
    atime: Date,
    uid: number
) {
    try {
        const id = await File.getFile(pathstr);
        //update only if user owns orz` belongs to group
        await File.assertFidPerms(id, uid, 0);
        const [result] = await db.query<ResultSetHeader>(
            'update file set mtime=?,atime=? where fid=?',
            [mtime, atime, id]
        );
        // console.log('I>', result);
        return result.affectedRows;
        //desc[0]
    } catch (e) {
        if (e instanceof ResponseError && e.statusCode === 404) {
            //this is an error trying to get file, lets try getting a folder
            try {
                const id = await Folder.getFolderID(pathstr);
                if (id) {
                    const [result] = await db.query<ResultSetHeader>(
                        'update folder set mtime=?,atime=? where foid=?',
                        [mtime, atime, id]
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
