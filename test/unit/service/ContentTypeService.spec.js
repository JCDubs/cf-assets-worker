'use strict'

const ContentTypeService = require('../../../src/service/ContentTypeService')
const chai = require('chai')
const expect = chai.expect

describe('ContentTypeService Tests', () => {

    it('getContentType called with a .js file pathname returns correct content-type', async () => {
        const url = {
            pathname: 'bar.js'
        }
        expect(ContentTypeService.getContentType(url)).to.equal('application/javascript')
    })

    it('getContentType called with a .json file pathname returns correct content-type', async () => {
        const url = {
            pathname: 'potato.json'
        }
        expect(ContentTypeService.getContentType(url)).to.equal('application/json')
    })
})
