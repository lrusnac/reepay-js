/*!
 * Module dependencies.
 */

var type = require('component/type:index.js');
var qs = require('visionmedia/node-querystring:index.js');
var errors = require('../errors');

/**
 * expose
 */

module.exports = open;

/**
 * Issues an API request to a popup window.
 *
 * TODO(*): configurable window name?
 * TODO(*): configurable window properties?
 *
 * @param {String} url
 * @param {Object} [data]
 * @param {Function} [done]
 * @throws {Error} If `configure` has not been called.
 * @return {Window}
 * @private
 */

function open(url, data, done) {

    if (false === this.configured) {
        throw errors('not-configured');
    }

    if ('function' == type(data)) {
        done = data;
        data = {};
    }

    data = data || {};
    data.version = this.version;
    data.event = 'reepay-open-' + this.id++;
    data.key = this.config.publicKey;
    this.once(data.event, done);

    if (!/^https?:\/\//.test(url)) url = this.url(url);
    url += (~url.indexOf('?') ? '&' : '?') + qs.stringify(data);

    this.relay(function () {
        window.open(url);
    });
};
