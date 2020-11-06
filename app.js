"use strict"

const settings = require('./settings')

const loggerFactory = require('./lib/logger-factory')
loggerFactory.initialize('./logger.json')

const express = require('express')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const uuid = require('uuid')
const path = require('path')
const pgQuery = require('./lib/pg-query')(settings.pg)

const logger4req = loggerFactory.logger4req('app')
const app = express()

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(cookieParser())

const sessionSettings = {
    secret: settings.secret,
    saveUninitialized: true,
    resave: false,
    cookie: {}
}
if (app.get('env') === 'production') {
    app.set('trust proxy', 1)
    sessionSettings.cookie.secure = true
}
app.use(session(sessionSettings))

app.use((req, res, next) => {
    if (!req.session) {
        throw new Error('session not defined!')
    }
    if (!req.session.id) {
        req.session.id = uuid.v4()
    }
    next()
})

app.use((req, res, next) => {
    const logger = logger4req(req)
    logger.debug('incoming', req.method, req.url)
    next()
})

const api_sms = require('./lib/api-sms')({
    logger: loggerFactory.logger4name('api-sms'),
    pgQuery: pgQuery
})
app.use('/api/v1/sms', require('./routes/api/sms')({
    api_sms: api_sms,
    logger4req: loggerFactory.logger4req('api/sms')
}))

const api_register = require('./lib/api-register')({
    logger: loggerFactory.logger4name('api-register'),
    pgQuery: pgQuery
})
app.use('/api/v1/register', require('./routes/api/register')({
    api_register: api_register,
    logger4req: loggerFactory.logger4req('api/register')
}))

const api_autocomplete = require('./lib/api-autocomplete')({
    logger: loggerFactory.logger4name('api-autocomplete'),
    pgQuery: pgQuery
})
app.use('/api/v1/autocomplete', require('./routes/api/autocomplete')({
    api_autocomplete: api_autocomplete,
    logger4req: loggerFactory.logger4req('api/autocomplete')
}))

/*
app.get('/', (req, res) => {
    res.send('Hello World!')
})
*/

app.listen(settings.port, () => {
    console.log(`Example app listening at http://localhost:${settings.port}`)
  })