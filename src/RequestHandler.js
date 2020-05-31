'use strict'

const HeaderUtils = require('./utils/HeaderUtils')
const ContentTypeService = require('./service/ContentTypeService')

module.exports = class RequestHandler {

    static async handleRequest(event) {
        const request = event.request
        const url = new URL(request.url)
        try {
            let serverUrl = `${S3_URL}${url.pathname}${url.search}`
            const cache = caches.default
            let response = await cache.match(request.url)

            if (response && response.ok) {
                const body = await response.text()
                if (body && body.length > 0) {
                    return new Response(body, response)
                }
            }

            response = await fetch(serverUrl, request)
            if (response) {
                const newResponse = new Response(await response.text(), response)

                if (!response.ok) {
                    HeaderUtils.setNoCacheHeaders(newResponse, url)
                    return newResponse
                }
                const contentType = ContentTypeService.getContentType(url)
                HeaderUtils.setDefaultHeaders(newResponse, url, contentType)
                event.waitUntil(cache.put(request.url, newResponse.clone()))
                return newResponse
            }
            return await fetch(`${S3_URL}/404/`, request)
        } catch (err) {
            return new Response(err, { status: 500 })
        }
    }
}
