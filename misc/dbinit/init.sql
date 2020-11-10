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


CREATE TABLE usergroups (
    gid integer not null auto_increment PRIMARY KEY
);

CREATE TABLE folder(
    foid integer not null auto_increment PRIMARY KEY,
    uid integer not null,
    gid integer not null,
    permissions integer not null,
    parentfoid integer not null,
    foreign key (uid) references users(uid),
    foreign key (gid) references usergroups(gid),
    foreign key (parentfoid) references folder(foid)
);

CREATE TABLE file(
    fid integer not null auto_increment PRIMARY KEY,
    uid integer not null,
    gid integer not null,
    permissions integer not null,
    parentfoid integer not null,
    foreign key (uid) references users(uid),
    foreign key (gid) references usergroups(gid),
    foreign key (parentfoid) references folder(foid)
);



CREATE TABLE usersession(
    uid integer not null,
    operation integer not null,
    fid integer not null,
    foreign key (uid) references users(uid),
    foreign key (fid) references file(fid)
);