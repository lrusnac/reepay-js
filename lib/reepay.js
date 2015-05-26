var merge = require('yields/merge');
var type = require('component/type');
var qs = require('visionmedia/node-querystring');
var jsonp = require('webmodules/jsonp');
var version = require('./version');
var errors = require('./errors');




/**
 * Default configuration values.
 *
 * currency: ISO 4217
 * timeout: API request timeout in ms
 * publicKey: Reepay site public key
 * cors: Whether to use XHR2/XDR+CORS over jsonp for API requests
 * api: URL of API
 *
 * @private
 * @type {Object}
 */

var defaults = {
    currency: 'EUR',
    timeout: 60000,
    publicKey: '',
    cors: false,
    api: 'https://card.reepay.com/v1/token'
};

module.exports = Reepay;


function Reepay(options) {
    this.id = 0;
    this.version = version;
    this.configured = false;
    this.config = merge({}, defaults);
    if (options) this.configure(options);
}


/**
 * Configure settings.
 *
 * @param {String|Object} options Either publicKey or object containing
 *                                publicKey and other optional members
 * @param {String} options.publicKey
 * @param {String} [options.currency]
 * @param {String} [options.api]
 * @public
 */

Reepay.prototype.configure = function (options) {
    if (this.configured) throw errors('already-configured');

    if (type(options) === 'string') options = {
        publicKey: options
    };

    if (options.publicKey) {
        this.config.publicKey = options.publicKey;
    } else {
        throw errors('missing-public-key');
    }

    if (options.api) {
        this.config.api = options.api;
    }

    if (options.cors) {
        this.config.cors = options.cors;
    }

    if (options.currency) {
        this.config.currency = options.currency;
    }

    this.config.required = options.required || [];

    this.configured = true;
};

/**
 * Assembles the API endpoint.
 *
 * @return {String} route
 * @private
 */

Reepay.prototype.url = function (route) {
    return this.config.api + route;
};

/**
 * Issues an API request.
 *
 * @param {String} method
 * @param {String} route
 * @param {Object} [data]
 * @param {Function} done
 * @throws {Error} If `configure` has not been called.
 * @private
 */

Reepay.prototype.request = function (method, route, data, done) {


    if (false === this.configured) {
        throw errors('not-configured');
    }

    if ('function' == type(data)) {
        done = data;
        data = {};
    }

    data.version = this.version;
    data.key = this.config.publicKey;

    if (this.config.cors) {
        return this.xhr(method, route, data, done);
    } else {
        return this.jsonp(route, data, done);
    }
};

/**
 * Issues an API request over xhr.
 *
 * @param {String} method
 * @param {String} route
 * @param {Object} [data]
 * @param {Function} done
 * @private
 */

Reepay.prototype.xhr = function (method, route, data, done) {

    var req = new XHR;
    var url = this.url(route);
    var payload = qs.stringify(data);

    if (method === 'get') {
        url += '?' + payload;
    }

    req.open(method, url);
    req.timeout = this.config.timeout;
    req.ontimeout = function () {
        done(errors('api-timeout'));
    };
    req.onerror = function () {
        done(errors('api-error'));
    };
    req.onprogress = function () {};
    req.onload = function () {
        try {
            var res = json.parse(this.responseText);
        } catch (e) {
            return done(errors('api-error', {
                message: 'There was a problem parsing the API response.'
            }));
        }

        if (res && res.error) {
            done(errors('api-error', res.error));
        } else {
            done(null, res);
        }
    };

    if (method === 'post') {
        // only available in XHR2 -- otherwise we are using XDR and cannot set Content-type
        if (req.setRequestHeader) {
            req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        }
        req.send(payload);
    } else {
        req.send();
    }
};

/**
 * Issues an API request over jsonp.
 *
 * @param {String} route
 * @param {Object} [data]
 * @param {Function} done
 * @private
 */

Reepay.prototype.jsonp = function (route, data, done) {

    var url = this.url(route) + '?' + qs.stringify(data);

    jsonp(url, {
        timeout: this.config.timeout
    }, function (err, res) {
        if (err) return done(err);
        if (res.error) {
            done(errors('api-error', res.error));
        } else {
            done(null, res);
        }
    });
};


Reepay.prototype.open = require('./reepay/open');
Reepay.prototype.token = require('./reepay/token');
Reepay.prototype.validate = require('./reepay/validate');