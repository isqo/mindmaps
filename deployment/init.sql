CREATE TABLE customer
(
    id                SERIAL PRIMARY KEY,
    google_user_id    TEXT        NOT NULL,
    name              TEXT        NOT NULL,
    email             TEXT UNIQUE NOT NULL,
    profile_pic       TEXT        NOT NULL,
    created_timestamp timestamp   not null default current_timestamp
);

CREATE TABLE Mindmap
(
    id                SERIAL PRIMARY KEY,
    uuid              UUID NOT NULL UNIQUE,
    customer_id       TEXT 		NOT NULL,
    title             VARCHAR(255) NOT NULL,
    description       TEXT,
    map               JSONB,
    created_timestamp timestamp    not null default current_timestamp
);