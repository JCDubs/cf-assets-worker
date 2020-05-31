'use strict'

const mime = require('mime-types')

module.exports = class ContentTypeService {
    static getContentType(url) {
        return mime.lookup(url.pathname)
    }
}
