"use strict"

const express = require('express')
const router = express.Router()

const api = require('../api')

// global vars and factories
let api_register
let logger4req

router

    /*
        зарегистрировать
    */
    .post('/', async (req, res, next) => {
        const logger = logger4req(req)

        const {
            fullName, email, phoneNumber, city, country, mobileOs
        } = req.body
        
        try {
            logger.debug('user register', fullName, email, phoneNumber, city, country, mobileOs)
            const user = await api_register.register({fullName, email, phoneNumber, city, country, mobileOs})
            logger.debug('user registered', user)
            api.success(res, {registered: true, user: user})
        }
        catch(e) {
            logger.warn(e)
            switch(e) {
                case api_register.errors.WRONG_FULL_NAME:
                    return api.error(res, e, 'wrong fullName')
                case api_register.errors.WRONG_EMAIL:
                    return api.error(res, e, 'wrong email')
                case api_register.errors.WRONG_PHONE_NUMBER:
                    return api.error(res, e, 'wrong phoneNumber format')
                case api_register.errors.WRONG_CITY:
                    return api.error(res, e, 'wrong city')
                case api_register.errors.WRONG_COUNTRY:
                    return api.error(res, e, 'wrong country')
                case api_register.errors.WRONG_MOBILE_OS:
                    return api.error(res, e, 'wrong mobileOs')
                case api_register.errors.ALREADY_REGISTERED:
                    return api.error(res, e, 'already registered')
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

    api_register = args.api_register
    if (!api_register) {
        throw new Error("api_register is required")
    }

    return router
}