import { MongoClient } from 'mongodb';

export const mongos = new MongoClient('mongodb://mongosdb:27017/test', {
    maxPoolSize: 15
});
