-- ========================
-- Supabase Schema Init File
-- Created from MySQL Knex migrations
-- ========================

-- 1. Users Table
-- Database is the source of truth for user profile data
create table users (
    id serial primary key,
    auth_uid uuid unique,  -- Links to Supabase Auth user
    username text unique not null,
    password text,  -- Nullable: passwords are stored in Supabase Auth, not here
    email text unique not null,
    firstName text,         -- Legacy camelCase (kept for backwards compatibility)
    lastName text,
    phoneNumber text,
    birthDate date,
    -- Profile fields (snake_case for consistency)
    firstname text,
    lastname text,
    phonenumber text,
    birthdate date,
    display_name text,
    address text,
    city text,
    state text,
    country text,
    zipcode text,
    bio text,
    profile_picture_url text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- 2. Tree Members Table
create table treeMembers (
    id serial primary key,
    firstName text not null,
    lastName text not null,
    birthDate date,
    deathDate date,
    location text,
    phoneNumber text,
    userId integer not null references users(id) on delete cascade,
    memberUserId integer,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- 3. Relationships Table
create table relationships (
    id serial primary key,
    person1_id integer not null references treeMembers(id) on delete cascade,
    person2_id integer not null references treeMembers(id) on delete cascade,
    relationshipType text not null check (relationshipType in ('parent','child','sibling','spouse','stepparent','stepchild','ex-spouse')),
    relationshipStatus text check (relationshipStatus in ('active','inactive')),
    side text check (side in ('paternal','maternal')),
    userId integer not null references users(id) on delete cascade,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- 4. Shared Trees Table
create table sharedTrees (
    sharedTreeID serial primary key,
    senderID integer not null references users(id),
    recieverID integer,
    perms text check (perms in ('view','edit')),
    parentalSide text check (parentalSide in ('paternal','maternal','both')),
    sahreDate timestamp,
    treeInfo json
);

-- 5. Backups Table
create table backups (
    backupId serial primary key,
    userId integer not null references users(id),
    backupData json,
    createdAt timestamp default now()
);

-- 6. Tree Info Table
create table treeinfo (
    id serial primary key,
    userid integer not null references users(id) on delete cascade,
    object jsonb,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);