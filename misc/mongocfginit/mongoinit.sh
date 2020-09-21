#!/bin/bash

echo '--making config rs--'
mongo  "localhost:27018" -- <<JS
    rs.initiate({_id: "mongocfg",configsvr: true, members: [{ _id : 0, host : "mongocfg1:27017" },{ _id : 1, host : "mongocfg2:27017" }, { _id : 2, host : "mongocfg3:27017" }]})
JS
# sleep a bit to let the election happen
echo '--Now waiting--'
sleep 30

echo '--making initial shards--'
mongo "localhost:27017" -- <<JS
    sh.addShard("mongosh1:27017")
    sh.addShard("mongosh2:27017")
    sh.enableSharding("test")
    db.adminCommand( { shardCollection: "test.fs.chunks", key: { _id: "hashed" } } )
    db.adminCommand( { shardCollection: "test.fs.files", key: { _id: "hashed" } } )
JS

