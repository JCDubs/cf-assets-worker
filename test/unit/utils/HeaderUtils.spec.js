'use strict'

const HeaderUtils = require('../../../src/utils/HeaderUtils')
const sinon = require('sinon')
let sandbox
let getStub
let setStub
let deleteStub
let appendStub

describe('Header Utils Test', () => {

    beforeEach(() => { sandbox = sinon.createSandbox() })
    afterEach(() => { sandbox.restore() })

    it('Test setDefaultHeaders.', () => {
        getStub = sandbox.stub()
        setStub = sandbox.stub()
        deleteStub = sandbox.stub()
        appendStub = sandbox.stub()
        const newResponse = { headers: { get: getStub, set: setStub, delete: deleteStub, append: appendStub } }
        const requestUrl = new URL('https://www.test.com/api/test/app.js')
        const contentType = 'application/javascript'
        HeaderUtils.setDefaultHeaders(newResponse, requestUrl, contentType)
        assertHeaderCalls('application/javascript', 'www.test.com/api/*,www.test.com/api/test/*', `max-age=31536000`)
    })

    it('Test setNoCacheHeaders.', () => {
        getStub = sandbox.stub()
        setStub = sandbox.stub()
        deleteStub = sandbox.stub()
        appendStub = sandbox.stub()
        const newResponse = { headers: { get: getStub, set: setStub, delete: deleteStub, append: appendStub } }
        HeaderUtils.setNoCacheHeaders(newResponse)
        assertHeaderCalls(null, null, `private, no-cache, no-store`)
    })

    const assertHeaderCalls = (contentType, cacheTags, cacheControl) => {
        sinon.assert.calledWithExactly(setStub, 'X-Content-Type-Options', 'nosniff')
        sinon.assert.calledWithExactly(setStub, 'Referrer-Policy', 'strict-origin-when-cross-origin')
        sinon.assert.calledWithExactly(setStub, 'X-Xss-Protection', '1')
        sinon.assert.calledWithExactly(deleteStub, 'x-amz-id-2')
        sinon.assert.calledWithExactly(deleteStub, 'x-amz-meta-version')
        sinon.assert.calledWithExactly(deleteStub, 'x-amz-request-id')
        sinon.assert.calledWithExactly(deleteStub, 'x-amz-server-side-encryption')
        sinon.assert.calledWithExactly(setStub, 'Cache-Control', cacheControl)
        if (cacheTags) {
            sinon.assert.calledWithExactly(appendStub, 'Cache-Tag', cacheTags)
        }
        if (contentType) {
            sinon.assert.calledWithExactly(setStub, 'Content-Type', contentType)
        }
    }
})