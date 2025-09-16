CREATE TABLE restaurant_info (
    restaurant_id SERIAL PRIMARY KEY,
    price_range TINYINT,
    _name VARCHAR(50) NOT NULL,
    avg_rating DECIMAL(2,1),
    rest_location VARCHAR(100) NOT NULL,
    menu_url VARCHAR(500),
    FOREIGN KEY (folder_id) REFERENCES folders(folder_id)
)