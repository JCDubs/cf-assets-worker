'use strict'
const RequestHandler = require('./RequestHandler')
addEventListener('fetch', event => event.respondWith(RequestHandler.handleRequest(event)))