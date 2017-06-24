DROP DATABASE IF EXISTS bamazon_DB;

CREATE DATABASE bamazon_DB;

USE bamazon_DB;

CREATE TABLE products (
	item_id INT NOT NULL,
	product_name VARCHAR(50) NULL,
	department_name VARCHAR(20) NOT NULL,
	price INT(10) NOT NULL,
	stock_quantity INT (5) NOT NULL,
	PRIMARY KEY (item_id)
);

INSERT INTO products (item_id, product_name, department_name, price, stock_quantity)
VALUES (1001, "Cat Bracelet", "Jewelry", 3.50, 50),
(1002, "Gold Toilet", "Hardware", 500000, 300),
(1003, "Pimp Cup", "Housewares", 50, 30),
(1004, "Notebook", "Stationery", 5, 3000),
(1005, "Pen", "Stationery", 1, 5000),
(1006, "Hammer", "Hardware", 9, 800),
(1007, "Gold Chain", "Jewelry", 850, 10),
(1008, "Banana Leaf", "Housewares", 1.50, 300),
(1009, "Apple MacBook Pro", "Electronics", 1499, 5),
(1010, "Apple Magic Mouse", "Electronics", 79, 20);