"use strict"

require('dotenv').config()

module.exports = {
    port: process.env.PORT,
    secret: '123',
    pg: {
        // PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD
        host: process.env.PGHOST || '',
        port: process.env.PGPORT || '',
        database: process.env.PGDATABASE || '',
        user: process.env.PGUSER || '',
        password: process.env.PGPASSWORD || ''
    }
}