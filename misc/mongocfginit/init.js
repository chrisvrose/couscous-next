// eslint-disable-next-line no-undef
rs.initiate({
    _id: 'mongocfg',
    configsvr: true,
    members: [
        { _id: 0, host: 'mongocfg1:27017' },
        { _id: 1, host: 'mongocfg2:27017' },
        { _id: 2, host: 'mongocfg3:27017' }
    ]
});
