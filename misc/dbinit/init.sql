-- update plugin='mysql_native_password' where user='root';
use couscous;


CREATE TABLE dummytable(
    id integer primary key,
    name varchar(32)
);

CREATE TABLE users (
    uid integer not null auto_increment PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    email VARCHAR(32) NOT NULL,
    pwd VARCHAR(128) NOT NULL,
    role TINYINT NOT NULL
);

