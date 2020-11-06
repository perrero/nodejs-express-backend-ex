"use strict"

const log4js = require('log4js')

const initialize = (conf) => {
	log4js.configure(conf)
}

const logger4name = (name) => {
	return log4js.getLogger(name);
}

// фабрика фабрик, которые будут ожидать на входе объект req
const logger4req = (name) => {
	return (req) => {
		let prefix = name
		if (req && req.session && req.session.id) {
			prefix = name + ':' + req.session.id
		}

		if (req) {
			prefix = [prefix, req.method, req.originalUrl].join(' ')
		}

		return log4js.getLogger(prefix)
	}
}

module.exports = {
	initialize: initialize,
	logger4name: logger4name,
    logger4req: logger4req
}