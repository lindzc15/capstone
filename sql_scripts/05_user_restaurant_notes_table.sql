CREATE TABLE user_restaurant_notes (
    user_id INT,
    restaurant_id INT,
    user_rating DECIMAL(3,1),
    favorite_dishes VARCHAR(255),
    notes VARCHAR(255),
    date_visited DATE,
    PRIMARY KEY (user_id, restaurant_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurant_info(restaurant_id) ON DELETE CASCADE
);