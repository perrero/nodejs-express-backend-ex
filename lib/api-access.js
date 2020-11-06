"use strict"

let logger
let pgQuery

const errors = {
    WRONG_TOKEN: 'WRONG_TOKEN',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR'
}
Object.freeze(errors)

async function check({token}) {
    try {
        const sms_res = await pgQuery("SELECT * FROM sms WHERE token = $1 ORDER BY ts DESC LIMIT 1", [token])
        if (!sms_res.rowCount) {
            throw errors.WRONG_TOKEN
        }

        // вернуть секретное содержимое
        return {'secret':'content'}
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
        check: check,
        errors: errors
    }
}