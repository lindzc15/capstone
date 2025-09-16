CREATE TABLE restaurant_info (
    restaurant_id SERIAL PRIMARY KEY,
    price_range INT,
    rest_name VARCHAR(100) NOT NULL,
    avg_rating DECIMAL(3,1),
    loc VARCHAR(255) NOT NULL,
    menu_url VARCHAR(500),
    website_url VARCHAR(500),
    main_photo_url VARCHAR(500)
)