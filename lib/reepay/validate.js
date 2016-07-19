/* !
 * Module dependencies.
 */
var trim = require('component/trim:index.js');
var index = require('component/indexof:index.js');
var parseCard = require('../util/parse-card');

var formatCardNumberCallback = null;

// Cards types
defaultFormat = /(\d{1,4})/g;

cards = [
    {
        type: 'amex',
        pattern: /^3[47]/,
        format: /(\d{1,4})(\d{1,6})?(\d{1,5})?/,
        length: [15],
        cvcLength: [3, 4],
        luhn: true
  }, {
        type: 'dankort',
        pattern: /^5019/,
        format: defaultFormat,
        length: [16],
        cvcLength: [3],
        luhn: true
  }, {
        type: 'dinersclub',
        pattern: /^(36|38|30[0-5])/,
        format: defaultFormat,
        length: [14],
        cvcLength: [3],
        luhn: true
  }, {
        type: 'discover',
        pattern: /^(6011|65|64[4-9]|622)/,
        format: defaultFormat,
        length: [16],
        cvcLength: [3],
        luhn: true
  }, {
        type: 'jcb',
        pattern: /^35/,
        format: defaultFormat,
        length: [16],
        cvcLength: [3],
        luhn: true
  }, {
        type: 'laser',
        pattern: /^(6706|6771|6709)/,
        format: defaultFormat,
        length: [16, 17, 18, 19],
        cvcLength: [3],
        luhn: true
  }, {
        type: 'maestro',
        pattern: /^(5018|5020|5038|6304|6759|676[1-3])/,
        format: defaultFormat,
        length: [12, 13, 14, 15, 16, 17, 18, 19],
        cvcLength: [3],
        luhn: true
  }, {
        type: 'mastercard',
        pattern: /^5[1-5]/,
        format: defaultFormat,
        length: [16],
        cvcLength: [3],
        luhn: true
  }, {
        type: 'unionpay',
        pattern: /^62/,
        format: defaultFormat,
        length: [16, 17, 18, 19],
        cvcLength: [3],
        luhn: false
  }, {
        type: 'visaelectron',
        pattern: /^4(026|17500|405|508|844|91[37])/,
        format: defaultFormat,
        length: [16],
        cvcLength: [3],
        luhn: true
  }, {
        type: 'visa',
        pattern: /^4/,
        format: defaultFormat,
        length: [13, 14, 15, 16],
        cvcLength: [3],
        luhn: true
  }
];


var options = null;

cardFromNumber = function (num) {
    var card, _i, _len;
    num = (num + '').replace(/\D/g, '');
    for (_i = 0, _len = cards.length; _i < _len; _i++) {
        card = cards[_i];
        if (card.pattern.test(num)) {
            return card;
        }
    }
};

formatCardNumber = function (e) {


    var card, digit, groups, upperLength, _ref, num;
    digit = String.fromCharCode(e.which);
    element = e.target;
    value = $(element).val();
    num = value + digit;

    if (!/^\d+$/.test(digit)) {
        return;
    }

    card = cardFromNumber(num);
    if (!card) {
        return value + digit;
    }

    upperLength = card.length[card.length.length - 1];
    num = num.replace(/\D/g, '');
    num = num.slice(0, +upperLength || 9e9);
    if (card.format.global) {
        var val = (_ref = num.match(card.format)) != null ? _ref.join(' ') : void 0;
        $(element).val(val);
    } else {
        groups = card.format.exec(num);
        if (groups != null) {
            groups.shift();
        }
        return groups != null ? groups.join(' ') : void 0;
    }

    e.preventDefault();
    if (formatCardNumberCallback != null) {
        formatCardNumberCallback(card);
    }



}


module.exports = {

    /**
     * Format card number and check it on every keystroke.
     *
     * @param {String}
     * @param {Function}
     * @return callback data
     */
    formatCardNumber: function (element, callback) {
        formatCardNumberCallback = callback;
        $(element).keypress(formatCardNumber);
    },
    /**
     * Validates a credit card number via luhn algorithm.
     *
     * @param {Number|String} number The card number.
     * @return {Boolean}
     * @see https://sites.google.com/site/abapexamples/javascript/luhn-validation
     */

    cardNumber: function (number) {
        var str = parseCard(number);
        var ca, sum = 0,
            mul = 1;
        var i = str.length;

        while (i--) {
            ca = parseInt(str.charAt(i), 10) * mul;
            sum += ca - (ca > 9) * 9;
            mul ^= 3;
        }

        return sum % 10 === 0 && sum > 0;
    },
    /**
     * Returns the type of the card number as a string.
     *
     * @param {Number|String} number The card number
     * @param {Boolean} partial detect card type on a partial (incomplete) number
     * @return {String} card type
     */

    cardType: function (num) {
        var card, _i, _len;
        num = (num + '').replace(/\D/g, '');
        for (_i = 0, _len = cards.length; _i < _len; _i++) {
            card = cards[_i];
            if (card.pattern.test(num)) {
                return card.type;
            }
        }
    },
    /**
     * Validates whether an expiry month is present or future.
     *
     * @param {Numer|String} month The 2 digit month
     * @param {Numer|String} year The 2 or 4 digit year
     * @return {Boolean}
     */

    expiry: function (month, year) {
        month = parseInt(month, 10) - 1;
        if (month < 0 || month > 11) return false;
        year = parseInt(year, 10);
        year += year < 100 ? 2000 : 0;

        var expiry = new Date;
        expiry.setYear(year);
        expiry.setDate(1);
        expiry.setHours(0);
        expiry.setMinutes(0);
        expiry.setSeconds(0);
        expiry.setMonth(month + 1);
        return new Date < expiry;
    },
    /**
     * Validates whether a number looks like a cvv.
     *
     * e.g.: '123', '0321'
     *
     * @param {Number|String} number The card verification value
     * @return {Boolean}
     */

    cvv: function (number) {
        number = trim(number + '');
        return /^\d+$/.test(number) && (number.length === 3 || number.length === 4);
    }
};
