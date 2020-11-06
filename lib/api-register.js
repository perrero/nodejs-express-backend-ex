"use strict"

const validator = require('./validator')

let logger
let pgQuery

const errors = {
    WRONG_FULL_NAME: 'WRONG_FULL_NAME',
    WRONG_EMAIL: 'WRONG_EMAIL',
    WRONG_PHONE_NUMBER: 'WRONG_PHONE_NUMBER',
    WRONG_CITY: 'WRONG_CITY',
    WRONG_COUNTRY: 'WRONG_COUNTRY',
    WRONG_MOBILE_OS: 'WRONG_MOBILE_OS',
    ALREADY_REGISTERED: 'ALREADY_REGISTERED',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR'
}
Object.freeze(errors)

async function register({fullName, email, phoneNumber, city, country, mobileOs}) {
    if (!validator.fullName(fullName)) {
        throw errors.WRONG_FULL_NAME
    }
    if (!validator.email(email)) {
        throw errors.WRONG_EMAIL
    }
    if (!validator.phoneNumber(phoneNumber)) {
        throw errors.WRONG_PHONE_NUMBER
    }
    if (!validator.city(city)) {
        throw errors.WRONG_CITY
    }
    if (!validator.country(country)) {
        throw errors.WRONG_COUNTRY
    }
    if (!validator.mobileOs(mobileOs)) {
        throw errors.WRONG_MOBILE_OS
    }

    try {
        const country_res = await pgQuery("SELECT country_id FROM countries WHERE title = $1", [country])
        if (!country_res.rowCount) {
            throw errors.WRONG_COUNTRY
        }
        const country_id = country_res.rows[0].country_id

        const city_res = await pgQuery("SELECT city_id FROM cities WHERE country_id = $1 AND title = $2", [country_id, city])
        if (!city_res.rowCount) {
            throw errors.WRONG_CITY
        }
        const city_id = city_res.rows[0].city_id

        // FIXME: ограничить регистрацию сочетанием email+phone? (смотри также ограничение на таблицу в схеме БД)
        const exists_res = await pgQuery("SELECT user_id FROM users WHERE email = $1 AND phone = $2", [email, phoneNumber])
        if (exists_res.rowCount > 0) {
            throw errors.ALREADY_REGISTERED
        }

        const id_res = await pgQuery("SELECT nextval('user_id_seq') AS user_id")
        if (!id_res.rowCount) {
            throw errors.UNKNOWN_ERROR
        }
        const user_id = id_res.rows[0].user_id

        await pgQuery(
            "INSERT INTO users(user_id, fullname, email, phone, city_id, mobile_os) VALUES($1, $2, $3, $4, $5, $6)",
            [user_id, fullName, email, phoneNumber, city_id, mobileOs]
        )
        logger.debug('saved', user_id)
        
        return {user_id: user_id}
    }
    catch(e) {
        throw e
    }
}

module.exports = function Initialize(args) {
    logger = args.logger
    if (!logger) {
        throw new Error("logger is required")
    }

    pgQuery = args.pgQuery
    if (!pgQuery) {
        throw new Error("pgQuery is required")
    }

    return {
        register: register,
        errors: errors
    }
}