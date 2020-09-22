/* eslint-disable no-undef */
sh.enableSharding('test');
db.adminCommand({
    shardCollection: 'test.fs.chunks',
    key: { files_id: 'hashed' }
});
db.adminCommand({
    shardCollection: 'test.fs.files',
    key: { files_id: 'hashed' }
});
