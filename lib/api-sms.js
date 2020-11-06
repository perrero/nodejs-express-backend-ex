"use strict"

const uuid = require('uuid')
const gate = require('./sms-gate')
const validator = require('./validator')

let logger
let pgQuery

const errors = {
    WRONG_PHONE_NUMBER: 'WRONG_PHONE_NUMBER',
    ALREADY_SENT_NOT_EXPIRED: 'ALREADY_SENT_NOT_EXPIRED',
    WRONG_CODE: 'WRONG_CODE',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR'
}
Object.freeze(errors)

async function send({phoneNumber}) {
    if (!validator.phoneNumber(phoneNumber)) {
        throw errors.WRONG_PHONE_NUMBER
    }

    logger.debug('phoneNumber is OK', phoneNumber)
    
    try {
        // код отправлялся меньше, чем три минуты назад?
        const alreadyExistsFresh = await pgQuery(
            "SELECT sms_id FROM sms WHERE phone = $1 AND ts > (now() - interval '3 minutes') LIMIT 1",
            [phoneNumber])
        
        if (alreadyExistsFresh.rowCount > 0) {
            throw errors.ALREADY_SENT_NOT_EXPIRED
        }
        logger.debug('no fresh records for', phoneNumber)

        const code = [1,2,3,4].map(() => parseInt(Math.random()*10, 10)).join('')

        await gate.send(phoneNumber, code)
        logger.debug('code %s to %s sent', code, phoneNumber)

        const sms_res = await pgQuery("SELECT nextval('sms_id_seq') AS sms_id")
        if (!sms_res.rowCount) {
            throw errors.UNKNOWN_ERROR
        }
        const sms_id = sms_res.rows[0].sms_id
        const token = uuid.v4()
        logger.debug('sms_id: %s, token: %s', sms_id, token)
        await pgQuery('INSERT INTO sms(sms_id, phone, code, token) VALUES($1, $2, $3, $4)', [sms_id, phoneNumber, code, token])
        logger.debug('saved', sms_id)
        
        return {phoneNumber: phoneNumber, code: code, token: token}
    }
    catch(e) {
        throw e
    }
}

async function verify({phoneNumber, code}) {
    if (!validator.phoneNumber(phoneNumber)) {
        throw errors.WRONG_PHONE_NUMBER
    }
    logger.debug('phoneNumber is OK', phoneNumber)

    if (!validator.code(code)) {
        throw errors.WRONG_CODE
    }
    logger.debug('code is OK', code)

    try {
        // выбрать последнюю запись
        const res = await pgQuery(
            "SELECT * FROM sms WHERE phone = $1 AND code = $2 ORDER BY ts DESC LIMIT 1",
            [phoneNumber, code])

        if (res.rowCount) {
            logger.debug('code is valid')
            return res.rows[0]
        }

        throw errors.WRONG_CODE
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
        send: send,
        verify: verify,
        errors: errors
    }
}