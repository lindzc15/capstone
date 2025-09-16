CREATE TABLE folders (
    folder_id SERIAL PRIMARY KEY,
    _name VARCHAR(100) NOT NULL,
    color VARCHAR(7),
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);