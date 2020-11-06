"use strict"

let logger
let pgQuery

const errors = {
    SHORT_EXAMPLE: 'SHORT_EXAMPLE',
    WRONG_EXAMPLE: 'WRONG_EXAMPLE',
    WRONG_COUNTRY_ID: 'WRONG_COUNTRY_ID',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR'
}
Object.freeze(errors)

async function country({example}) {
    if (!example.length > 0) {
        throw errors.SHORT_EXAMPLE
    }
    
    if (/%/.test(example)) {
        throw errors.WRONG_EXAMPLE
    }

    const pattern = example + '%'

    try {
        logger.debug('search country for %s', example)
        const country_res = await pgQuery("SELECT * FROM countries WHERE title ilike $1 ORDER BY title ASC LIMIT 10", [pattern])
        if (!country_res.rowCount) {
            return []
        }

        return country_res.rows.map((item) => {
            return {
                country_id: item.country_id,
                title: item.title,
            }
        })
    }
    catch(e) {
        throw e
    }
}

async function city({country_id, example}) {
    if (!country_id) {
        throw errors.WRONG_COUNTRY_ID
    }

    if (!example.length > 0) {
        throw errors.SHORT_EXAMPLE
    }
    
    if (/%/.test(example)) {
        throw errors.WRONG_EXAMPLE
    }

    const pattern = example + '%'

    try {
        logger.debug('search city for %s and %s', country_id, example)
        const city_res = await pgQuery("SELECT * FROM cities WHERE country_id = $1 AND title ilike $2 ORDER BY title ASC LIMIT 10", [country_id, pattern])
        if (!city_res.rowCount) {
            return []
        }

        return city_res.rows.map((item) => {
            return {
                city_id: item.city_id,
                title: item.title,
            }
        })
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
        country: country,
        city: city,
        errors: errors
    }
}