/**
 * dependencies
 */

var mixin = require('kewah/mixin');

/**
 * Export `errors`.
 */

module.exports = exports = errors;

/**
 * Error accessor.
 *
 * @param {String} name
 * @param {Object} options
 * @return {Error}
 */

function errors(name, options) {
    return errors.get(name, options);
}

/**
 * Defined errors.
 *
 * @type {Object}
 * @private
 */

errors.map = {};

/**
 * Base url for documention.
 *
 * @type {String}
 * @private
 */

errors.baseURL = '';

/**
 * Sets the `baseURL` for docs.
 *
 * @param {String} url
 * @public
 */

errors.doc = function (baseURL) {
    errors.baseURL = baseURL;
};

/**
 * Gets errors defined by `name`.
 *
 * @param {String} name
 * @param {Object} context
 * @return {Error}
 * @public
 */

errors.get = function (name, context) {
    if (!(name in errors.map)) {
        throw new Error('invalid error');
    } else {
        return new errors.map[name](context);
    }
};

/**
 * Registers an error defined by `name` with `config`.
 *
 * @param {String} name
 * @param {Object} config
 * @return {Error}
 * @public
 */

errors.add = function (name, config) {
    config = config || {};

    function ReepayError(context) {
        Error.call(this);

        this.name = this.code = name;
        this.message = config.message;
        mixin(this, context || {});

        if (config.help) {
            this.help = errors.baseURL + config.help;
            this.message += ' (need help? ' + this.help + ')';
        }
    };

    ReepayError.prototype = new Error();
    return errors.map[name] = ReepayError;
};

/**
 * Internal definations.
 *
 * TODO(gjohnson): open source this as a component
 * and move these out.
 */

errors.doc('https://docs.reepay.com/js');

errors.add('already-configured', {
    message: 'Configuration may only be set once.',
    help: '#identify-your-site'
});

errors.add('not-configured', {
    message: 'Not configured. You must first call reepay.configure().',
    help: '#identify-your-site'
});

errors.add('missing-public-key', {
    message: 'The publicKey setting is required.',
    help: '#identify-your-site'
});

errors.add('api-error', {
    message: 'There was an error with your request.'
});

errors.add('api-timeout', {
    message: 'The API request timed out.'
});

errors.add('validation', {
    message: 'There was an error validating your request.'
});

errors.add('missing-callback', {
    message: 'Missing callback'
});

errors.add('invalid-options', {
    message: 'Options must be an object'
});

errors.add('missing-plan', {
    message: 'A plan must be specified.'
});

errors.add('missing-coupon', {
    message: 'A coupon must be specified.'
});

errors.add('invalid-item', {
    message: 'The given item does not appear to be a valid reepay plan, coupon, addon, or taxable address.'
});

errors.add('invalid-addon', {
    message: 'The given addon_code is not among the valid addons for the specified plan.'
});

errors.add('invalid-currency', {
    message: 'The given currency is not among the valid codes for the specified plan.'
});

errors.add('unremovable-item', {
    message: 'The given item cannot be removed.'
});

errors.add('credit_card_expired', {
    message: 'The given card is expired.'
});

errors.add('insufficient_funds', {
    message: 'Insufficient funds for transaction.'
});

errors.add('declined_by_acquirer', {
    message: 'Declined by acquirer.'
});

errors.add('acquirer_communication_error', {
    message: 'Acquirer communication error.'
});

errors.add('acquirer_authentication_error', {
    message: 'Acquirer authentication error.'
});

errors.add('card_identifier_not_found', {
    message: 'Invalid card identifier.'
});

errors.add('refund_amount_too_high', {
    message: 'The refund amount is too high.'
});

errors.add('credit_card_lost_or_stolen', {
    message: 'Card marked as lost or stolen.'
});

errors.add('credit_card_suspected_fraud', {
    message: 'Suspected fraud on given card.'
});

errors.add('card-type-not-supported', {
    message: 'Card type not supported.'
});
