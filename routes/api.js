"use strict"

module.exports = {
    error: (res, code, msg) => {
        res.json({'status': 'error', 'error_code': code, 'error': msg})
    },
    success: (res, data) => {
        res.json({'status': 'success', 'result': data})
    }
}