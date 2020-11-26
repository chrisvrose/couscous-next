import { GridFSBucket, MongoClient } from 'mongodb';

export const mongos = new MongoClient('mongodb://mongosdb:27017/test', {
    maxPoolSize: 15,
});

/**
 * Connect to mongodb and get db
 * @returns database
 */
export async function mdb() {
    const conn = await mongos.connect();
    return conn.db('test');
}

export async function getBucket() {
    const db = await mdb();
    return new GridFSBucket(db);
}
