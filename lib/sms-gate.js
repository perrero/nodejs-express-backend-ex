"use strict"

module.exports = {
    send: function Send(phoneNumber, msg) {
        return new Promise((resolve, reject) => {
            const t = setTimeout(() => {
                clearTimeout(t)
                resolve(true)
            }, 3000)
        })
    }
}