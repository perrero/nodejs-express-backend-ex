"use strict"

const PNF = require('google-libphonenumber').PhoneNumberFormat
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance()

module.exports = {
    phoneNumber: function phoneNumberValidator(phoneNumber) {
        try {
            return phoneUtil.format(phoneUtil.parse(phoneNumber, 'RU'), PNF.INTERNATIONAL) === phoneNumber
        }
        catch(e) {
            return false
        }
    },
    
    code: function smsCodeValidator(code) {
        try {
            if (/^\d{4,8}$/.test(code)) {
                return true
            }
            return false
        }
        catch(e) {
            return false
        }
    },

    fullName: function fullNameValidator(fullName) {
        try {
            if (/^[а-яА-Я\s]+$/.test(String(fullName).trim())) {
                return true
            }
        }
        catch(e) {
            return false
        }
        return false
    },

    email: function emailValidator(email) {
        try {
            const regexp = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
            if (regexp.test(String(email).trim())) {
                return true
            }
        }
        catch(e) {
            return false
        }
        return false
    },

    city: function cityValidator(city) {
        try {
            if (String(city).trim().length > 0) {
                return true
            }
        }
        catch(e) {
            return false
        }
        return false
    },

    country: function countryValidator(country) {
        try {
            if (String(country).trim().length > 0) {
                return true
            }
        }
        catch(e) {
            return false
        }
        return false
    },

    mobileOs: function mobileOsValidator(mobileOs) {
        try {
            if (String(mobileOs).trim().length > 0) {
                return true
            }
        }
        catch(e) {
            return false
        }
        return false
    }
}