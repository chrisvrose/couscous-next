import assert from 'assert';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { NextApiRequest } from 'next';
import * as FileUtils from '../FileUtils';
import { getBucket } from '../mongo/database';
// import path from 'path';
import ResponseError from '../types/ResponseError';
import db from './db';
import * as Folder from './Folder';

/**
 * Get file id
 * @param pathstr
 */
export async function getFile(pathstr: string) {
    const parentPath = FileUtils.folderPath(pathstr);
    const parentfoid = await Folder.getFolderID(parentPath);
    const fileName = FileUtils.fileName(pathstr);
    // console.log(fileName);
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

export async function getReadOperationFromBody({ body }: NextApiRequest) {
    try {
        assert(body, 'Expected body');
        assert(typeof body.fd === 'number', 'Expected file descriptor');
        assert(typeof body.length === 'number', 'Expected length');
        assert(typeof body.position === 'number', 'Expected number');
        assert(body.length >= 0, 'Expected positive length');
        assert(body.position >= 0, 'Expected positive position');
        return {
            fd: parseInt(body.fd),
            length: parseInt(body.length),
            position: parseInt(body.position),
        };
    } catch (e) {
        throw new ResponseError(e.message ?? 'Malformed request', 400);
    }
}

export async function getOpenOperationFromBody({ body }: NextApiRequest) {
    try {
        assert(body, 'Expected body');
        assert(typeof body.path === 'string', 'Expected path');
        assert(typeof body.operation === 'number', 'Expected operation');

        return {
            path: body.path,
            operation: body.operation & 3,
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

/**
 * Blanket function to wanted operations on file only possible if matching permissions
 * @param fid
 * @param uid
 * @param flags read write as from user 0 - read, 1 - write
 */
export async function assertFidPerms(fid: number, uid: number, flags: number) {
    const [rows] = await db.execute<RowDataPacket[]>(
        'select fid,name,permissions,file.uid ,count(g.uid)>0 as isInGroup,file.uid=? as isOwner from file left join (select * from groupmember  where groupmember.uid=?) as g on file.gid=g.gid where fid=? group by fid;',
        [uid, uid, fid]
    );
    const fileContent = rows[0];

    /*
     * Now check the permissions against all the data the db has given us.
     *
     * Explanation: the permissions is in the form of an integer with rwx rwx rwx
     * Arranged by user(rwx), group(rwx) and everybody(rwx) else
     * eg. 0b110_100_100 is 0o644 is rw- r-- r-- , ie read write for owner
     * rw- r-- r--, ie read write for owner, read only for everyone
     *
     * idea - match the operations flag, which is in the form wr
     *
     */
    let offset = 1;
    if (fileContent.isInGroup) {
        offset = 4;
    }
    if (fileContent.isOwner) {
        offset = 7;
    }
    //convert this flag into a bitwise rw form -
    const rwFlag = FileUtils.toFlags(flags);
    console.log('Comparing', fileContent.permissions, rwFlag);
    const allowed = ((fileContent.permissions >> offset) & rwFlag) === rwFlag;

    if (!allowed) {
        throw new ResponseError('Permission mismatch', 401);
    }
}

/**
 * Ensures the operation agrees with what was claimed by user opening the fd
 * @param fd file descriptor
 * @param wantedOperation
 */
export async function assertFDPerms(
    fd: number,
    wantedOperation: 0 | 1 | 2 | 3
) {
    const [rows] = await db.execute<RowDataPacket[]>(
        'select operation from usersession where sessionid=?',
        [fd]
    );
    if (rows.length === 0) {
        throw new ResponseError('No file found', 404);
    }
    const { operation } = rows[0] as { operation: number };
    if (operation < 2) {
        if (operation != wantedOperation) {
            throw new ResponseError('Unintended fd break', 401);
        }
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
    await assertFidPerms(fid, uid, flags);
    console.log(fid);
    const [res] = await db.execute<ResultSetHeader>(
        'INSERT INTO usersession(uid,operation,fid) values(?,?,?)',
        [uid, flags, fid]
    );

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

export async function read(
    fd: number,
    uid: number,
    length: number,
    position: number
) {
    //ensure we are making sure the fd is valid
    await assertFDPerms(fd, 0);
    //get fs results
    const [res] = await db.execute<RowDataPacket[]>(
        'select file.fid,mongofileuid from file join usersession on usersession.fid=file.fid where sessionid=?',
        [fd]
    );
    if (res.length < 1) {
        throw new ResponseError('did not find file', 404);
    }
    const file = res[0] as { fid: number; mongofileuid?: string };
    await assertFidPerms(file.fid, uid, 0);
    console.log(file.mongofileuid);

    if (file.mongofileuid !== null) {
        const bucket = await getBucket();

        //find file and get size first
        let size: number;
        const [res] = await bucket
            .find({ filename: file.mongofileuid }, { sort: { uploadDate: -1 } })
            .toArray();
        if (res) size = res.length;
        else throw new ResponseError('could not get mongo file', 404);

        // console.log(bucket.find({ name: file.mongofileuid }));
        return new Promise<Buffer>((res, rej) => {
            let data: Buffer = Buffer.from([]);
            // store this and ensure asking for last bit
            const lastChunkPos = size - 1;
            const computedEnd = position + length;

            bucket
                .openDownloadStreamByName(file.mongofileuid, {
                    start: position,
                    end:
                        lastChunkPos < computedEnd ? lastChunkPos : computedEnd,
                    revision: -1,
                })
                .on('data', d => {
                    // data.push(d);
                    // data.
                    data = Buffer.concat([data, d]);
                })
                .on('error', e => {
                    // console.log(e);
                    rej(new ResponseError('Error reading file', 500));
                })
                .on('end', () => {
                    res(data);
                });
        });
    } else {
        return Buffer.from([]);
    }
}
