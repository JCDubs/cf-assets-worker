'use strict'

const ONE_YEAR = 31536000

module.exports = class HeaderUtils {
    static setDefaultHeaders(response, requestUrl, contentType) {
        this._setHeaders(response)
        this._addCacheTags(response, requestUrl)
        response.headers.set('Cache-Control', `max-age=${ONE_YEAR}`)
        response.headers.set('Content-Type', contentType)
    }

    static setNoCacheHeaders(response) {
        this._setHeaders(response)
        response.headers.set('Cache-Control', `private, no-cache, no-store`)
    }

    static _setHeaders(response) {
        this._processHeaders(response, {
            'X-Content-Type-Options': 'nosniff',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'X-Xss-Protection': '1'
        })
    }

    static _processHeaders(response, headersToSet) {
        const headersToDelete = ['x-amz-id-2', 'x-amz-meta-version', 'x-amz-request-id', 'x-amz-server-side-encryption']
        for (const [key, value] of Object.entries(headersToSet)) { response.headers.set(key, value) }
        for (const headerToDelete of headersToDelete) { response.headers.delete(headerToDelete) }
    }

    static _addCacheTags(response, requestUrl) {
        let tags = []
        let dirs = requestUrl.pathname.split("/")
        dirs = dirs.slice(1, -1)
        dirs = dirs.map(encodeURIComponent)
        for (let i = 0; i < dirs.length; i++) {
            tags[i] = requestUrl.hostname + "/" + dirs.slice(0, i + 1).join("/") + "/*"
        }
        response.headers.append('Cache-Tag', tags.join(','))
    }
}
