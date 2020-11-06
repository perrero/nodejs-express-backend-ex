"use strict"

const pg = require('pg')

module.exports = (settings) => {
    return function PgQuery(query, placeholders) {
        return new Promise((resolve, reject) => {
            if (!settings) {
                resolve(null)
                return
            }
    
            try {
    
                const pool = new pg.Pool(settings)
                pool.connect((err, client, done) => {
                    if (err) {
                        reject(err)
                        return
                    }
    
                    pool.on('error', err => {
                        done()
                        reject(err)
                    })
    
                    client.query(query, placeholders, (err, res) => {
                        done()
                        if (err) {
                            reject(err)
                            return
                        }
                        resolve(res)
                    })
                })
            }
            catch (e) {
                reject(e);
            }
        })
    }
}