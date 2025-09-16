CREATE TABLE restaurant_folders (
    folder_id INT,
    restaurant_id INT,
    PRIMARY KEY (folder_id, restaurant_id),
    FOREIGN KEY (folder_id) REFERENCES folders(folder_id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurant_info(restaurant_id) ON DELETE CASCADE
);