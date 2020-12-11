import assert from 'assert';
import multiStream from 'multistream';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { NextApiRequest } from 'next';
import { Readable } from 'stream';
import * as FileUtils from '../FileUtils';
import { getBucket } from '../mongo/database';
// import path from 'path';
import ResponseError from '../types/ResponseError';
import db from './db';
import * as Folder from './Folder';
import { assertUnique } from './GeneralFSOps';

//#region parse Inputs
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

export function getPathSizeFromBody({ body }: NextApiRequest) {
    try {
        assert(body, 'Expected body');
        assert(typeof body.path === 'string', 'Expected path');
        assert(typeof body.size === 'number', 'Expected size');
        return {
            path: body.path as string,
            size: parseInt(body.size),
        };
    } catch (e) {
        throw new ResponseError(e.message ?? 'Malformed request', 400);
    }
}

export function getWriteOperationFromBody({ body }: NextApiRequest) {
    try {
        assert(body, 'Expected body');
        assert(typeof body.fd === 'number', 'Expected fd');
        assert(typeof body.length === 'number', 'Expected length');
        assert(typeof body.position === 'number', 'Expected position');
        assert(typeof body.buffer === 'object', 'Expected buffer');
        assert(Array.isArray(body.buffer), 'Expected buffer as array');
        const buffer = Buffer.from(body.buffer);
        const length = parseInt(body.length);
        // perform a lengths check before returning it
        return {
            fd: parseInt(body.fd),
            length: length <= buffer.length ? length : buffer.length,
            position: parseInt(body.position),
            buffer,
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
//#endregion

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
    // console.log(rows, parentfoid);
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
    // console.log('Comparing', fileContent.permissions, rwFlag);
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
    // console.log(fid);
    const [res] = await db.execute<ResultSetHeader>(
        'INSERT INTO usersession(uid,operation,fid) values(?,?,?)',
        [uid, flags, fid]
    );

    return res.insertId;
}

export async function create(pathStr: string, uid: number, mode: number) {
    const parentPath = FileUtils.folderPath(pathStr);
    const parentfoid = await Folder.getFolderID(parentPath);
    let gidcalc: number;
    if (parentfoid === null) {
        gidcalc = 1; //the first group ever created
    } else {
        const [rows] = await db.execute('select gid from folder where foid=?', [
            parentfoid,
        ]);
        gidcalc = rows[0].gid;
    }
    //now to assert uniqueness
    const itemname = FileUtils.fileName(pathStr);
    await assertUnique(itemname, parentfoid);

    // now to create an entry
    const [rows] = await db.execute<ResultSetHeader>(
        'insert into file(name,uid,gid,permissions,parentfoid,mongofileuid) values(?,?,?,?,?,?)',
        [itemname, uid, gidcalc, mode, parentfoid, null]
    );
    return rows.insertId;
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
    // console.log(file.mongofileuid);

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
                    end: size < computedEnd ? size : computedEnd,
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

export async function write(
    fd: number,
    uid: number,
    length: number,
    position: number,
    buffer: Buffer
) {
    console.log('I>starting write');
    await assertFDPerms(fd, 1);
    //get fs results
    const [res] = await db.execute<RowDataPacket[]>(
        'select file.fid,mongofileuid from file join usersession on usersession.fid=file.fid where sessionid=?',
        [fd]
    );
    if (res.length < 1) {
        console.log('E>what happened here');
        throw new ResponseError('did not find file', 404);
    }
    const file = res[0] as { fid: number; mongofileuid?: string };
    await assertFidPerms(file.fid, uid, 1);
    const fidString = file.fid.toString();
    // console.log(file.mongofileuid);
    const bucket = await getBucket();
    if (file.mongofileuid === null) {
        console.log('I>write,new file');
        return new Promise<number>((resolve, reject) => {
            //convert buffer to readable stream and feed it into the bucket upload stream
            // reject on error otherwise move to the next part
            Readable.from(buffer.slice(0, length))
                .pipe(bucket.openUploadStream(fidString))
                .on('error', error => {
                    console.log('W>write error', error);
                    reject(error);
                })
                .on('finish', () => {
                    resolve(length);
                });
        }).then(async result => {
            const [rows] = await db.execute<ResultSetHeader>(
                'update file set mongofileuid=? where fid=?',
                [fidString, file.fid]
            );
            assert(rows.affectedRows > 0, 'Expected change in files');
            // pass this value forward, assured that the central db has been updated
            return result;
        });
    } else {
        //file exists, attempt to modify
        console.log('I>write,existing');
        //get size
        const [rows] = await bucket
            .find({ filename: file.mongofileuid }, { sort: { uploadDate: -1 } })
            .toArray();
        const size: number = rows.length;

        if (size + 1 < position)
            throw new ResponseError('Invalid place to start writing from');

        console.log('starting to write size', size, position, length);

        // const newFileStream = combinedStream.create();
        const streams = [];
        const readStream = bucket.openDownloadStreamByName(fidString, {
            start: 0,
            end: position,
            revision: -1,
        });
        streams.push(readStream);
        streams.push(Readable.from(buffer.slice(0, length)));

        if (position + length < size - 1) {
            // let bucket2: GridFSBucketReadStream;
            const fileEnding = bucket.openDownloadStreamByName(fidString, {
                start: position + length + 1,
                end: size,
                revision: -1,
            });
            streams.push(fileEnding);
            console.log('Opened secondary boundary');
        }

        return new Promise<number>((resolve, reject) => {
            const newFileStream = multiStream.obj(streams);
            newFileStream.on('error', err => reject(new ResponseError()));

            //add the files to this stream
            // newFileStream.append(readStream);

            // console.log('Writing to ', fidString);
            const writeStream = bucket.openUploadStream(fidString);
            // writeStream

            newFileStream
                .on('data', data => console.log('My data', data))
                .pipe(writeStream)
                .on('error', () => reject(new ResponseError()))
                .on('finish', () => process.nextTick(resolve, length));
            // newFileStream
            //     .pipe(writeStream)
            //     .on('error', err => reject(new ResponseError()))
            //     .on('finish', () => resolve(length));
        });
        // return new Promise<number>((resolve, reject) => {
        //     readStream.on('error', () => {
        //         writeStream.end(() =>
        //             reject(new ResponseError('failed to write'))
        //         );
        //     });
        //     writeStream.on('error', myerr => {
        //         console.log(myerr);
        //         reject(new ResponseError());
        //     });
        //     //copy over the initial bytes
        //     readStream.pipe(writeStream, { end: false })
        //     //now copy over my bytes
        //     console.log('GOING TO WRITE', buffer.slice(0, length));
        //     Readable.from(buffer.slice(0, length)).pipe(writeStream, {
        //         end: false,
        //     });

        //     if (position + length < size - 1) {
        //         //this part, there's some stream left too;
        //         //bucket2 is guaranteed to exist
        //         writeStream.on('finish', () => {
        //             console.log('I>Resolving write on existing');
        //             resolve(length);
        //         });
        //         bucket2.pipe(writeStream);
        //         // resolve(length);
        //     } else {
        //         //theres nothing left
        //         writeStream.end(() => {
        //             console.log('I>Resolving write on empty');
        //             resolve(length);
        //         });
        //     }
        // });
        // throw new ResponseError('Not yet supported');
    }
}

export async function unlink(uid: number, pathStr: string) {
    const fid = await getFile(pathStr);
    const bucket = await getBucket();
    // bucket.

    const [res] = await db.execute<RowDataPacket[]>(
        'select fid,mongofileuid from file where fid=?',
        [fid]
    );
    if (res.length < 1) {
        throw new ResponseError('did not find file', 404);
    }
    const file = res[0] as { fid: number; mongofileuid?: string };
    await assertFidPerms(file.fid, uid, 1);
    if (file.mongofileuid) {
        const filesets = await bucket
            .find({ filename: file.mongofileuid }, { sort: { uploadDate: -1 } })
            .toArray();

        //wait for all versions to delete
        try {
            await Promise.all(
                filesets.map(doc => {
                    const id = doc._id;
                    return new Promise((resolve, reject) => {
                        bucket.delete(id, (error, result) => {
                            if (error) {
                                reject(error);
                                return;
                            }
                            resolve(result);
                        });
                    });
                })
            );
        } catch (e) {
            console.log('Promise all', e);
            const [rows] = await db.execute<ResultSetHeader>(
                'update file set mongofileuid=? where fid=?',
                [null, fid]
            );
            throw new ResponseError();
        }

        // for(let doc of filesets){
        //     const id = doc._id;
        //     await bucket.delete()
        // }
    }

    const [rows] = await db.execute<ResultSetHeader>(
        'delete from file where fid=?',
        [fid]
    );

    return rows.affectedRows;
}

export async function truncate(uid: number, pathStr: string, size: number) {
    const fid = await getFile(pathStr);

    await assertFidPerms(fid, uid, 1);

    const [rows] = await db.execute<RowDataPacket[]>(
        'select mongofileuid from file where fid=?',
        [fid]
    );

    if (rows.length === 0) throw new ResponseError('file not found', 404);

    const mfileId: string = rows[0].mongofileuid;

    if (mfileId) {
        const bucket = await getBucket();

        if (size === 0) {
            const filesets = await bucket
                .find({ filename: mfileId }, { sort: { uploadDate: -1 } })
                .toArray();
            try {
                await Promise.all(
                    filesets.map(doc => {
                        const id = doc._id;
                        return new Promise((resolve, reject) => {
                            bucket.delete(id, (error, result) => {
                                if (error) {
                                    reject(error);
                                    return;
                                }
                                resolve(result);
                            });
                        });
                    })
                );
                const [rows] = await db.execute<ResultSetHeader>(
                    'update file set mongofileuid=? where fid=?',
                    [null, fid]
                );
                return 0;
            } catch (e) {
                console.log('Promise all', e);

                throw new ResponseError();
            }
        }

        const filesets = await bucket
            .find({ filename: mfileId }, { sort: { uploadDate: -1 } })
            .toArray();
        const fileSize = filesets[0].length;
        const readStream = bucket.openDownloadStreamByName(mfileId, {
            start: 0,
            revision: -1,
            end: fileSize < size ? fileSize : size,
        });
        return new Promise<number>((resolve, reject) => {
            readStream
                .pipe(bucket.openUploadStream(mfileId))
                .on('error', err => reject(err))
                .on('finish', () => resolve(size));
        });
    } else {
        return 0;
    }
}
