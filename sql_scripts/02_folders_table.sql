CREATE TABLE folders (
    folder_id SERIAL PRIMARY KEY,
    folder_name VARCHAR(255) NOT NULL,
    color VARCHAR(7),
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);