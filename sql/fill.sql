INSERT INTO countries(title) values('Россия');
INSERT INTO countries(title) values('Германия');
INSERT INTO countries(title) values('Франция');

INSERT INTO cities (country_id, title) (SELECT country_id, 'Москва' FROM countries WHERE title = 'Россия');
INSERT INTO cities (country_id, title) (SELECT country_id, 'Новосибирск' FROM countries WHERE title = 'Россия');
INSERT INTO cities (country_id, title) (SELECT country_id, 'Берлин' FROM countries WHERE title = 'Германия');
INSERT INTO cities (country_id, title) (SELECT country_id, 'Париж' FROM countries WHERE title = 'Франция');
