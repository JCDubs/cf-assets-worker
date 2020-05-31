'use strict'
const sinon = require('sinon')
const RequestHandler = require('../../src/RequestHandler')
const ContentTypeService = require('../../src/service/ContentTypeService')
const HeaderUtils = require('../../src/utils/HeaderUtils')
const JS_CONTENT_TYPE = 'application/javascript;charset=UTF-8'
const TEST_PATH = '/test/path.js'
global.S3_URL = 'https://test.com'
let fetchStub, matchStub, putStub, waitUntilStub, text, statusCode, defaultHeadersStub, noCacheHeaderStub, contentTypeStub, sandbox
const request = { url: `${global.S3_URL}${TEST_PATH}` }
const globalResponse = global.Response
const globalCaches = global.caches
const globalFetch = global.fetch
const globalServerUrl = global.S3_URL

describe('Test the RequestHandler.', () => {

    beforeEach(() => {
        sandbox = sinon.createSandbox()
        contentTypeStub = sandbox.stub(ContentTypeService, 'getContentType').returns(JS_CONTENT_TYPE)
        defaultHeadersStub = sandbox.stub(HeaderUtils, 'setDefaultHeaders')
        noCacheHeaderStub = sandbox.stub(HeaderUtils, 'setNoCacheHeaders')
        waitUntilStub = sandbox.stub()
    })

    afterEach(() => {
        global.Response = globalResponse
        global.caches = globalCaches
        global.fetch = globalFetch
        global.S3_URL = globalServerUrl
        sandbox.restore()
    })

    it('Test the create function without a cached version and successful response.', async () => {
        setup(false, 200, 'Just some test body.', true)
        const eventStub = createEventStub()
        await RequestHandler.handleRequest(eventStub)
        sandbox.assert.calledWithExactly(matchStub, request.url)
        sandbox.assert.calledWithExactly(fetchStub, `${global.S3_URL}${TEST_PATH}`, request)
        sandbox.assert.called(contentTypeStub)
        sandbox.assert.called(defaultHeadersStub)
        sandbox.assert.called(eventStub.waitUntil)
        sandbox.assert.notCalled(noCacheHeaderStub)
        sandbox.assert.neverCalledWithMatch(fetchStub, `${global.S3_URL}/404/`, request)
    })

    it('Test the create function without a cached version and an unsuccessful response.', async () => {
        setup(false, 200, 'Just some test body.', false)
        const eventStub = createEventStub()
        await RequestHandler.handleRequest(eventStub)
        sandbox.assert.calledWithExactly(matchStub, request.url)
        sandbox.assert.calledWithExactly(fetchStub, `${global.S3_URL}${TEST_PATH}`, request)
        sandbox.assert.notCalled(contentTypeStub)
        sandbox.assert.notCalled(defaultHeadersStub)
        sandbox.assert.notCalled(eventStub.waitUntil)
        sandbox.assert.called(noCacheHeaderStub)
        sandbox.assert.neverCalledWithMatch(fetchStub, `${global.S3_URL}/404/`, request)
    })

    it('Test the create function with a cached version.', async () => {
        setup(true, 200, 'Just some test body.', true)
        const eventStub = createEventStub()
        await RequestHandler.handleRequest(eventStub)
        sandbox.assert.calledWithExactly(matchStub, request.url)
        sandbox.assert.neverCalledWithMatch(fetchStub, `${global.S3_URL}${TEST_PATH}`, request)
        sandbox.assert.notCalled(contentTypeStub)
        sandbox.assert.notCalled(defaultHeadersStub)
        sandbox.assert.notCalled(eventStub.waitUntil)
        sandbox.assert.notCalled(noCacheHeaderStub)
        sandbox.assert.neverCalledWithMatch(fetchStub, `${global.S3_URL}/404/`, request)
    })

    it('Test the create function with a null response.', async () => {
        setup(false, 404, 'Just some test body.', true)
        const eventStub = createEventStub()
        await RequestHandler.handleRequest(eventStub)
        sandbox.assert.calledWithExactly(matchStub, request.url)
        sandbox.assert.calledWithExactly(fetchStub, `${global.S3_URL}${TEST_PATH}`, request)
        sandbox.assert.notCalled(contentTypeStub)
        sandbox.assert.notCalled(defaultHeadersStub)
        sandbox.assert.notCalled(eventStub.waitUntil)
        sandbox.assert.notCalled(noCacheHeaderStub)
        sandbox.assert.calledWithExactly(fetchStub, `${global.S3_URL}/404/`, request)
    })

    it('Test the create function with an error.', async () => {
        setup(true, 200, 'Just some test body.', true)
        matchStub.rejects(new Error('Test Error'))
        const eventStub = createEventStub()
        await RequestHandler.handleRequest(eventStub)
        sandbox.assert.calledWithExactly(matchStub, request.url)
        sandbox.assert.notCalled(fetchStub)
        sandbox.assert.notCalled(contentTypeStub)
        sandbox.assert.notCalled(defaultHeadersStub)
        sandbox.assert.notCalled(eventStub.waitUntil)
        sandbox.assert.notCalled(noCacheHeaderStub)
        sandbox.assert.neverCalledWithMatch(fetchStub, `${global.S3_URL}/404/`, request)
    })
})

const setup = (fromCache, statusCode, text, okStatus) => {
    fetchStub = sandbox.stub()
    matchStub = sandbox.stub()
    putStub = sandbox.stub()
    global.Response = MockedResponse
    global.caches = { default: { match: matchStub, put: putStub } }
    global.fetch = fetchStub
    if (fromCache) {
        matchStub.resolves(createMockedResponse(statusCode, text, okStatus))
    } else {
        matchStub.resolves(createMockedResponse(statusCode, text, false))
    }

    let mockedResponse = createMockedResponse(statusCode, text, okStatus)

    if (statusCode === 404) {
        mockedResponse = null
    }
    fetchStub.withArgs(`${global.S3_URL}${TEST_PATH}`, request).resolves(mockedResponse)
}

const createMockedResponse = (responseStatusCode, responseText, okStatus) => {
    text = responseText
    statusCode = responseStatusCode
    return { ok: okStatus, statusCode: statusCode, text: () => text, clone: () => new MockedResponse() }
}

const createEventStub = () => { return { request: request, waitUntil: waitUntilStub } }

class MockedResponse {
    constructor() {
        this.statusCode = statusCode
    }

    clone() {
        return this
    }

    text() {
        return text
    }
}