CREATE TABLE restaurant_photos (
    photo_id SERIAL PRIMARY KEY,
    photo_url VARCHAR(500),
    restaurant_id INT,
    FOREIGN KEY (restaurant_id) REFERENCES restaurant_info(restaurant_id) ON DELETE CASCADE
);