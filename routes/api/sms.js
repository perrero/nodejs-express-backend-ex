"use strict"

const express = require('express')
const router = express.Router()

const api = require('../api')

// global vars and factories
let api_sms
let logger4req

router

    /*
        взаимодействовать с SMS-шлюзом, записать код в таблицу, вернуть идентификатор записи
    */
    .post('/send', async (req, res, next) => {
        const logger = logger4req(req)

        const phoneNumber = req.body.phoneNumber
        
        try {
            logger.debug('send sms to', phoneNumber)
            const sms = await api_sms.send({phoneNumber: phoneNumber})
            logger.debug('sms sent', sms)
            // NB: для демонстрационных целей подтверждающий код отправляется на фронт
            api.success(res, {sent: true, DEBUG: sms})
        }
        catch(e) {
            logger.warn(e)
            switch(e) {
                case api_sms.errors.WRONG_PHONE_NUMBER:
                    return api.error(res, e, 'wrong phoneNumber format')
                case api_sms.errors.ALREADY_SENT_NOT_EXPIRED:
                    return api.error(res, e, 'wait please')
                default:
                    return api.error(res, 'UNKNOWN_ERROR', 'unknown error')
            }
        }
    })

    /*
        проверить код из таблицы, вернуть true если код валидный и false для невалидного кода
    */
    .post('/verify', async (req, res, next) => {
        const logger = logger4req(req)

        const phoneNumber = req.body.phoneNumber
        const code = req.body.code

        try {
            const sms = await api_sms.verify({phoneNumber: phoneNumber, code: code})
            return api.success(res, {token: sms.token})
        }
        catch(e) {
            logger.warn(e)
            switch(e) {
                case api_sms.errors.WRONG_PHONE_NUMBER:
                    return api.error(res, e, 'wrong phoneNumber format')
                case api_sms.errors.WRONG_CODE:
                    return api.error(res, e, 'wrong code')
                default:
                    return api.error(res, 'UNKNOWN_ERROR', 'unknown error')
            }
        }
    })

    .use((err, req, res, next) => {
        const logger = logger4req(req)
        logger.debug(err)
        res.code(400).end()
    })

// init global vars and factories
module.exports = function Initialize(args) {
    logger4req = args.logger4req
    if (!logger4req) {
        throw new Error("logger4req is required")
    }

    api_sms = args.api_sms
    if (!api_sms) {
        throw new Error("api_sms is required")
    }

    return router
}