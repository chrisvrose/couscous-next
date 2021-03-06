-- update plugin='mysql_native_password' where user='root';
use couscous;

CREATE TABLE users (
    uid integer not null auto_increment PRIMARY KEY,
    name TEXT NOT NULL,
    email VARCHAR(32) UNIQUE NOT NULL,
    pwd VARCHAR(128) NOT NULL,
    role TINYINT NOT NULL
);

CREATE TABLE atokens (
    uid integer not null,
    atoken varchar(256) not null UNIQUE,
    foreign key (uid) references users(uid) on delete cascade
);

CREATE TABLE usergroups (
    gid integer not null auto_increment PRIMARY KEY,
    name varchar(32) not null 
);

-- group membership
create table groupmember (
    uid integer,
    gid integer,
    foreign key (uid) references users(uid) on delete cascade,
    foreign key (gid) references usergroups(gid) on delete cascade,
    UNIQUE KEY (uid,gid)
);

CREATE TABLE folder(
    foid smallint not null auto_increment PRIMARY KEY,
    name TEXT not null,
    uid integer not null,
    gid integer not null,
    atime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ctime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    mtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    permissions integer not null,
    parentfoid smallint ,
    foreign key (uid) references users(uid),
    foreign key (gid) references usergroups(gid),
    foreign key (parentfoid) references folder(foid)
);

CREATE TABLE file(
    fid smallint not null auto_increment PRIMARY KEY,
    name TEXT not null,
    uid integer not null,
    gid integer not null,
    atime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ctime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    mtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    permissions integer not null,
    parentfoid smallint,
    mongofileuid text,
    foreign key (uid) references users(uid),
    foreign key (gid) references usergroups(gid),
    foreign key (parentfoid) references folder(foid)
);

CREATE TABLE usersession(
    sessionid int not null auto_increment PRIMARY KEY,
    uid integer not null,
    operation integer not null,
    fid smallint not null,
    foreign key (uid) references users(uid) on delete cascade,
    foreign key (fid) references file(fid) on delete cascade
);

-- admin with password 'password'
insert into users(name,email,pwd, role) values('Foo Bar', 'foo@bar.baz','$2a$10$/comR4xTKpklPzmhSplXLO3cCOST1M96p2Jvwtxvrl6B5EHeONWtS',True);
-- insert a group
insert into usergroups(name) values("mygroup");
-- make the admin a member of above group
insert into groupmember values(1,1);

-- insert some files and folders
insert into folder(foid,name,uid,gid,permissions) values(1,"world",1,1,420);
insert into folder(foid,name,uid,gid,permissions) values(2,"border",1,1,420);
insert into file(fid,name,uid,gid,permissions,parentfoid) values(1,"open.txt" ,1,1,420,1   );
insert into file(fid,name,uid,gid,permissions) values(2,"hello.txt",1,1,420);