import { RowDataPacket } from 'mysql2';
import ResponseError from '../types/ResponseError';
import db from './db';
import * as File from './File';
import * as Folder from './Folder';

export async function getattr(pathstr: string) {
    try {
        const id = await File.getFile(pathstr);
        const [[desc]] = await db.execute<RowDataPacket[]>(
            'select name,permissions,"file" as type,mongofileuid from file where fid=?',
            [id]
        );
        return desc;
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

                    return desc;
                } else {
                    return null;
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
