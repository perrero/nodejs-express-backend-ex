"use strict"

const express = require('express')
const router = express.Router()

const api = require('../api')

// global vars and factories
let api_autocomplete
let logger4req

router

    /*
        искать страны
    */
    .post('/country', async (req, res, next) => {
        const logger = logger4req(req)

        const {
            example
        } = req.body
        
        try {
            const result = await api_autocomplete.country({example})
            api.success(res, result)
        }
        catch(e) {
            logger.warn(e)
            switch(e) {
                case api_autocomplete.errors.SHORT_EXAMPLE:
                    return api.error(res, e, 'short example')
                case api_autocomplete.errors.WRONG_EXAMPLE:
                    return api.error(res, e, 'wrong example')
                default:
                    return api.error(res, 'UNKNOWN_ERROR', 'unknown error')
            }
        }
    })

    /*
        искать города
    */
    .post('/city', async (req, res, next) => {
        const logger = logger4req(req)

        const {
            country_id, example
        } = req.body
        
        try {
            const result = await api_autocomplete.city({country_id, example})
            api.success(res, result)
        }
        catch(e) {
            logger.warn(e)
            switch(e) {
                case api_autocomplete.errors.SHORT_EXAMPLE:
                    return api.error(res, e, 'short example')
                case api_autocomplete.errors.WRONG_EXAMPLE:
                    return api.error(res, e, 'wrong example')
                case api_autocomplete.errors.WRONG_COUNTRY_ID:
                    return api.error(res, e, 'wrong country_id')
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

    api_autocomplete = args.api_autocomplete
    if (!api_autocomplete) {
        throw new Error("api_autocomplete is required")
    }

    return router
}