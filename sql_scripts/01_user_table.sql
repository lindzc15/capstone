CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    _name VARCHAR(40) NOT NULL,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(320) NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

INSERT INTO users (_name, username, email, password_hash)
VALUES (
    'User',
    'test23',
    'test@test',
    'test123'
);

SELECT * from users;