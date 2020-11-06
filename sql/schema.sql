CREATE SEQUENCE country_id_seq;
CREATE TABLE countries (
    country_id INTEGER PRIMARY KEY DEFAULT nextval('country_id_seq'),
    title VARCHAR(512) NOT NULL,
    UNIQUE(title)
);

CREATE SEQUENCE city_id_seq;
CREATE TABLE cities (
    city_id INTEGER PRIMARY KEY DEFAULT nextval('city_id_seq'),
    country_id INTEGER REFERENCES countries(country_id),
    title VARCHAR(512) NOT NULL,
    UNIQUE(country_id, title) -- допущение, что нет одинаковых названий городов в одной стране
);


CREATE SEQUENCE user_id_seq;
-- user_id, fullname, email, phone, city_id, mobile_os
CREATE TABLE users(
    user_id INTEGER PRIMARY KEY DEFAULT nextval('user_id_seq'),
    city_id INTEGER REFERENCES cities(city_id),
    fullname VARCHAR(512) NOT NULL,
    email VARCHAR(512) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    mobile_os VARCHAR(255) NOT NULL,
    UNIQUE(email, phone) -- допущение, что сочетание email+phone является уникальным пользователем
);
CREATE INDEX ndx_users_email ON users(email);
CREATE INDEX ndx_users_phone ON users(phone);


-- допущение, что архивные записи переносятся в другую таблицу (архив регистраций)
-- здесь остаются только действующие записи (с действующими токенами доступа)
CREATE SEQUENCE sms_id_seq;
CREATE TABLE sms (
    sms_id INTEGER PRIMARY KEY DEFAULT nextval('sms_id_seq'),
    phone VARCHAR(255) NOT NULL,
    code INTEGER NOT NULL, -- код подтверждения владения номером телефона, отправляется через SMS
    token VARCHAR(255) NOT NULL, -- токен доступа
    ts TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX ndx_sms_phone ON sms(phone);
CREATE INDEX ndx_sms_token ON sms(token);