import mysql from 'mysql2';

export default mysql
    .createPool({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER ?? 'couscous',
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    })
    .promise();
