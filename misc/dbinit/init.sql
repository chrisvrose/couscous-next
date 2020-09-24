-- update plugin='mysql_native_password' where user='root';
use couscous;

CREATE TABLE users (
    uid integer not null auto_increment PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    email VARCHAR(32) UNIQUE NOT NULL,
    pwd VARCHAR(128) NOT NULL,
    role TINYINT NOT NULL
);


CREATE TABLE atokens (
    uid integer not null,
    atoken varchar(256) not null UNIQUE,
    foreign key (uid) references users(uid)
);

-- user with password 'password'
insert into users(name,email,pwd, role) values('Foo Bar', 'foo@bar.baz','$2a$10$/comR4xTKpklPzmhSplXLO3cCOST1M96p2Jvwtxvrl6B5EHeONWtS',True);