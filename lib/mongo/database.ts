import { GridFSBucket, MongoClient } from 'mongodb';

export const mongos = new MongoClient('mongodb://mongosdb:27017/test', {
    maxPoolSize: 15,
    useUnifiedTopology: true,
});

let mongoclient: MongoClient = null;

/**
 * Connect to mongodb and get db
 * @returns database
 */
export async function mdb() {
    // if (!mongos.isConnected) {
    //     console.log('I>connecting');
    //     mongoclient = await mongos.connect();
    //     return m
    // }
    if (!mongoclient || !mongoclient.isConnected) {
        mongoclient = await mongos.connect();
    }

    return mongoclient.db('test');
    // const conn = await mongos.connect();
    // return conn.db('test');
}

export async function getBucket() {
    const db = await mdb();
    return new GridFSBucket(db);
}
