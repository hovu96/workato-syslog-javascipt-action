(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.index || (g.index = {})).js = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
//! moment.js
//! version : 2.29.1
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com

;(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    global.moment = factory()
}(this, (function () { 'use strict';

    var hookCallback;

    function hooks() {
        return hookCallback.apply(null, arguments);
    }

    // This is done to register the method called with moment()
    // without creating circular dependencies.
    function setHookCallback(callback) {
        hookCallback = callback;
    }

    function isArray(input) {
        return (
            input instanceof Array ||
            Object.prototype.toString.call(input) === '[object Array]'
        );
    }

    function isObject(input) {
        // IE8 will treat undefined and null as object if it wasn't for
        // input != null
        return (
            input != null &&
            Object.prototype.toString.call(input) === '[object Object]'
        );
    }

    function hasOwnProp(a, b) {
        return Object.prototype.hasOwnProperty.call(a, b);
    }

    function isObjectEmpty(obj) {
        if (Object.getOwnPropertyNames) {
            return Object.getOwnPropertyNames(obj).length === 0;
        } else {
            var k;
            for (k in obj) {
                if (hasOwnProp(obj, k)) {
                    return false;
                }
            }
            return true;
        }
    }

    function isUndefined(input) {
        return input === void 0;
    }

    function isNumber(input) {
        return (
            typeof input === 'number' ||
            Object.prototype.toString.call(input) === '[object Number]'
        );
    }

    function isDate(input) {
        return (
            input instanceof Date ||
            Object.prototype.toString.call(input) === '[object Date]'
        );
    }

    function map(arr, fn) {
        var res = [],
            i;
        for (i = 0; i < arr.length; ++i) {
            res.push(fn(arr[i], i));
        }
        return res;
    }

    function extend(a, b) {
        for (var i in b) {
            if (hasOwnProp(b, i)) {
                a[i] = b[i];
            }
        }

        if (hasOwnProp(b, 'toString')) {
            a.toString = b.toString;
        }

        if (hasOwnProp(b, 'valueOf')) {
            a.valueOf = b.valueOf;
        }

        return a;
    }

    function createUTC(input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, true).utc();
    }

    function defaultParsingFlags() {
        // We need to deep clone this object.
        return {
            empty: false,
            unusedTokens: [],
            unusedInput: [],
            overflow: -2,
            charsLeftOver: 0,
            nullInput: false,
            invalidEra: null,
            invalidMonth: null,
            invalidFormat: false,
            userInvalidated: false,
            iso: false,
            parsedDateParts: [],
            era: null,
            meridiem: null,
            rfc2822: false,
            weekdayMismatch: false,
        };
    }

    function getParsingFlags(m) {
        if (m._pf == null) {
            m._pf = defaultParsingFlags();
        }
        return m._pf;
    }

    var some;
    if (Array.prototype.some) {
        some = Array.prototype.some;
    } else {
        some = function (fun) {
            var t = Object(this),
                len = t.length >>> 0,
                i;

            for (i = 0; i < len; i++) {
                if (i in t && fun.call(this, t[i], i, t)) {
                    return true;
                }
            }

            return false;
        };
    }

    function isValid(m) {
        if (m._isValid == null) {
            var flags = getParsingFlags(m),
                parsedParts = some.call(flags.parsedDateParts, function (i) {
                    return i != null;
                }),
                isNowValid =
                    !isNaN(m._d.getTime()) &&
                    flags.overflow < 0 &&
                    !flags.empty &&
                    !flags.invalidEra &&
                    !flags.invalidMonth &&
                    !flags.invalidWeekday &&
                    !flags.weekdayMismatch &&
                    !flags.nullInput &&
                    !flags.invalidFormat &&
                    !flags.userInvalidated &&
                    (!flags.meridiem || (flags.meridiem && parsedParts));

            if (m._strict) {
                isNowValid =
                    isNowValid &&
                    flags.charsLeftOver === 0 &&
                    flags.unusedTokens.length === 0 &&
                    flags.bigHour === undefined;
            }

            if (Object.isFrozen == null || !Object.isFrozen(m)) {
                m._isValid = isNowValid;
            } else {
                return isNowValid;
            }
        }
        return m._isValid;
    }

    function createInvalid(flags) {
        var m = createUTC(NaN);
        if (flags != null) {
            extend(getParsingFlags(m), flags);
        } else {
            getParsingFlags(m).userInvalidated = true;
        }

        return m;
    }

    // Plugins that add properties should also add the key here (null value),
    // so we can properly clone ourselves.
    var momentProperties = (hooks.momentProperties = []),
        updateInProgress = false;

    function copyConfig(to, from) {
        var i, prop, val;

        if (!isUndefined(from._isAMomentObject)) {
            to._isAMomentObject = from._isAMomentObject;
        }
        if (!isUndefined(from._i)) {
            to._i = from._i;
        }
        if (!isUndefined(from._f)) {
            to._f = from._f;
        }
        if (!isUndefined(from._l)) {
            to._l = from._l;
        }
        if (!isUndefined(from._strict)) {
            to._strict = from._strict;
        }
        if (!isUndefined(from._tzm)) {
            to._tzm = from._tzm;
        }
        if (!isUndefined(from._isUTC)) {
            to._isUTC = from._isUTC;
        }
        if (!isUndefined(from._offset)) {
            to._offset = from._offset;
        }
        if (!isUndefined(from._pf)) {
            to._pf = getParsingFlags(from);
        }
        if (!isUndefined(from._locale)) {
            to._locale = from._locale;
        }

        if (momentProperties.length > 0) {
            for (i = 0; i < momentProperties.length; i++) {
                prop = momentProperties[i];
                val = from[prop];
                if (!isUndefined(val)) {
                    to[prop] = val;
                }
            }
        }

        return to;
    }

    // Moment prototype object
    function Moment(config) {
        copyConfig(this, config);
        this._d = new Date(config._d != null ? config._d.getTime() : NaN);
        if (!this.isValid()) {
            this._d = new Date(NaN);
        }
        // Prevent infinite loop in case updateOffset creates new moment
        // objects.
        if (updateInProgress === false) {
            updateInProgress = true;
            hooks.updateOffset(this);
            updateInProgress = false;
        }
    }

    function isMoment(obj) {
        return (
            obj instanceof Moment || (obj != null && obj._isAMomentObject != null)
        );
    }

    function warn(msg) {
        if (
            hooks.suppressDeprecationWarnings === false &&
            typeof console !== 'undefined' &&
            console.warn
        ) {
            console.warn('Deprecation warning: ' + msg);
        }
    }

    function deprecate(msg, fn) {
        var firstTime = true;

        return extend(function () {
            if (hooks.deprecationHandler != null) {
                hooks.deprecationHandler(null, msg);
            }
            if (firstTime) {
                var args = [],
                    arg,
                    i,
                    key;
                for (i = 0; i < arguments.length; i++) {
                    arg = '';
                    if (typeof arguments[i] === 'object') {
                        arg += '\n[' + i + '] ';
                        for (key in arguments[0]) {
                            if (hasOwnProp(arguments[0], key)) {
                                arg += key + ': ' + arguments[0][key] + ', ';
                            }
                        }
                        arg = arg.slice(0, -2); // Remove trailing comma and space
                    } else {
                        arg = arguments[i];
                    }
                    args.push(arg);
                }
                warn(
                    msg +
                        '\nArguments: ' +
                        Array.prototype.slice.call(args).join('') +
                        '\n' +
                        new Error().stack
                );
                firstTime = false;
            }
            return fn.apply(this, arguments);
        }, fn);
    }

    var deprecations = {};

    function deprecateSimple(name, msg) {
        if (hooks.deprecationHandler != null) {
            hooks.deprecationHandler(name, msg);
        }
        if (!deprecations[name]) {
            warn(msg);
            deprecations[name] = true;
        }
    }

    hooks.suppressDeprecationWarnings = false;
    hooks.deprecationHandler = null;

    function isFunction(input) {
        return (
            (typeof Function !== 'undefined' && input instanceof Function) ||
            Object.prototype.toString.call(input) === '[object Function]'
        );
    }

    function set(config) {
        var prop, i;
        for (i in config) {
            if (hasOwnProp(config, i)) {
                prop = config[i];
                if (isFunction(prop)) {
                    this[i] = prop;
                } else {
                    this['_' + i] = prop;
                }
            }
        }
        this._config = config;
        // Lenient ordinal parsing accepts just a number in addition to
        // number + (possibly) stuff coming from _dayOfMonthOrdinalParse.
        // TODO: Remove "ordinalParse" fallback in next major release.
        this._dayOfMonthOrdinalParseLenient = new RegExp(
            (this._dayOfMonthOrdinalParse.source || this._ordinalParse.source) +
                '|' +
                /\d{1,2}/.source
        );
    }

    function mergeConfigs(parentConfig, childConfig) {
        var res = extend({}, parentConfig),
            prop;
        for (prop in childConfig) {
            if (hasOwnProp(childConfig, prop)) {
                if (isObject(parentConfig[prop]) && isObject(childConfig[prop])) {
                    res[prop] = {};
                    extend(res[prop], parentConfig[prop]);
                    extend(res[prop], childConfig[prop]);
                } else if (childConfig[prop] != null) {
                    res[prop] = childConfig[prop];
                } else {
                    delete res[prop];
                }
            }
        }
        for (prop in parentConfig) {
            if (
                hasOwnProp(parentConfig, prop) &&
                !hasOwnProp(childConfig, prop) &&
                isObject(parentConfig[prop])
            ) {
                // make sure changes to properties don't modify parent config
                res[prop] = extend({}, res[prop]);
            }
        }
        return res;
    }

    function Locale(config) {
        if (config != null) {
            this.set(config);
        }
    }

    var keys;

    if (Object.keys) {
        keys = Object.keys;
    } else {
        keys = function (obj) {
            var i,
                res = [];
            for (i in obj) {
                if (hasOwnProp(obj, i)) {
                    res.push(i);
                }
            }
            return res;
        };
    }

    var defaultCalendar = {
        sameDay: '[Today at] LT',
        nextDay: '[Tomorrow at] LT',
        nextWeek: 'dddd [at] LT',
        lastDay: '[Yesterday at] LT',
        lastWeek: '[Last] dddd [at] LT',
        sameElse: 'L',
    };

    function calendar(key, mom, now) {
        var output = this._calendar[key] || this._calendar['sameElse'];
        return isFunction(output) ? output.call(mom, now) : output;
    }

    function zeroFill(number, targetLength, forceSign) {
        var absNumber = '' + Math.abs(number),
            zerosToFill = targetLength - absNumber.length,
            sign = number >= 0;
        return (
            (sign ? (forceSign ? '+' : '') : '-') +
            Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) +
            absNumber
        );
    }

    var formattingTokens = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|N{1,5}|YYYYYY|YYYYY|YYYY|YY|y{2,4}|yo?|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g,
        localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,
        formatFunctions = {},
        formatTokenFunctions = {};

    // token:    'M'
    // padded:   ['MM', 2]
    // ordinal:  'Mo'
    // callback: function () { this.month() + 1 }
    function addFormatToken(token, padded, ordinal, callback) {
        var func = callback;
        if (typeof callback === 'string') {
            func = function () {
                return this[callback]();
            };
        }
        if (token) {
            formatTokenFunctions[token] = func;
        }
        if (padded) {
            formatTokenFunctions[padded[0]] = function () {
                return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
            };
        }
        if (ordinal) {
            formatTokenFunctions[ordinal] = function () {
                return this.localeData().ordinal(
                    func.apply(this, arguments),
                    token
                );
            };
        }
    }

    function removeFormattingTokens(input) {
        if (input.match(/\[[\s\S]/)) {
            return input.replace(/^\[|\]$/g, '');
        }
        return input.replace(/\\/g, '');
    }

    function makeFormatFunction(format) {
        var array = format.match(formattingTokens),
            i,
            length;

        for (i = 0, length = array.length; i < length; i++) {
            if (formatTokenFunctions[array[i]]) {
                array[i] = formatTokenFunctions[array[i]];
            } else {
                array[i] = removeFormattingTokens(array[i]);
            }
        }

        return function (mom) {
            var output = '',
                i;
            for (i = 0; i < length; i++) {
                output += isFunction(array[i])
                    ? array[i].call(mom, format)
                    : array[i];
            }
            return output;
        };
    }

    // format date using native date object
    function formatMoment(m, format) {
        if (!m.isValid()) {
            return m.localeData().invalidDate();
        }

        format = expandFormat(format, m.localeData());
        formatFunctions[format] =
            formatFunctions[format] || makeFormatFunction(format);

        return formatFunctions[format](m);
    }

    function expandFormat(format, locale) {
        var i = 5;

        function replaceLongDateFormatTokens(input) {
            return locale.longDateFormat(input) || input;
        }

        localFormattingTokens.lastIndex = 0;
        while (i >= 0 && localFormattingTokens.test(format)) {
            format = format.replace(
                localFormattingTokens,
                replaceLongDateFormatTokens
            );
            localFormattingTokens.lastIndex = 0;
            i -= 1;
        }

        return format;
    }

    var defaultLongDateFormat = {
        LTS: 'h:mm:ss A',
        LT: 'h:mm A',
        L: 'MM/DD/YYYY',
        LL: 'MMMM D, YYYY',
        LLL: 'MMMM D, YYYY h:mm A',
        LLLL: 'dddd, MMMM D, YYYY h:mm A',
    };

    function longDateFormat(key) {
        var format = this._longDateFormat[key],
            formatUpper = this._longDateFormat[key.toUpperCase()];

        if (format || !formatUpper) {
            return format;
        }

        this._longDateFormat[key] = formatUpper
            .match(formattingTokens)
            .map(function (tok) {
                if (
                    tok === 'MMMM' ||
                    tok === 'MM' ||
                    tok === 'DD' ||
                    tok === 'dddd'
                ) {
                    return tok.slice(1);
                }
                return tok;
            })
            .join('');

        return this._longDateFormat[key];
    }

    var defaultInvalidDate = 'Invalid date';

    function invalidDate() {
        return this._invalidDate;
    }

    var defaultOrdinal = '%d',
        defaultDayOfMonthOrdinalParse = /\d{1,2}/;

    function ordinal(number) {
        return this._ordinal.replace('%d', number);
    }

    var defaultRelativeTime = {
        future: 'in %s',
        past: '%s ago',
        s: 'a few seconds',
        ss: '%d seconds',
        m: 'a minute',
        mm: '%d minutes',
        h: 'an hour',
        hh: '%d hours',
        d: 'a day',
        dd: '%d days',
        w: 'a week',
        ww: '%d weeks',
        M: 'a month',
        MM: '%d months',
        y: 'a year',
        yy: '%d years',
    };

    function relativeTime(number, withoutSuffix, string, isFuture) {
        var output = this._relativeTime[string];
        return isFunction(output)
            ? output(number, withoutSuffix, string, isFuture)
            : output.replace(/%d/i, number);
    }

    function pastFuture(diff, output) {
        var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
        return isFunction(format) ? format(output) : format.replace(/%s/i, output);
    }

    var aliases = {};

    function addUnitAlias(unit, shorthand) {
        var lowerCase = unit.toLowerCase();
        aliases[lowerCase] = aliases[lowerCase + 's'] = aliases[shorthand] = unit;
    }

    function normalizeUnits(units) {
        return typeof units === 'string'
            ? aliases[units] || aliases[units.toLowerCase()]
            : undefined;
    }

    function normalizeObjectUnits(inputObject) {
        var normalizedInput = {},
            normalizedProp,
            prop;

        for (prop in inputObject) {
            if (hasOwnProp(inputObject, prop)) {
                normalizedProp = normalizeUnits(prop);
                if (normalizedProp) {
                    normalizedInput[normalizedProp] = inputObject[prop];
                }
            }
        }

        return normalizedInput;
    }

    var priorities = {};

    function addUnitPriority(unit, priority) {
        priorities[unit] = priority;
    }

    function getPrioritizedUnits(unitsObj) {
        var units = [],
            u;
        for (u in unitsObj) {
            if (hasOwnProp(unitsObj, u)) {
                units.push({ unit: u, priority: priorities[u] });
            }
        }
        units.sort(function (a, b) {
            return a.priority - b.priority;
        });
        return units;
    }

    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    function absFloor(number) {
        if (number < 0) {
            // -0 -> 0
            return Math.ceil(number) || 0;
        } else {
            return Math.floor(number);
        }
    }

    function toInt(argumentForCoercion) {
        var coercedNumber = +argumentForCoercion,
            value = 0;

        if (coercedNumber !== 0 && isFinite(coercedNumber)) {
            value = absFloor(coercedNumber);
        }

        return value;
    }

    function makeGetSet(unit, keepTime) {
        return function (value) {
            if (value != null) {
                set$1(this, unit, value);
                hooks.updateOffset(this, keepTime);
                return this;
            } else {
                return get(this, unit);
            }
        };
    }

    function get(mom, unit) {
        return mom.isValid()
            ? mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]()
            : NaN;
    }

    function set$1(mom, unit, value) {
        if (mom.isValid() && !isNaN(value)) {
            if (
                unit === 'FullYear' &&
                isLeapYear(mom.year()) &&
                mom.month() === 1 &&
                mom.date() === 29
            ) {
                value = toInt(value);
                mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](
                    value,
                    mom.month(),
                    daysInMonth(value, mom.month())
                );
            } else {
                mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
            }
        }
    }

    // MOMENTS

    function stringGet(units) {
        units = normalizeUnits(units);
        if (isFunction(this[units])) {
            return this[units]();
        }
        return this;
    }

    function stringSet(units, value) {
        if (typeof units === 'object') {
            units = normalizeObjectUnits(units);
            var prioritized = getPrioritizedUnits(units),
                i;
            for (i = 0; i < prioritized.length; i++) {
                this[prioritized[i].unit](units[prioritized[i].unit]);
            }
        } else {
            units = normalizeUnits(units);
            if (isFunction(this[units])) {
                return this[units](value);
            }
        }
        return this;
    }

    var match1 = /\d/, //       0 - 9
        match2 = /\d\d/, //      00 - 99
        match3 = /\d{3}/, //     000 - 999
        match4 = /\d{4}/, //    0000 - 9999
        match6 = /[+-]?\d{6}/, // -999999 - 999999
        match1to2 = /\d\d?/, //       0 - 99
        match3to4 = /\d\d\d\d?/, //     999 - 9999
        match5to6 = /\d\d\d\d\d\d?/, //   99999 - 999999
        match1to3 = /\d{1,3}/, //       0 - 999
        match1to4 = /\d{1,4}/, //       0 - 9999
        match1to6 = /[+-]?\d{1,6}/, // -999999 - 999999
        matchUnsigned = /\d+/, //       0 - inf
        matchSigned = /[+-]?\d+/, //    -inf - inf
        matchOffset = /Z|[+-]\d\d:?\d\d/gi, // +00:00 -00:00 +0000 -0000 or Z
        matchShortOffset = /Z|[+-]\d\d(?::?\d\d)?/gi, // +00 -00 +00:00 -00:00 +0000 -0000 or Z
        matchTimestamp = /[+-]?\d+(\.\d{1,3})?/, // 123456789 123456789.123
        // any word (or two) characters or numbers including two/three word month in arabic.
        // includes scottish gaelic two word and hyphenated months
        matchWord = /[0-9]{0,256}['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFF07\uFF10-\uFFEF]{1,256}|[\u0600-\u06FF\/]{1,256}(\s*?[\u0600-\u06FF]{1,256}){1,2}/i,
        regexes;

    regexes = {};

    function addRegexToken(token, regex, strictRegex) {
        regexes[token] = isFunction(regex)
            ? regex
            : function (isStrict, localeData) {
                  return isStrict && strictRegex ? strictRegex : regex;
              };
    }

    function getParseRegexForToken(token, config) {
        if (!hasOwnProp(regexes, token)) {
            return new RegExp(unescapeFormat(token));
        }

        return regexes[token](config._strict, config._locale);
    }

    // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
    function unescapeFormat(s) {
        return regexEscape(
            s
                .replace('\\', '')
                .replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (
                    matched,
                    p1,
                    p2,
                    p3,
                    p4
                ) {
                    return p1 || p2 || p3 || p4;
                })
        );
    }

    function regexEscape(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    var tokens = {};

    function addParseToken(token, callback) {
        var i,
            func = callback;
        if (typeof token === 'string') {
            token = [token];
        }
        if (isNumber(callback)) {
            func = function (input, array) {
                array[callback] = toInt(input);
            };
        }
        for (i = 0; i < token.length; i++) {
            tokens[token[i]] = func;
        }
    }

    function addWeekParseToken(token, callback) {
        addParseToken(token, function (input, array, config, token) {
            config._w = config._w || {};
            callback(input, config._w, config, token);
        });
    }

    function addTimeToArrayFromToken(token, input, config) {
        if (input != null && hasOwnProp(tokens, token)) {
            tokens[token](input, config._a, config, token);
        }
    }

    var YEAR = 0,
        MONTH = 1,
        DATE = 2,
        HOUR = 3,
        MINUTE = 4,
        SECOND = 5,
        MILLISECOND = 6,
        WEEK = 7,
        WEEKDAY = 8;

    function mod(n, x) {
        return ((n % x) + x) % x;
    }

    var indexOf;

    if (Array.prototype.indexOf) {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function (o) {
            // I know
            var i;
            for (i = 0; i < this.length; ++i) {
                if (this[i] === o) {
                    return i;
                }
            }
            return -1;
        };
    }

    function daysInMonth(year, month) {
        if (isNaN(year) || isNaN(month)) {
            return NaN;
        }
        var modMonth = mod(month, 12);
        year += (month - modMonth) / 12;
        return modMonth === 1
            ? isLeapYear(year)
                ? 29
                : 28
            : 31 - ((modMonth % 7) % 2);
    }

    // FORMATTING

    addFormatToken('M', ['MM', 2], 'Mo', function () {
        return this.month() + 1;
    });

    addFormatToken('MMM', 0, 0, function (format) {
        return this.localeData().monthsShort(this, format);
    });

    addFormatToken('MMMM', 0, 0, function (format) {
        return this.localeData().months(this, format);
    });

    // ALIASES

    addUnitAlias('month', 'M');

    // PRIORITY

    addUnitPriority('month', 8);

    // PARSING

    addRegexToken('M', match1to2);
    addRegexToken('MM', match1to2, match2);
    addRegexToken('MMM', function (isStrict, locale) {
        return locale.monthsShortRegex(isStrict);
    });
    addRegexToken('MMMM', function (isStrict, locale) {
        return locale.monthsRegex(isStrict);
    });

    addParseToken(['M', 'MM'], function (input, array) {
        array[MONTH] = toInt(input) - 1;
    });

    addParseToken(['MMM', 'MMMM'], function (input, array, config, token) {
        var month = config._locale.monthsParse(input, token, config._strict);
        // if we didn't find a month name, mark the date as invalid.
        if (month != null) {
            array[MONTH] = month;
        } else {
            getParsingFlags(config).invalidMonth = input;
        }
    });

    // LOCALES

    var defaultLocaleMonths = 'January_February_March_April_May_June_July_August_September_October_November_December'.split(
            '_'
        ),
        defaultLocaleMonthsShort = 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split(
            '_'
        ),
        MONTHS_IN_FORMAT = /D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/,
        defaultMonthsShortRegex = matchWord,
        defaultMonthsRegex = matchWord;

    function localeMonths(m, format) {
        if (!m) {
            return isArray(this._months)
                ? this._months
                : this._months['standalone'];
        }
        return isArray(this._months)
            ? this._months[m.month()]
            : this._months[
                  (this._months.isFormat || MONTHS_IN_FORMAT).test(format)
                      ? 'format'
                      : 'standalone'
              ][m.month()];
    }

    function localeMonthsShort(m, format) {
        if (!m) {
            return isArray(this._monthsShort)
                ? this._monthsShort
                : this._monthsShort['standalone'];
        }
        return isArray(this._monthsShort)
            ? this._monthsShort[m.month()]
            : this._monthsShort[
                  MONTHS_IN_FORMAT.test(format) ? 'format' : 'standalone'
              ][m.month()];
    }

    function handleStrictParse(monthName, format, strict) {
        var i,
            ii,
            mom,
            llc = monthName.toLocaleLowerCase();
        if (!this._monthsParse) {
            // this is not used
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
            for (i = 0; i < 12; ++i) {
                mom = createUTC([2000, i]);
                this._shortMonthsParse[i] = this.monthsShort(
                    mom,
                    ''
                ).toLocaleLowerCase();
                this._longMonthsParse[i] = this.months(mom, '').toLocaleLowerCase();
            }
        }

        if (strict) {
            if (format === 'MMM') {
                ii = indexOf.call(this._shortMonthsParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._longMonthsParse, llc);
                return ii !== -1 ? ii : null;
            }
        } else {
            if (format === 'MMM') {
                ii = indexOf.call(this._shortMonthsParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._longMonthsParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._longMonthsParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortMonthsParse, llc);
                return ii !== -1 ? ii : null;
            }
        }
    }

    function localeMonthsParse(monthName, format, strict) {
        var i, mom, regex;

        if (this._monthsParseExact) {
            return handleStrictParse.call(this, monthName, format, strict);
        }

        if (!this._monthsParse) {
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
        }

        // TODO: add sorting
        // Sorting makes sure if one month (or abbr) is a prefix of another
        // see sorting in computeMonthsParse
        for (i = 0; i < 12; i++) {
            // make the regex if we don't have it already
            mom = createUTC([2000, i]);
            if (strict && !this._longMonthsParse[i]) {
                this._longMonthsParse[i] = new RegExp(
                    '^' + this.months(mom, '').replace('.', '') + '$',
                    'i'
                );
                this._shortMonthsParse[i] = new RegExp(
                    '^' + this.monthsShort(mom, '').replace('.', '') + '$',
                    'i'
                );
            }
            if (!strict && !this._monthsParse[i]) {
                regex =
                    '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (
                strict &&
                format === 'MMMM' &&
                this._longMonthsParse[i].test(monthName)
            ) {
                return i;
            } else if (
                strict &&
                format === 'MMM' &&
                this._shortMonthsParse[i].test(monthName)
            ) {
                return i;
            } else if (!strict && this._monthsParse[i].test(monthName)) {
                return i;
            }
        }
    }

    // MOMENTS

    function setMonth(mom, value) {
        var dayOfMonth;

        if (!mom.isValid()) {
            // No op
            return mom;
        }

        if (typeof value === 'string') {
            if (/^\d+$/.test(value)) {
                value = toInt(value);
            } else {
                value = mom.localeData().monthsParse(value);
                // TODO: Another silent failure?
                if (!isNumber(value)) {
                    return mom;
                }
            }
        }

        dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
        mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
        return mom;
    }

    function getSetMonth(value) {
        if (value != null) {
            setMonth(this, value);
            hooks.updateOffset(this, true);
            return this;
        } else {
            return get(this, 'Month');
        }
    }

    function getDaysInMonth() {
        return daysInMonth(this.year(), this.month());
    }

    function monthsShortRegex(isStrict) {
        if (this._monthsParseExact) {
            if (!hasOwnProp(this, '_monthsRegex')) {
                computeMonthsParse.call(this);
            }
            if (isStrict) {
                return this._monthsShortStrictRegex;
            } else {
                return this._monthsShortRegex;
            }
        } else {
            if (!hasOwnProp(this, '_monthsShortRegex')) {
                this._monthsShortRegex = defaultMonthsShortRegex;
            }
            return this._monthsShortStrictRegex && isStrict
                ? this._monthsShortStrictRegex
                : this._monthsShortRegex;
        }
    }

    function monthsRegex(isStrict) {
        if (this._monthsParseExact) {
            if (!hasOwnProp(this, '_monthsRegex')) {
                computeMonthsParse.call(this);
            }
            if (isStrict) {
                return this._monthsStrictRegex;
            } else {
                return this._monthsRegex;
            }
        } else {
            if (!hasOwnProp(this, '_monthsRegex')) {
                this._monthsRegex = defaultMonthsRegex;
            }
            return this._monthsStrictRegex && isStrict
                ? this._monthsStrictRegex
                : this._monthsRegex;
        }
    }

    function computeMonthsParse() {
        function cmpLenRev(a, b) {
            return b.length - a.length;
        }

        var shortPieces = [],
            longPieces = [],
            mixedPieces = [],
            i,
            mom;
        for (i = 0; i < 12; i++) {
            // make the regex if we don't have it already
            mom = createUTC([2000, i]);
            shortPieces.push(this.monthsShort(mom, ''));
            longPieces.push(this.months(mom, ''));
            mixedPieces.push(this.months(mom, ''));
            mixedPieces.push(this.monthsShort(mom, ''));
        }
        // Sorting makes sure if one month (or abbr) is a prefix of another it
        // will match the longer piece.
        shortPieces.sort(cmpLenRev);
        longPieces.sort(cmpLenRev);
        mixedPieces.sort(cmpLenRev);
        for (i = 0; i < 12; i++) {
            shortPieces[i] = regexEscape(shortPieces[i]);
            longPieces[i] = regexEscape(longPieces[i]);
        }
        for (i = 0; i < 24; i++) {
            mixedPieces[i] = regexEscape(mixedPieces[i]);
        }

        this._monthsRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
        this._monthsShortRegex = this._monthsRegex;
        this._monthsStrictRegex = new RegExp(
            '^(' + longPieces.join('|') + ')',
            'i'
        );
        this._monthsShortStrictRegex = new RegExp(
            '^(' + shortPieces.join('|') + ')',
            'i'
        );
    }

    // FORMATTING

    addFormatToken('Y', 0, 0, function () {
        var y = this.year();
        return y <= 9999 ? zeroFill(y, 4) : '+' + y;
    });

    addFormatToken(0, ['YY', 2], 0, function () {
        return this.year() % 100;
    });

    addFormatToken(0, ['YYYY', 4], 0, 'year');
    addFormatToken(0, ['YYYYY', 5], 0, 'year');
    addFormatToken(0, ['YYYYYY', 6, true], 0, 'year');

    // ALIASES

    addUnitAlias('year', 'y');

    // PRIORITIES

    addUnitPriority('year', 1);

    // PARSING

    addRegexToken('Y', matchSigned);
    addRegexToken('YY', match1to2, match2);
    addRegexToken('YYYY', match1to4, match4);
    addRegexToken('YYYYY', match1to6, match6);
    addRegexToken('YYYYYY', match1to6, match6);

    addParseToken(['YYYYY', 'YYYYYY'], YEAR);
    addParseToken('YYYY', function (input, array) {
        array[YEAR] =
            input.length === 2 ? hooks.parseTwoDigitYear(input) : toInt(input);
    });
    addParseToken('YY', function (input, array) {
        array[YEAR] = hooks.parseTwoDigitYear(input);
    });
    addParseToken('Y', function (input, array) {
        array[YEAR] = parseInt(input, 10);
    });

    // HELPERS

    function daysInYear(year) {
        return isLeapYear(year) ? 366 : 365;
    }

    // HOOKS

    hooks.parseTwoDigitYear = function (input) {
        return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
    };

    // MOMENTS

    var getSetYear = makeGetSet('FullYear', true);

    function getIsLeapYear() {
        return isLeapYear(this.year());
    }

    function createDate(y, m, d, h, M, s, ms) {
        // can't just apply() to create a date:
        // https://stackoverflow.com/q/181348
        var date;
        // the date constructor remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0) {
            // preserve leap years using a full 400 year cycle, then reset
            date = new Date(y + 400, m, d, h, M, s, ms);
            if (isFinite(date.getFullYear())) {
                date.setFullYear(y);
            }
        } else {
            date = new Date(y, m, d, h, M, s, ms);
        }

        return date;
    }

    function createUTCDate(y) {
        var date, args;
        // the Date.UTC function remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0) {
            args = Array.prototype.slice.call(arguments);
            // preserve leap years using a full 400 year cycle, then reset
            args[0] = y + 400;
            date = new Date(Date.UTC.apply(null, args));
            if (isFinite(date.getUTCFullYear())) {
                date.setUTCFullYear(y);
            }
        } else {
            date = new Date(Date.UTC.apply(null, arguments));
        }

        return date;
    }

    // start-of-first-week - start-of-year
    function firstWeekOffset(year, dow, doy) {
        var // first-week day -- which january is always in the first week (4 for iso, 1 for other)
            fwd = 7 + dow - doy,
            // first-week day local weekday -- which local weekday is fwd
            fwdlw = (7 + createUTCDate(year, 0, fwd).getUTCDay() - dow) % 7;

        return -fwdlw + fwd - 1;
    }

    // https://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
    function dayOfYearFromWeeks(year, week, weekday, dow, doy) {
        var localWeekday = (7 + weekday - dow) % 7,
            weekOffset = firstWeekOffset(year, dow, doy),
            dayOfYear = 1 + 7 * (week - 1) + localWeekday + weekOffset,
            resYear,
            resDayOfYear;

        if (dayOfYear <= 0) {
            resYear = year - 1;
            resDayOfYear = daysInYear(resYear) + dayOfYear;
        } else if (dayOfYear > daysInYear(year)) {
            resYear = year + 1;
            resDayOfYear = dayOfYear - daysInYear(year);
        } else {
            resYear = year;
            resDayOfYear = dayOfYear;
        }

        return {
            year: resYear,
            dayOfYear: resDayOfYear,
        };
    }

    function weekOfYear(mom, dow, doy) {
        var weekOffset = firstWeekOffset(mom.year(), dow, doy),
            week = Math.floor((mom.dayOfYear() - weekOffset - 1) / 7) + 1,
            resWeek,
            resYear;

        if (week < 1) {
            resYear = mom.year() - 1;
            resWeek = week + weeksInYear(resYear, dow, doy);
        } else if (week > weeksInYear(mom.year(), dow, doy)) {
            resWeek = week - weeksInYear(mom.year(), dow, doy);
            resYear = mom.year() + 1;
        } else {
            resYear = mom.year();
            resWeek = week;
        }

        return {
            week: resWeek,
            year: resYear,
        };
    }

    function weeksInYear(year, dow, doy) {
        var weekOffset = firstWeekOffset(year, dow, doy),
            weekOffsetNext = firstWeekOffset(year + 1, dow, doy);
        return (daysInYear(year) - weekOffset + weekOffsetNext) / 7;
    }

    // FORMATTING

    addFormatToken('w', ['ww', 2], 'wo', 'week');
    addFormatToken('W', ['WW', 2], 'Wo', 'isoWeek');

    // ALIASES

    addUnitAlias('week', 'w');
    addUnitAlias('isoWeek', 'W');

    // PRIORITIES

    addUnitPriority('week', 5);
    addUnitPriority('isoWeek', 5);

    // PARSING

    addRegexToken('w', match1to2);
    addRegexToken('ww', match1to2, match2);
    addRegexToken('W', match1to2);
    addRegexToken('WW', match1to2, match2);

    addWeekParseToken(['w', 'ww', 'W', 'WW'], function (
        input,
        week,
        config,
        token
    ) {
        week[token.substr(0, 1)] = toInt(input);
    });

    // HELPERS

    // LOCALES

    function localeWeek(mom) {
        return weekOfYear(mom, this._week.dow, this._week.doy).week;
    }

    var defaultLocaleWeek = {
        dow: 0, // Sunday is the first day of the week.
        doy: 6, // The week that contains Jan 6th is the first week of the year.
    };

    function localeFirstDayOfWeek() {
        return this._week.dow;
    }

    function localeFirstDayOfYear() {
        return this._week.doy;
    }

    // MOMENTS

    function getSetWeek(input) {
        var week = this.localeData().week(this);
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

    function getSetISOWeek(input) {
        var week = weekOfYear(this, 1, 4).week;
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

    // FORMATTING

    addFormatToken('d', 0, 'do', 'day');

    addFormatToken('dd', 0, 0, function (format) {
        return this.localeData().weekdaysMin(this, format);
    });

    addFormatToken('ddd', 0, 0, function (format) {
        return this.localeData().weekdaysShort(this, format);
    });

    addFormatToken('dddd', 0, 0, function (format) {
        return this.localeData().weekdays(this, format);
    });

    addFormatToken('e', 0, 0, 'weekday');
    addFormatToken('E', 0, 0, 'isoWeekday');

    // ALIASES

    addUnitAlias('day', 'd');
    addUnitAlias('weekday', 'e');
    addUnitAlias('isoWeekday', 'E');

    // PRIORITY
    addUnitPriority('day', 11);
    addUnitPriority('weekday', 11);
    addUnitPriority('isoWeekday', 11);

    // PARSING

    addRegexToken('d', match1to2);
    addRegexToken('e', match1to2);
    addRegexToken('E', match1to2);
    addRegexToken('dd', function (isStrict, locale) {
        return locale.weekdaysMinRegex(isStrict);
    });
    addRegexToken('ddd', function (isStrict, locale) {
        return locale.weekdaysShortRegex(isStrict);
    });
    addRegexToken('dddd', function (isStrict, locale) {
        return locale.weekdaysRegex(isStrict);
    });

    addWeekParseToken(['dd', 'ddd', 'dddd'], function (input, week, config, token) {
        var weekday = config._locale.weekdaysParse(input, token, config._strict);
        // if we didn't get a weekday name, mark the date as invalid
        if (weekday != null) {
            week.d = weekday;
        } else {
            getParsingFlags(config).invalidWeekday = input;
        }
    });

    addWeekParseToken(['d', 'e', 'E'], function (input, week, config, token) {
        week[token] = toInt(input);
    });

    // HELPERS

    function parseWeekday(input, locale) {
        if (typeof input !== 'string') {
            return input;
        }

        if (!isNaN(input)) {
            return parseInt(input, 10);
        }

        input = locale.weekdaysParse(input);
        if (typeof input === 'number') {
            return input;
        }

        return null;
    }

    function parseIsoWeekday(input, locale) {
        if (typeof input === 'string') {
            return locale.weekdaysParse(input) % 7 || 7;
        }
        return isNaN(input) ? null : input;
    }

    // LOCALES
    function shiftWeekdays(ws, n) {
        return ws.slice(n, 7).concat(ws.slice(0, n));
    }

    var defaultLocaleWeekdays = 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split(
            '_'
        ),
        defaultLocaleWeekdaysShort = 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
        defaultLocaleWeekdaysMin = 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
        defaultWeekdaysRegex = matchWord,
        defaultWeekdaysShortRegex = matchWord,
        defaultWeekdaysMinRegex = matchWord;

    function localeWeekdays(m, format) {
        var weekdays = isArray(this._weekdays)
            ? this._weekdays
            : this._weekdays[
                  m && m !== true && this._weekdays.isFormat.test(format)
                      ? 'format'
                      : 'standalone'
              ];
        return m === true
            ? shiftWeekdays(weekdays, this._week.dow)
            : m
            ? weekdays[m.day()]
            : weekdays;
    }

    function localeWeekdaysShort(m) {
        return m === true
            ? shiftWeekdays(this._weekdaysShort, this._week.dow)
            : m
            ? this._weekdaysShort[m.day()]
            : this._weekdaysShort;
    }

    function localeWeekdaysMin(m) {
        return m === true
            ? shiftWeekdays(this._weekdaysMin, this._week.dow)
            : m
            ? this._weekdaysMin[m.day()]
            : this._weekdaysMin;
    }

    function handleStrictParse$1(weekdayName, format, strict) {
        var i,
            ii,
            mom,
            llc = weekdayName.toLocaleLowerCase();
        if (!this._weekdaysParse) {
            this._weekdaysParse = [];
            this._shortWeekdaysParse = [];
            this._minWeekdaysParse = [];

            for (i = 0; i < 7; ++i) {
                mom = createUTC([2000, 1]).day(i);
                this._minWeekdaysParse[i] = this.weekdaysMin(
                    mom,
                    ''
                ).toLocaleLowerCase();
                this._shortWeekdaysParse[i] = this.weekdaysShort(
                    mom,
                    ''
                ).toLocaleLowerCase();
                this._weekdaysParse[i] = this.weekdays(mom, '').toLocaleLowerCase();
            }
        }

        if (strict) {
            if (format === 'dddd') {
                ii = indexOf.call(this._weekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else if (format === 'ddd') {
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            }
        } else {
            if (format === 'dddd') {
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else if (format === 'ddd') {
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._minWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            }
        }
    }

    function localeWeekdaysParse(weekdayName, format, strict) {
        var i, mom, regex;

        if (this._weekdaysParseExact) {
            return handleStrictParse$1.call(this, weekdayName, format, strict);
        }

        if (!this._weekdaysParse) {
            this._weekdaysParse = [];
            this._minWeekdaysParse = [];
            this._shortWeekdaysParse = [];
            this._fullWeekdaysParse = [];
        }

        for (i = 0; i < 7; i++) {
            // make the regex if we don't have it already

            mom = createUTC([2000, 1]).day(i);
            if (strict && !this._fullWeekdaysParse[i]) {
                this._fullWeekdaysParse[i] = new RegExp(
                    '^' + this.weekdays(mom, '').replace('.', '\\.?') + '$',
                    'i'
                );
                this._shortWeekdaysParse[i] = new RegExp(
                    '^' + this.weekdaysShort(mom, '').replace('.', '\\.?') + '$',
                    'i'
                );
                this._minWeekdaysParse[i] = new RegExp(
                    '^' + this.weekdaysMin(mom, '').replace('.', '\\.?') + '$',
                    'i'
                );
            }
            if (!this._weekdaysParse[i]) {
                regex =
                    '^' +
                    this.weekdays(mom, '') +
                    '|^' +
                    this.weekdaysShort(mom, '') +
                    '|^' +
                    this.weekdaysMin(mom, '');
                this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (
                strict &&
                format === 'dddd' &&
                this._fullWeekdaysParse[i].test(weekdayName)
            ) {
                return i;
            } else if (
                strict &&
                format === 'ddd' &&
                this._shortWeekdaysParse[i].test(weekdayName)
            ) {
                return i;
            } else if (
                strict &&
                format === 'dd' &&
                this._minWeekdaysParse[i].test(weekdayName)
            ) {
                return i;
            } else if (!strict && this._weekdaysParse[i].test(weekdayName)) {
                return i;
            }
        }
    }

    // MOMENTS

    function getSetDayOfWeek(input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
        if (input != null) {
            input = parseWeekday(input, this.localeData());
            return this.add(input - day, 'd');
        } else {
            return day;
        }
    }

    function getSetLocaleDayOfWeek(input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
        return input == null ? weekday : this.add(input - weekday, 'd');
    }

    function getSetISODayOfWeek(input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }

        // behaves the same as moment#day except
        // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
        // as a setter, sunday should belong to the previous week.

        if (input != null) {
            var weekday = parseIsoWeekday(input, this.localeData());
            return this.day(this.day() % 7 ? weekday : weekday - 7);
        } else {
            return this.day() || 7;
        }
    }

    function weekdaysRegex(isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysStrictRegex;
            } else {
                return this._weekdaysRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                this._weekdaysRegex = defaultWeekdaysRegex;
            }
            return this._weekdaysStrictRegex && isStrict
                ? this._weekdaysStrictRegex
                : this._weekdaysRegex;
        }
    }

    function weekdaysShortRegex(isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysShortStrictRegex;
            } else {
                return this._weekdaysShortRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysShortRegex')) {
                this._weekdaysShortRegex = defaultWeekdaysShortRegex;
            }
            return this._weekdaysShortStrictRegex && isStrict
                ? this._weekdaysShortStrictRegex
                : this._weekdaysShortRegex;
        }
    }

    function weekdaysMinRegex(isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysMinStrictRegex;
            } else {
                return this._weekdaysMinRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysMinRegex')) {
                this._weekdaysMinRegex = defaultWeekdaysMinRegex;
            }
            return this._weekdaysMinStrictRegex && isStrict
                ? this._weekdaysMinStrictRegex
                : this._weekdaysMinRegex;
        }
    }

    function computeWeekdaysParse() {
        function cmpLenRev(a, b) {
            return b.length - a.length;
        }

        var minPieces = [],
            shortPieces = [],
            longPieces = [],
            mixedPieces = [],
            i,
            mom,
            minp,
            shortp,
            longp;
        for (i = 0; i < 7; i++) {
            // make the regex if we don't have it already
            mom = createUTC([2000, 1]).day(i);
            minp = regexEscape(this.weekdaysMin(mom, ''));
            shortp = regexEscape(this.weekdaysShort(mom, ''));
            longp = regexEscape(this.weekdays(mom, ''));
            minPieces.push(minp);
            shortPieces.push(shortp);
            longPieces.push(longp);
            mixedPieces.push(minp);
            mixedPieces.push(shortp);
            mixedPieces.push(longp);
        }
        // Sorting makes sure if one weekday (or abbr) is a prefix of another it
        // will match the longer piece.
        minPieces.sort(cmpLenRev);
        shortPieces.sort(cmpLenRev);
        longPieces.sort(cmpLenRev);
        mixedPieces.sort(cmpLenRev);

        this._weekdaysRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
        this._weekdaysShortRegex = this._weekdaysRegex;
        this._weekdaysMinRegex = this._weekdaysRegex;

        this._weekdaysStrictRegex = new RegExp(
            '^(' + longPieces.join('|') + ')',
            'i'
        );
        this._weekdaysShortStrictRegex = new RegExp(
            '^(' + shortPieces.join('|') + ')',
            'i'
        );
        this._weekdaysMinStrictRegex = new RegExp(
            '^(' + minPieces.join('|') + ')',
            'i'
        );
    }

    // FORMATTING

    function hFormat() {
        return this.hours() % 12 || 12;
    }

    function kFormat() {
        return this.hours() || 24;
    }

    addFormatToken('H', ['HH', 2], 0, 'hour');
    addFormatToken('h', ['hh', 2], 0, hFormat);
    addFormatToken('k', ['kk', 2], 0, kFormat);

    addFormatToken('hmm', 0, 0, function () {
        return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2);
    });

    addFormatToken('hmmss', 0, 0, function () {
        return (
            '' +
            hFormat.apply(this) +
            zeroFill(this.minutes(), 2) +
            zeroFill(this.seconds(), 2)
        );
    });

    addFormatToken('Hmm', 0, 0, function () {
        return '' + this.hours() + zeroFill(this.minutes(), 2);
    });

    addFormatToken('Hmmss', 0, 0, function () {
        return (
            '' +
            this.hours() +
            zeroFill(this.minutes(), 2) +
            zeroFill(this.seconds(), 2)
        );
    });

    function meridiem(token, lowercase) {
        addFormatToken(token, 0, 0, function () {
            return this.localeData().meridiem(
                this.hours(),
                this.minutes(),
                lowercase
            );
        });
    }

    meridiem('a', true);
    meridiem('A', false);

    // ALIASES

    addUnitAlias('hour', 'h');

    // PRIORITY
    addUnitPriority('hour', 13);

    // PARSING

    function matchMeridiem(isStrict, locale) {
        return locale._meridiemParse;
    }

    addRegexToken('a', matchMeridiem);
    addRegexToken('A', matchMeridiem);
    addRegexToken('H', match1to2);
    addRegexToken('h', match1to2);
    addRegexToken('k', match1to2);
    addRegexToken('HH', match1to2, match2);
    addRegexToken('hh', match1to2, match2);
    addRegexToken('kk', match1to2, match2);

    addRegexToken('hmm', match3to4);
    addRegexToken('hmmss', match5to6);
    addRegexToken('Hmm', match3to4);
    addRegexToken('Hmmss', match5to6);

    addParseToken(['H', 'HH'], HOUR);
    addParseToken(['k', 'kk'], function (input, array, config) {
        var kInput = toInt(input);
        array[HOUR] = kInput === 24 ? 0 : kInput;
    });
    addParseToken(['a', 'A'], function (input, array, config) {
        config._isPm = config._locale.isPM(input);
        config._meridiem = input;
    });
    addParseToken(['h', 'hh'], function (input, array, config) {
        array[HOUR] = toInt(input);
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('hmm', function (input, array, config) {
        var pos = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos));
        array[MINUTE] = toInt(input.substr(pos));
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('hmmss', function (input, array, config) {
        var pos1 = input.length - 4,
            pos2 = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos1));
        array[MINUTE] = toInt(input.substr(pos1, 2));
        array[SECOND] = toInt(input.substr(pos2));
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('Hmm', function (input, array, config) {
        var pos = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos));
        array[MINUTE] = toInt(input.substr(pos));
    });
    addParseToken('Hmmss', function (input, array, config) {
        var pos1 = input.length - 4,
            pos2 = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos1));
        array[MINUTE] = toInt(input.substr(pos1, 2));
        array[SECOND] = toInt(input.substr(pos2));
    });

    // LOCALES

    function localeIsPM(input) {
        // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
        // Using charAt should be more compatible.
        return (input + '').toLowerCase().charAt(0) === 'p';
    }

    var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i,
        // Setting the hour should keep the time, because the user explicitly
        // specified which hour they want. So trying to maintain the same hour (in
        // a new timezone) makes sense. Adding/subtracting hours does not follow
        // this rule.
        getSetHour = makeGetSet('Hours', true);

    function localeMeridiem(hours, minutes, isLower) {
        if (hours > 11) {
            return isLower ? 'pm' : 'PM';
        } else {
            return isLower ? 'am' : 'AM';
        }
    }

    var baseConfig = {
        calendar: defaultCalendar,
        longDateFormat: defaultLongDateFormat,
        invalidDate: defaultInvalidDate,
        ordinal: defaultOrdinal,
        dayOfMonthOrdinalParse: defaultDayOfMonthOrdinalParse,
        relativeTime: defaultRelativeTime,

        months: defaultLocaleMonths,
        monthsShort: defaultLocaleMonthsShort,

        week: defaultLocaleWeek,

        weekdays: defaultLocaleWeekdays,
        weekdaysMin: defaultLocaleWeekdaysMin,
        weekdaysShort: defaultLocaleWeekdaysShort,

        meridiemParse: defaultLocaleMeridiemParse,
    };

    // internal storage for locale config files
    var locales = {},
        localeFamilies = {},
        globalLocale;

    function commonPrefix(arr1, arr2) {
        var i,
            minl = Math.min(arr1.length, arr2.length);
        for (i = 0; i < minl; i += 1) {
            if (arr1[i] !== arr2[i]) {
                return i;
            }
        }
        return minl;
    }

    function normalizeLocale(key) {
        return key ? key.toLowerCase().replace('_', '-') : key;
    }

    // pick the locale from the array
    // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
    // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
    function chooseLocale(names) {
        var i = 0,
            j,
            next,
            locale,
            split;

        while (i < names.length) {
            split = normalizeLocale(names[i]).split('-');
            j = split.length;
            next = normalizeLocale(names[i + 1]);
            next = next ? next.split('-') : null;
            while (j > 0) {
                locale = loadLocale(split.slice(0, j).join('-'));
                if (locale) {
                    return locale;
                }
                if (
                    next &&
                    next.length >= j &&
                    commonPrefix(split, next) >= j - 1
                ) {
                    //the next array item is better than a shallower substring of this one
                    break;
                }
                j--;
            }
            i++;
        }
        return globalLocale;
    }

    function loadLocale(name) {
        var oldLocale = null,
            aliasedRequire;
        // TODO: Find a better way to register and load all the locales in Node
        if (
            locales[name] === undefined &&
            typeof module !== 'undefined' &&
            module &&
            module.exports
        ) {
            try {
                oldLocale = globalLocale._abbr;
                aliasedRequire = require;
                aliasedRequire('./locale/' + name);
                getSetGlobalLocale(oldLocale);
            } catch (e) {
                // mark as not found to avoid repeating expensive file require call causing high CPU
                // when trying to find en-US, en_US, en-us for every format call
                locales[name] = null; // null means not found
            }
        }
        return locales[name];
    }

    // This function will load locale and then set the global locale.  If
    // no arguments are passed in, it will simply return the current global
    // locale key.
    function getSetGlobalLocale(key, values) {
        var data;
        if (key) {
            if (isUndefined(values)) {
                data = getLocale(key);
            } else {
                data = defineLocale(key, values);
            }

            if (data) {
                // moment.duration._locale = moment._locale = data;
                globalLocale = data;
            } else {
                if (typeof console !== 'undefined' && console.warn) {
                    //warn user if arguments are passed but the locale could not be set
                    console.warn(
                        'Locale ' + key + ' not found. Did you forget to load it?'
                    );
                }
            }
        }

        return globalLocale._abbr;
    }

    function defineLocale(name, config) {
        if (config !== null) {
            var locale,
                parentConfig = baseConfig;
            config.abbr = name;
            if (locales[name] != null) {
                deprecateSimple(
                    'defineLocaleOverride',
                    'use moment.updateLocale(localeName, config) to change ' +
                        'an existing locale. moment.defineLocale(localeName, ' +
                        'config) should only be used for creating a new locale ' +
                        'See http://momentjs.com/guides/#/warnings/define-locale/ for more info.'
                );
                parentConfig = locales[name]._config;
            } else if (config.parentLocale != null) {
                if (locales[config.parentLocale] != null) {
                    parentConfig = locales[config.parentLocale]._config;
                } else {
                    locale = loadLocale(config.parentLocale);
                    if (locale != null) {
                        parentConfig = locale._config;
                    } else {
                        if (!localeFamilies[config.parentLocale]) {
                            localeFamilies[config.parentLocale] = [];
                        }
                        localeFamilies[config.parentLocale].push({
                            name: name,
                            config: config,
                        });
                        return null;
                    }
                }
            }
            locales[name] = new Locale(mergeConfigs(parentConfig, config));

            if (localeFamilies[name]) {
                localeFamilies[name].forEach(function (x) {
                    defineLocale(x.name, x.config);
                });
            }

            // backwards compat for now: also set the locale
            // make sure we set the locale AFTER all child locales have been
            // created, so we won't end up with the child locale set.
            getSetGlobalLocale(name);

            return locales[name];
        } else {
            // useful for testing
            delete locales[name];
            return null;
        }
    }

    function updateLocale(name, config) {
        if (config != null) {
            var locale,
                tmpLocale,
                parentConfig = baseConfig;

            if (locales[name] != null && locales[name].parentLocale != null) {
                // Update existing child locale in-place to avoid memory-leaks
                locales[name].set(mergeConfigs(locales[name]._config, config));
            } else {
                // MERGE
                tmpLocale = loadLocale(name);
                if (tmpLocale != null) {
                    parentConfig = tmpLocale._config;
                }
                config = mergeConfigs(parentConfig, config);
                if (tmpLocale == null) {
                    // updateLocale is called for creating a new locale
                    // Set abbr so it will have a name (getters return
                    // undefined otherwise).
                    config.abbr = name;
                }
                locale = new Locale(config);
                locale.parentLocale = locales[name];
                locales[name] = locale;
            }

            // backwards compat for now: also set the locale
            getSetGlobalLocale(name);
        } else {
            // pass null for config to unupdate, useful for tests
            if (locales[name] != null) {
                if (locales[name].parentLocale != null) {
                    locales[name] = locales[name].parentLocale;
                    if (name === getSetGlobalLocale()) {
                        getSetGlobalLocale(name);
                    }
                } else if (locales[name] != null) {
                    delete locales[name];
                }
            }
        }
        return locales[name];
    }

    // returns locale data
    function getLocale(key) {
        var locale;

        if (key && key._locale && key._locale._abbr) {
            key = key._locale._abbr;
        }

        if (!key) {
            return globalLocale;
        }

        if (!isArray(key)) {
            //short-circuit everything else
            locale = loadLocale(key);
            if (locale) {
                return locale;
            }
            key = [key];
        }

        return chooseLocale(key);
    }

    function listLocales() {
        return keys(locales);
    }

    function checkOverflow(m) {
        var overflow,
            a = m._a;

        if (a && getParsingFlags(m).overflow === -2) {
            overflow =
                a[MONTH] < 0 || a[MONTH] > 11
                    ? MONTH
                    : a[DATE] < 1 || a[DATE] > daysInMonth(a[YEAR], a[MONTH])
                    ? DATE
                    : a[HOUR] < 0 ||
                      a[HOUR] > 24 ||
                      (a[HOUR] === 24 &&
                          (a[MINUTE] !== 0 ||
                              a[SECOND] !== 0 ||
                              a[MILLISECOND] !== 0))
                    ? HOUR
                    : a[MINUTE] < 0 || a[MINUTE] > 59
                    ? MINUTE
                    : a[SECOND] < 0 || a[SECOND] > 59
                    ? SECOND
                    : a[MILLISECOND] < 0 || a[MILLISECOND] > 999
                    ? MILLISECOND
                    : -1;

            if (
                getParsingFlags(m)._overflowDayOfYear &&
                (overflow < YEAR || overflow > DATE)
            ) {
                overflow = DATE;
            }
            if (getParsingFlags(m)._overflowWeeks && overflow === -1) {
                overflow = WEEK;
            }
            if (getParsingFlags(m)._overflowWeekday && overflow === -1) {
                overflow = WEEKDAY;
            }

            getParsingFlags(m).overflow = overflow;
        }

        return m;
    }

    // iso 8601 regex
    // 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
    var extendedIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/,
        basicIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d|))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/,
        tzRegex = /Z|[+-]\d\d(?::?\d\d)?/,
        isoDates = [
            ['YYYYYY-MM-DD', /[+-]\d{6}-\d\d-\d\d/],
            ['YYYY-MM-DD', /\d{4}-\d\d-\d\d/],
            ['GGGG-[W]WW-E', /\d{4}-W\d\d-\d/],
            ['GGGG-[W]WW', /\d{4}-W\d\d/, false],
            ['YYYY-DDD', /\d{4}-\d{3}/],
            ['YYYY-MM', /\d{4}-\d\d/, false],
            ['YYYYYYMMDD', /[+-]\d{10}/],
            ['YYYYMMDD', /\d{8}/],
            ['GGGG[W]WWE', /\d{4}W\d{3}/],
            ['GGGG[W]WW', /\d{4}W\d{2}/, false],
            ['YYYYDDD', /\d{7}/],
            ['YYYYMM', /\d{6}/, false],
            ['YYYY', /\d{4}/, false],
        ],
        // iso time formats and regexes
        isoTimes = [
            ['HH:mm:ss.SSSS', /\d\d:\d\d:\d\d\.\d+/],
            ['HH:mm:ss,SSSS', /\d\d:\d\d:\d\d,\d+/],
            ['HH:mm:ss', /\d\d:\d\d:\d\d/],
            ['HH:mm', /\d\d:\d\d/],
            ['HHmmss.SSSS', /\d\d\d\d\d\d\.\d+/],
            ['HHmmss,SSSS', /\d\d\d\d\d\d,\d+/],
            ['HHmmss', /\d\d\d\d\d\d/],
            ['HHmm', /\d\d\d\d/],
            ['HH', /\d\d/],
        ],
        aspNetJsonRegex = /^\/?Date\((-?\d+)/i,
        // RFC 2822 regex: For details see https://tools.ietf.org/html/rfc2822#section-3.3
        rfc2822 = /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|([+-]\d{4}))$/,
        obsOffsets = {
            UT: 0,
            GMT: 0,
            EDT: -4 * 60,
            EST: -5 * 60,
            CDT: -5 * 60,
            CST: -6 * 60,
            MDT: -6 * 60,
            MST: -7 * 60,
            PDT: -7 * 60,
            PST: -8 * 60,
        };

    // date from iso format
    function configFromISO(config) {
        var i,
            l,
            string = config._i,
            match = extendedIsoRegex.exec(string) || basicIsoRegex.exec(string),
            allowTime,
            dateFormat,
            timeFormat,
            tzFormat;

        if (match) {
            getParsingFlags(config).iso = true;

            for (i = 0, l = isoDates.length; i < l; i++) {
                if (isoDates[i][1].exec(match[1])) {
                    dateFormat = isoDates[i][0];
                    allowTime = isoDates[i][2] !== false;
                    break;
                }
            }
            if (dateFormat == null) {
                config._isValid = false;
                return;
            }
            if (match[3]) {
                for (i = 0, l = isoTimes.length; i < l; i++) {
                    if (isoTimes[i][1].exec(match[3])) {
                        // match[2] should be 'T' or space
                        timeFormat = (match[2] || ' ') + isoTimes[i][0];
                        break;
                    }
                }
                if (timeFormat == null) {
                    config._isValid = false;
                    return;
                }
            }
            if (!allowTime && timeFormat != null) {
                config._isValid = false;
                return;
            }
            if (match[4]) {
                if (tzRegex.exec(match[4])) {
                    tzFormat = 'Z';
                } else {
                    config._isValid = false;
                    return;
                }
            }
            config._f = dateFormat + (timeFormat || '') + (tzFormat || '');
            configFromStringAndFormat(config);
        } else {
            config._isValid = false;
        }
    }

    function extractFromRFC2822Strings(
        yearStr,
        monthStr,
        dayStr,
        hourStr,
        minuteStr,
        secondStr
    ) {
        var result = [
            untruncateYear(yearStr),
            defaultLocaleMonthsShort.indexOf(monthStr),
            parseInt(dayStr, 10),
            parseInt(hourStr, 10),
            parseInt(minuteStr, 10),
        ];

        if (secondStr) {
            result.push(parseInt(secondStr, 10));
        }

        return result;
    }

    function untruncateYear(yearStr) {
        var year = parseInt(yearStr, 10);
        if (year <= 49) {
            return 2000 + year;
        } else if (year <= 999) {
            return 1900 + year;
        }
        return year;
    }

    function preprocessRFC2822(s) {
        // Remove comments and folding whitespace and replace multiple-spaces with a single space
        return s
            .replace(/\([^)]*\)|[\n\t]/g, ' ')
            .replace(/(\s\s+)/g, ' ')
            .replace(/^\s\s*/, '')
            .replace(/\s\s*$/, '');
    }

    function checkWeekday(weekdayStr, parsedInput, config) {
        if (weekdayStr) {
            // TODO: Replace the vanilla JS Date object with an independent day-of-week check.
            var weekdayProvided = defaultLocaleWeekdaysShort.indexOf(weekdayStr),
                weekdayActual = new Date(
                    parsedInput[0],
                    parsedInput[1],
                    parsedInput[2]
                ).getDay();
            if (weekdayProvided !== weekdayActual) {
                getParsingFlags(config).weekdayMismatch = true;
                config._isValid = false;
                return false;
            }
        }
        return true;
    }

    function calculateOffset(obsOffset, militaryOffset, numOffset) {
        if (obsOffset) {
            return obsOffsets[obsOffset];
        } else if (militaryOffset) {
            // the only allowed military tz is Z
            return 0;
        } else {
            var hm = parseInt(numOffset, 10),
                m = hm % 100,
                h = (hm - m) / 100;
            return h * 60 + m;
        }
    }

    // date and time from ref 2822 format
    function configFromRFC2822(config) {
        var match = rfc2822.exec(preprocessRFC2822(config._i)),
            parsedArray;
        if (match) {
            parsedArray = extractFromRFC2822Strings(
                match[4],
                match[3],
                match[2],
                match[5],
                match[6],
                match[7]
            );
            if (!checkWeekday(match[1], parsedArray, config)) {
                return;
            }

            config._a = parsedArray;
            config._tzm = calculateOffset(match[8], match[9], match[10]);

            config._d = createUTCDate.apply(null, config._a);
            config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);

            getParsingFlags(config).rfc2822 = true;
        } else {
            config._isValid = false;
        }
    }

    // date from 1) ASP.NET, 2) ISO, 3) RFC 2822 formats, or 4) optional fallback if parsing isn't strict
    function configFromString(config) {
        var matched = aspNetJsonRegex.exec(config._i);
        if (matched !== null) {
            config._d = new Date(+matched[1]);
            return;
        }

        configFromISO(config);
        if (config._isValid === false) {
            delete config._isValid;
        } else {
            return;
        }

        configFromRFC2822(config);
        if (config._isValid === false) {
            delete config._isValid;
        } else {
            return;
        }

        if (config._strict) {
            config._isValid = false;
        } else {
            // Final attempt, use Input Fallback
            hooks.createFromInputFallback(config);
        }
    }

    hooks.createFromInputFallback = deprecate(
        'value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), ' +
            'which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are ' +
            'discouraged. Please refer to http://momentjs.com/guides/#/warnings/js-date/ for more info.',
        function (config) {
            config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
        }
    );

    // Pick the first defined of two or three arguments.
    function defaults(a, b, c) {
        if (a != null) {
            return a;
        }
        if (b != null) {
            return b;
        }
        return c;
    }

    function currentDateArray(config) {
        // hooks is actually the exported moment object
        var nowValue = new Date(hooks.now());
        if (config._useUTC) {
            return [
                nowValue.getUTCFullYear(),
                nowValue.getUTCMonth(),
                nowValue.getUTCDate(),
            ];
        }
        return [nowValue.getFullYear(), nowValue.getMonth(), nowValue.getDate()];
    }

    // convert an array to a date.
    // the array should mirror the parameters below
    // note: all values past the year are optional and will default to the lowest possible value.
    // [year, month, day , hour, minute, second, millisecond]
    function configFromArray(config) {
        var i,
            date,
            input = [],
            currentDate,
            expectedWeekday,
            yearToUse;

        if (config._d) {
            return;
        }

        currentDate = currentDateArray(config);

        //compute day of the year from weeks and weekdays
        if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
            dayOfYearFromWeekInfo(config);
        }

        //if the day of the year is set, figure out what it is
        if (config._dayOfYear != null) {
            yearToUse = defaults(config._a[YEAR], currentDate[YEAR]);

            if (
                config._dayOfYear > daysInYear(yearToUse) ||
                config._dayOfYear === 0
            ) {
                getParsingFlags(config)._overflowDayOfYear = true;
            }

            date = createUTCDate(yearToUse, 0, config._dayOfYear);
            config._a[MONTH] = date.getUTCMonth();
            config._a[DATE] = date.getUTCDate();
        }

        // Default to current date.
        // * if no year, month, day of month are given, default to today
        // * if day of month is given, default month and year
        // * if month is given, default only year
        // * if year is given, don't default anything
        for (i = 0; i < 3 && config._a[i] == null; ++i) {
            config._a[i] = input[i] = currentDate[i];
        }

        // Zero out whatever was not defaulted, including time
        for (; i < 7; i++) {
            config._a[i] = input[i] =
                config._a[i] == null ? (i === 2 ? 1 : 0) : config._a[i];
        }

        // Check for 24:00:00.000
        if (
            config._a[HOUR] === 24 &&
            config._a[MINUTE] === 0 &&
            config._a[SECOND] === 0 &&
            config._a[MILLISECOND] === 0
        ) {
            config._nextDay = true;
            config._a[HOUR] = 0;
        }

        config._d = (config._useUTC ? createUTCDate : createDate).apply(
            null,
            input
        );
        expectedWeekday = config._useUTC
            ? config._d.getUTCDay()
            : config._d.getDay();

        // Apply timezone offset from input. The actual utcOffset can be changed
        // with parseZone.
        if (config._tzm != null) {
            config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
        }

        if (config._nextDay) {
            config._a[HOUR] = 24;
        }

        // check for mismatching day of week
        if (
            config._w &&
            typeof config._w.d !== 'undefined' &&
            config._w.d !== expectedWeekday
        ) {
            getParsingFlags(config).weekdayMismatch = true;
        }
    }

    function dayOfYearFromWeekInfo(config) {
        var w, weekYear, week, weekday, dow, doy, temp, weekdayOverflow, curWeek;

        w = config._w;
        if (w.GG != null || w.W != null || w.E != null) {
            dow = 1;
            doy = 4;

            // TODO: We need to take the current isoWeekYear, but that depends on
            // how we interpret now (local, utc, fixed offset). So create
            // a now version of current config (take local/utc/offset flags, and
            // create now).
            weekYear = defaults(
                w.GG,
                config._a[YEAR],
                weekOfYear(createLocal(), 1, 4).year
            );
            week = defaults(w.W, 1);
            weekday = defaults(w.E, 1);
            if (weekday < 1 || weekday > 7) {
                weekdayOverflow = true;
            }
        } else {
            dow = config._locale._week.dow;
            doy = config._locale._week.doy;

            curWeek = weekOfYear(createLocal(), dow, doy);

            weekYear = defaults(w.gg, config._a[YEAR], curWeek.year);

            // Default to current week.
            week = defaults(w.w, curWeek.week);

            if (w.d != null) {
                // weekday -- low day numbers are considered next week
                weekday = w.d;
                if (weekday < 0 || weekday > 6) {
                    weekdayOverflow = true;
                }
            } else if (w.e != null) {
                // local weekday -- counting starts from beginning of week
                weekday = w.e + dow;
                if (w.e < 0 || w.e > 6) {
                    weekdayOverflow = true;
                }
            } else {
                // default to beginning of week
                weekday = dow;
            }
        }
        if (week < 1 || week > weeksInYear(weekYear, dow, doy)) {
            getParsingFlags(config)._overflowWeeks = true;
        } else if (weekdayOverflow != null) {
            getParsingFlags(config)._overflowWeekday = true;
        } else {
            temp = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy);
            config._a[YEAR] = temp.year;
            config._dayOfYear = temp.dayOfYear;
        }
    }

    // constant that refers to the ISO standard
    hooks.ISO_8601 = function () {};

    // constant that refers to the RFC 2822 form
    hooks.RFC_2822 = function () {};

    // date from string and format string
    function configFromStringAndFormat(config) {
        // TODO: Move this to another part of the creation flow to prevent circular deps
        if (config._f === hooks.ISO_8601) {
            configFromISO(config);
            return;
        }
        if (config._f === hooks.RFC_2822) {
            configFromRFC2822(config);
            return;
        }
        config._a = [];
        getParsingFlags(config).empty = true;

        // This array is used to make a Date, either with `new Date` or `Date.UTC`
        var string = '' + config._i,
            i,
            parsedInput,
            tokens,
            token,
            skipped,
            stringLength = string.length,
            totalParsedInputLength = 0,
            era;

        tokens =
            expandFormat(config._f, config._locale).match(formattingTokens) || [];

        for (i = 0; i < tokens.length; i++) {
            token = tokens[i];
            parsedInput = (string.match(getParseRegexForToken(token, config)) ||
                [])[0];
            if (parsedInput) {
                skipped = string.substr(0, string.indexOf(parsedInput));
                if (skipped.length > 0) {
                    getParsingFlags(config).unusedInput.push(skipped);
                }
                string = string.slice(
                    string.indexOf(parsedInput) + parsedInput.length
                );
                totalParsedInputLength += parsedInput.length;
            }
            // don't parse if it's not a known token
            if (formatTokenFunctions[token]) {
                if (parsedInput) {
                    getParsingFlags(config).empty = false;
                } else {
                    getParsingFlags(config).unusedTokens.push(token);
                }
                addTimeToArrayFromToken(token, parsedInput, config);
            } else if (config._strict && !parsedInput) {
                getParsingFlags(config).unusedTokens.push(token);
            }
        }

        // add remaining unparsed input length to the string
        getParsingFlags(config).charsLeftOver =
            stringLength - totalParsedInputLength;
        if (string.length > 0) {
            getParsingFlags(config).unusedInput.push(string);
        }

        // clear _12h flag if hour is <= 12
        if (
            config._a[HOUR] <= 12 &&
            getParsingFlags(config).bigHour === true &&
            config._a[HOUR] > 0
        ) {
            getParsingFlags(config).bigHour = undefined;
        }

        getParsingFlags(config).parsedDateParts = config._a.slice(0);
        getParsingFlags(config).meridiem = config._meridiem;
        // handle meridiem
        config._a[HOUR] = meridiemFixWrap(
            config._locale,
            config._a[HOUR],
            config._meridiem
        );

        // handle era
        era = getParsingFlags(config).era;
        if (era !== null) {
            config._a[YEAR] = config._locale.erasConvertYear(era, config._a[YEAR]);
        }

        configFromArray(config);
        checkOverflow(config);
    }

    function meridiemFixWrap(locale, hour, meridiem) {
        var isPm;

        if (meridiem == null) {
            // nothing to do
            return hour;
        }
        if (locale.meridiemHour != null) {
            return locale.meridiemHour(hour, meridiem);
        } else if (locale.isPM != null) {
            // Fallback
            isPm = locale.isPM(meridiem);
            if (isPm && hour < 12) {
                hour += 12;
            }
            if (!isPm && hour === 12) {
                hour = 0;
            }
            return hour;
        } else {
            // this is not supposed to happen
            return hour;
        }
    }

    // date from string and array of format strings
    function configFromStringAndArray(config) {
        var tempConfig,
            bestMoment,
            scoreToBeat,
            i,
            currentScore,
            validFormatFound,
            bestFormatIsValid = false;

        if (config._f.length === 0) {
            getParsingFlags(config).invalidFormat = true;
            config._d = new Date(NaN);
            return;
        }

        for (i = 0; i < config._f.length; i++) {
            currentScore = 0;
            validFormatFound = false;
            tempConfig = copyConfig({}, config);
            if (config._useUTC != null) {
                tempConfig._useUTC = config._useUTC;
            }
            tempConfig._f = config._f[i];
            configFromStringAndFormat(tempConfig);

            if (isValid(tempConfig)) {
                validFormatFound = true;
            }

            // if there is any input that was not parsed add a penalty for that format
            currentScore += getParsingFlags(tempConfig).charsLeftOver;

            //or tokens
            currentScore += getParsingFlags(tempConfig).unusedTokens.length * 10;

            getParsingFlags(tempConfig).score = currentScore;

            if (!bestFormatIsValid) {
                if (
                    scoreToBeat == null ||
                    currentScore < scoreToBeat ||
                    validFormatFound
                ) {
                    scoreToBeat = currentScore;
                    bestMoment = tempConfig;
                    if (validFormatFound) {
                        bestFormatIsValid = true;
                    }
                }
            } else {
                if (currentScore < scoreToBeat) {
                    scoreToBeat = currentScore;
                    bestMoment = tempConfig;
                }
            }
        }

        extend(config, bestMoment || tempConfig);
    }

    function configFromObject(config) {
        if (config._d) {
            return;
        }

        var i = normalizeObjectUnits(config._i),
            dayOrDate = i.day === undefined ? i.date : i.day;
        config._a = map(
            [i.year, i.month, dayOrDate, i.hour, i.minute, i.second, i.millisecond],
            function (obj) {
                return obj && parseInt(obj, 10);
            }
        );

        configFromArray(config);
    }

    function createFromConfig(config) {
        var res = new Moment(checkOverflow(prepareConfig(config)));
        if (res._nextDay) {
            // Adding is smart enough around DST
            res.add(1, 'd');
            res._nextDay = undefined;
        }

        return res;
    }

    function prepareConfig(config) {
        var input = config._i,
            format = config._f;

        config._locale = config._locale || getLocale(config._l);

        if (input === null || (format === undefined && input === '')) {
            return createInvalid({ nullInput: true });
        }

        if (typeof input === 'string') {
            config._i = input = config._locale.preparse(input);
        }

        if (isMoment(input)) {
            return new Moment(checkOverflow(input));
        } else if (isDate(input)) {
            config._d = input;
        } else if (isArray(format)) {
            configFromStringAndArray(config);
        } else if (format) {
            configFromStringAndFormat(config);
        } else {
            configFromInput(config);
        }

        if (!isValid(config)) {
            config._d = null;
        }

        return config;
    }

    function configFromInput(config) {
        var input = config._i;
        if (isUndefined(input)) {
            config._d = new Date(hooks.now());
        } else if (isDate(input)) {
            config._d = new Date(input.valueOf());
        } else if (typeof input === 'string') {
            configFromString(config);
        } else if (isArray(input)) {
            config._a = map(input.slice(0), function (obj) {
                return parseInt(obj, 10);
            });
            configFromArray(config);
        } else if (isObject(input)) {
            configFromObject(config);
        } else if (isNumber(input)) {
            // from milliseconds
            config._d = new Date(input);
        } else {
            hooks.createFromInputFallback(config);
        }
    }

    function createLocalOrUTC(input, format, locale, strict, isUTC) {
        var c = {};

        if (format === true || format === false) {
            strict = format;
            format = undefined;
        }

        if (locale === true || locale === false) {
            strict = locale;
            locale = undefined;
        }

        if (
            (isObject(input) && isObjectEmpty(input)) ||
            (isArray(input) && input.length === 0)
        ) {
            input = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c._isAMomentObject = true;
        c._useUTC = c._isUTC = isUTC;
        c._l = locale;
        c._i = input;
        c._f = format;
        c._strict = strict;

        return createFromConfig(c);
    }

    function createLocal(input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, false);
    }

    var prototypeMin = deprecate(
            'moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/',
            function () {
                var other = createLocal.apply(null, arguments);
                if (this.isValid() && other.isValid()) {
                    return other < this ? this : other;
                } else {
                    return createInvalid();
                }
            }
        ),
        prototypeMax = deprecate(
            'moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/',
            function () {
                var other = createLocal.apply(null, arguments);
                if (this.isValid() && other.isValid()) {
                    return other > this ? this : other;
                } else {
                    return createInvalid();
                }
            }
        );

    // Pick a moment m from moments so that m[fn](other) is true for all
    // other. This relies on the function fn to be transitive.
    //
    // moments should either be an array of moment objects or an array, whose
    // first element is an array of moment objects.
    function pickBy(fn, moments) {
        var res, i;
        if (moments.length === 1 && isArray(moments[0])) {
            moments = moments[0];
        }
        if (!moments.length) {
            return createLocal();
        }
        res = moments[0];
        for (i = 1; i < moments.length; ++i) {
            if (!moments[i].isValid() || moments[i][fn](res)) {
                res = moments[i];
            }
        }
        return res;
    }

    // TODO: Use [].sort instead?
    function min() {
        var args = [].slice.call(arguments, 0);

        return pickBy('isBefore', args);
    }

    function max() {
        var args = [].slice.call(arguments, 0);

        return pickBy('isAfter', args);
    }

    var now = function () {
        return Date.now ? Date.now() : +new Date();
    };

    var ordering = [
        'year',
        'quarter',
        'month',
        'week',
        'day',
        'hour',
        'minute',
        'second',
        'millisecond',
    ];

    function isDurationValid(m) {
        var key,
            unitHasDecimal = false,
            i;
        for (key in m) {
            if (
                hasOwnProp(m, key) &&
                !(
                    indexOf.call(ordering, key) !== -1 &&
                    (m[key] == null || !isNaN(m[key]))
                )
            ) {
                return false;
            }
        }

        for (i = 0; i < ordering.length; ++i) {
            if (m[ordering[i]]) {
                if (unitHasDecimal) {
                    return false; // only allow non-integers for smallest unit
                }
                if (parseFloat(m[ordering[i]]) !== toInt(m[ordering[i]])) {
                    unitHasDecimal = true;
                }
            }
        }

        return true;
    }

    function isValid$1() {
        return this._isValid;
    }

    function createInvalid$1() {
        return createDuration(NaN);
    }

    function Duration(duration) {
        var normalizedInput = normalizeObjectUnits(duration),
            years = normalizedInput.year || 0,
            quarters = normalizedInput.quarter || 0,
            months = normalizedInput.month || 0,
            weeks = normalizedInput.week || normalizedInput.isoWeek || 0,
            days = normalizedInput.day || 0,
            hours = normalizedInput.hour || 0,
            minutes = normalizedInput.minute || 0,
            seconds = normalizedInput.second || 0,
            milliseconds = normalizedInput.millisecond || 0;

        this._isValid = isDurationValid(normalizedInput);

        // representation for dateAddRemove
        this._milliseconds =
            +milliseconds +
            seconds * 1e3 + // 1000
            minutes * 6e4 + // 1000 * 60
            hours * 1000 * 60 * 60; //using 1000 * 60 * 60 instead of 36e5 to avoid floating point rounding errors https://github.com/moment/moment/issues/2978
        // Because of dateAddRemove treats 24 hours as different from a
        // day when working around DST, we need to store them separately
        this._days = +days + weeks * 7;
        // It is impossible to translate months into days without knowing
        // which months you are are talking about, so we have to store
        // it separately.
        this._months = +months + quarters * 3 + years * 12;

        this._data = {};

        this._locale = getLocale();

        this._bubble();
    }

    function isDuration(obj) {
        return obj instanceof Duration;
    }

    function absRound(number) {
        if (number < 0) {
            return Math.round(-1 * number) * -1;
        } else {
            return Math.round(number);
        }
    }

    // compare two arrays, return the number of differences
    function compareArrays(array1, array2, dontConvert) {
        var len = Math.min(array1.length, array2.length),
            lengthDiff = Math.abs(array1.length - array2.length),
            diffs = 0,
            i;
        for (i = 0; i < len; i++) {
            if (
                (dontConvert && array1[i] !== array2[i]) ||
                (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))
            ) {
                diffs++;
            }
        }
        return diffs + lengthDiff;
    }

    // FORMATTING

    function offset(token, separator) {
        addFormatToken(token, 0, 0, function () {
            var offset = this.utcOffset(),
                sign = '+';
            if (offset < 0) {
                offset = -offset;
                sign = '-';
            }
            return (
                sign +
                zeroFill(~~(offset / 60), 2) +
                separator +
                zeroFill(~~offset % 60, 2)
            );
        });
    }

    offset('Z', ':');
    offset('ZZ', '');

    // PARSING

    addRegexToken('Z', matchShortOffset);
    addRegexToken('ZZ', matchShortOffset);
    addParseToken(['Z', 'ZZ'], function (input, array, config) {
        config._useUTC = true;
        config._tzm = offsetFromString(matchShortOffset, input);
    });

    // HELPERS

    // timezone chunker
    // '+10:00' > ['10',  '00']
    // '-1530'  > ['-15', '30']
    var chunkOffset = /([\+\-]|\d\d)/gi;

    function offsetFromString(matcher, string) {
        var matches = (string || '').match(matcher),
            chunk,
            parts,
            minutes;

        if (matches === null) {
            return null;
        }

        chunk = matches[matches.length - 1] || [];
        parts = (chunk + '').match(chunkOffset) || ['-', 0, 0];
        minutes = +(parts[1] * 60) + toInt(parts[2]);

        return minutes === 0 ? 0 : parts[0] === '+' ? minutes : -minutes;
    }

    // Return a moment from input, that is local/utc/zone equivalent to model.
    function cloneWithOffset(input, model) {
        var res, diff;
        if (model._isUTC) {
            res = model.clone();
            diff =
                (isMoment(input) || isDate(input)
                    ? input.valueOf()
                    : createLocal(input).valueOf()) - res.valueOf();
            // Use low-level api, because this fn is low-level api.
            res._d.setTime(res._d.valueOf() + diff);
            hooks.updateOffset(res, false);
            return res;
        } else {
            return createLocal(input).local();
        }
    }

    function getDateOffset(m) {
        // On Firefox.24 Date#getTimezoneOffset returns a floating point.
        // https://github.com/moment/moment/pull/1871
        return -Math.round(m._d.getTimezoneOffset());
    }

    // HOOKS

    // This function will be called whenever a moment is mutated.
    // It is intended to keep the offset in sync with the timezone.
    hooks.updateOffset = function () {};

    // MOMENTS

    // keepLocalTime = true means only change the timezone, without
    // affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
    // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
    // +0200, so we adjust the time as needed, to be valid.
    //
    // Keeping the time actually adds/subtracts (one hour)
    // from the actual represented time. That is why we call updateOffset
    // a second time. In case it wants us to change the offset again
    // _changeInProgress == true case, then we have to adjust, because
    // there is no such time in the given timezone.
    function getSetOffset(input, keepLocalTime, keepMinutes) {
        var offset = this._offset || 0,
            localAdjust;
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        if (input != null) {
            if (typeof input === 'string') {
                input = offsetFromString(matchShortOffset, input);
                if (input === null) {
                    return this;
                }
            } else if (Math.abs(input) < 16 && !keepMinutes) {
                input = input * 60;
            }
            if (!this._isUTC && keepLocalTime) {
                localAdjust = getDateOffset(this);
            }
            this._offset = input;
            this._isUTC = true;
            if (localAdjust != null) {
                this.add(localAdjust, 'm');
            }
            if (offset !== input) {
                if (!keepLocalTime || this._changeInProgress) {
                    addSubtract(
                        this,
                        createDuration(input - offset, 'm'),
                        1,
                        false
                    );
                } else if (!this._changeInProgress) {
                    this._changeInProgress = true;
                    hooks.updateOffset(this, true);
                    this._changeInProgress = null;
                }
            }
            return this;
        } else {
            return this._isUTC ? offset : getDateOffset(this);
        }
    }

    function getSetZone(input, keepLocalTime) {
        if (input != null) {
            if (typeof input !== 'string') {
                input = -input;
            }

            this.utcOffset(input, keepLocalTime);

            return this;
        } else {
            return -this.utcOffset();
        }
    }

    function setOffsetToUTC(keepLocalTime) {
        return this.utcOffset(0, keepLocalTime);
    }

    function setOffsetToLocal(keepLocalTime) {
        if (this._isUTC) {
            this.utcOffset(0, keepLocalTime);
            this._isUTC = false;

            if (keepLocalTime) {
                this.subtract(getDateOffset(this), 'm');
            }
        }
        return this;
    }

    function setOffsetToParsedOffset() {
        if (this._tzm != null) {
            this.utcOffset(this._tzm, false, true);
        } else if (typeof this._i === 'string') {
            var tZone = offsetFromString(matchOffset, this._i);
            if (tZone != null) {
                this.utcOffset(tZone);
            } else {
                this.utcOffset(0, true);
            }
        }
        return this;
    }

    function hasAlignedHourOffset(input) {
        if (!this.isValid()) {
            return false;
        }
        input = input ? createLocal(input).utcOffset() : 0;

        return (this.utcOffset() - input) % 60 === 0;
    }

    function isDaylightSavingTime() {
        return (
            this.utcOffset() > this.clone().month(0).utcOffset() ||
            this.utcOffset() > this.clone().month(5).utcOffset()
        );
    }

    function isDaylightSavingTimeShifted() {
        if (!isUndefined(this._isDSTShifted)) {
            return this._isDSTShifted;
        }

        var c = {},
            other;

        copyConfig(c, this);
        c = prepareConfig(c);

        if (c._a) {
            other = c._isUTC ? createUTC(c._a) : createLocal(c._a);
            this._isDSTShifted =
                this.isValid() && compareArrays(c._a, other.toArray()) > 0;
        } else {
            this._isDSTShifted = false;
        }

        return this._isDSTShifted;
    }

    function isLocal() {
        return this.isValid() ? !this._isUTC : false;
    }

    function isUtcOffset() {
        return this.isValid() ? this._isUTC : false;
    }

    function isUtc() {
        return this.isValid() ? this._isUTC && this._offset === 0 : false;
    }

    // ASP.NET json date format regex
    var aspNetRegex = /^(-|\+)?(?:(\d*)[. ])?(\d+):(\d+)(?::(\d+)(\.\d*)?)?$/,
        // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
        // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
        // and further modified to allow for strings containing both week and day
        isoRegex = /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;

    function createDuration(input, key) {
        var duration = input,
            // matching against regexp is expensive, do it on demand
            match = null,
            sign,
            ret,
            diffRes;

        if (isDuration(input)) {
            duration = {
                ms: input._milliseconds,
                d: input._days,
                M: input._months,
            };
        } else if (isNumber(input) || !isNaN(+input)) {
            duration = {};
            if (key) {
                duration[key] = +input;
            } else {
                duration.milliseconds = +input;
            }
        } else if ((match = aspNetRegex.exec(input))) {
            sign = match[1] === '-' ? -1 : 1;
            duration = {
                y: 0,
                d: toInt(match[DATE]) * sign,
                h: toInt(match[HOUR]) * sign,
                m: toInt(match[MINUTE]) * sign,
                s: toInt(match[SECOND]) * sign,
                ms: toInt(absRound(match[MILLISECOND] * 1000)) * sign, // the millisecond decimal point is included in the match
            };
        } else if ((match = isoRegex.exec(input))) {
            sign = match[1] === '-' ? -1 : 1;
            duration = {
                y: parseIso(match[2], sign),
                M: parseIso(match[3], sign),
                w: parseIso(match[4], sign),
                d: parseIso(match[5], sign),
                h: parseIso(match[6], sign),
                m: parseIso(match[7], sign),
                s: parseIso(match[8], sign),
            };
        } else if (duration == null) {
            // checks for null or undefined
            duration = {};
        } else if (
            typeof duration === 'object' &&
            ('from' in duration || 'to' in duration)
        ) {
            diffRes = momentsDifference(
                createLocal(duration.from),
                createLocal(duration.to)
            );

            duration = {};
            duration.ms = diffRes.milliseconds;
            duration.M = diffRes.months;
        }

        ret = new Duration(duration);

        if (isDuration(input) && hasOwnProp(input, '_locale')) {
            ret._locale = input._locale;
        }

        if (isDuration(input) && hasOwnProp(input, '_isValid')) {
            ret._isValid = input._isValid;
        }

        return ret;
    }

    createDuration.fn = Duration.prototype;
    createDuration.invalid = createInvalid$1;

    function parseIso(inp, sign) {
        // We'd normally use ~~inp for this, but unfortunately it also
        // converts floats to ints.
        // inp may be undefined, so careful calling replace on it.
        var res = inp && parseFloat(inp.replace(',', '.'));
        // apply sign while we're at it
        return (isNaN(res) ? 0 : res) * sign;
    }

    function positiveMomentsDifference(base, other) {
        var res = {};

        res.months =
            other.month() - base.month() + (other.year() - base.year()) * 12;
        if (base.clone().add(res.months, 'M').isAfter(other)) {
            --res.months;
        }

        res.milliseconds = +other - +base.clone().add(res.months, 'M');

        return res;
    }

    function momentsDifference(base, other) {
        var res;
        if (!(base.isValid() && other.isValid())) {
            return { milliseconds: 0, months: 0 };
        }

        other = cloneWithOffset(other, base);
        if (base.isBefore(other)) {
            res = positiveMomentsDifference(base, other);
        } else {
            res = positiveMomentsDifference(other, base);
            res.milliseconds = -res.milliseconds;
            res.months = -res.months;
        }

        return res;
    }

    // TODO: remove 'name' arg after deprecation is removed
    function createAdder(direction, name) {
        return function (val, period) {
            var dur, tmp;
            //invert the arguments, but complain about it
            if (period !== null && !isNaN(+period)) {
                deprecateSimple(
                    name,
                    'moment().' +
                        name +
                        '(period, number) is deprecated. Please use moment().' +
                        name +
                        '(number, period). ' +
                        'See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info.'
                );
                tmp = val;
                val = period;
                period = tmp;
            }

            dur = createDuration(val, period);
            addSubtract(this, dur, direction);
            return this;
        };
    }

    function addSubtract(mom, duration, isAdding, updateOffset) {
        var milliseconds = duration._milliseconds,
            days = absRound(duration._days),
            months = absRound(duration._months);

        if (!mom.isValid()) {
            // No op
            return;
        }

        updateOffset = updateOffset == null ? true : updateOffset;

        if (months) {
            setMonth(mom, get(mom, 'Month') + months * isAdding);
        }
        if (days) {
            set$1(mom, 'Date', get(mom, 'Date') + days * isAdding);
        }
        if (milliseconds) {
            mom._d.setTime(mom._d.valueOf() + milliseconds * isAdding);
        }
        if (updateOffset) {
            hooks.updateOffset(mom, days || months);
        }
    }

    var add = createAdder(1, 'add'),
        subtract = createAdder(-1, 'subtract');

    function isString(input) {
        return typeof input === 'string' || input instanceof String;
    }

    // type MomentInput = Moment | Date | string | number | (number | string)[] | MomentInputObject | void; // null | undefined
    function isMomentInput(input) {
        return (
            isMoment(input) ||
            isDate(input) ||
            isString(input) ||
            isNumber(input) ||
            isNumberOrStringArray(input) ||
            isMomentInputObject(input) ||
            input === null ||
            input === undefined
        );
    }

    function isMomentInputObject(input) {
        var objectTest = isObject(input) && !isObjectEmpty(input),
            propertyTest = false,
            properties = [
                'years',
                'year',
                'y',
                'months',
                'month',
                'M',
                'days',
                'day',
                'd',
                'dates',
                'date',
                'D',
                'hours',
                'hour',
                'h',
                'minutes',
                'minute',
                'm',
                'seconds',
                'second',
                's',
                'milliseconds',
                'millisecond',
                'ms',
            ],
            i,
            property;

        for (i = 0; i < properties.length; i += 1) {
            property = properties[i];
            propertyTest = propertyTest || hasOwnProp(input, property);
        }

        return objectTest && propertyTest;
    }

    function isNumberOrStringArray(input) {
        var arrayTest = isArray(input),
            dataTypeTest = false;
        if (arrayTest) {
            dataTypeTest =
                input.filter(function (item) {
                    return !isNumber(item) && isString(input);
                }).length === 0;
        }
        return arrayTest && dataTypeTest;
    }

    function isCalendarSpec(input) {
        var objectTest = isObject(input) && !isObjectEmpty(input),
            propertyTest = false,
            properties = [
                'sameDay',
                'nextDay',
                'lastDay',
                'nextWeek',
                'lastWeek',
                'sameElse',
            ],
            i,
            property;

        for (i = 0; i < properties.length; i += 1) {
            property = properties[i];
            propertyTest = propertyTest || hasOwnProp(input, property);
        }

        return objectTest && propertyTest;
    }

    function getCalendarFormat(myMoment, now) {
        var diff = myMoment.diff(now, 'days', true);
        return diff < -6
            ? 'sameElse'
            : diff < -1
            ? 'lastWeek'
            : diff < 0
            ? 'lastDay'
            : diff < 1
            ? 'sameDay'
            : diff < 2
            ? 'nextDay'
            : diff < 7
            ? 'nextWeek'
            : 'sameElse';
    }

    function calendar$1(time, formats) {
        // Support for single parameter, formats only overload to the calendar function
        if (arguments.length === 1) {
            if (!arguments[0]) {
                time = undefined;
                formats = undefined;
            } else if (isMomentInput(arguments[0])) {
                time = arguments[0];
                formats = undefined;
            } else if (isCalendarSpec(arguments[0])) {
                formats = arguments[0];
                time = undefined;
            }
        }
        // We want to compare the start of today, vs this.
        // Getting start-of-today depends on whether we're local/utc/offset or not.
        var now = time || createLocal(),
            sod = cloneWithOffset(now, this).startOf('day'),
            format = hooks.calendarFormat(this, sod) || 'sameElse',
            output =
                formats &&
                (isFunction(formats[format])
                    ? formats[format].call(this, now)
                    : formats[format]);

        return this.format(
            output || this.localeData().calendar(format, this, createLocal(now))
        );
    }

    function clone() {
        return new Moment(this);
    }

    function isAfter(input, units) {
        var localInput = isMoment(input) ? input : createLocal(input);
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(units) || 'millisecond';
        if (units === 'millisecond') {
            return this.valueOf() > localInput.valueOf();
        } else {
            return localInput.valueOf() < this.clone().startOf(units).valueOf();
        }
    }

    function isBefore(input, units) {
        var localInput = isMoment(input) ? input : createLocal(input);
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(units) || 'millisecond';
        if (units === 'millisecond') {
            return this.valueOf() < localInput.valueOf();
        } else {
            return this.clone().endOf(units).valueOf() < localInput.valueOf();
        }
    }

    function isBetween(from, to, units, inclusivity) {
        var localFrom = isMoment(from) ? from : createLocal(from),
            localTo = isMoment(to) ? to : createLocal(to);
        if (!(this.isValid() && localFrom.isValid() && localTo.isValid())) {
            return false;
        }
        inclusivity = inclusivity || '()';
        return (
            (inclusivity[0] === '('
                ? this.isAfter(localFrom, units)
                : !this.isBefore(localFrom, units)) &&
            (inclusivity[1] === ')'
                ? this.isBefore(localTo, units)
                : !this.isAfter(localTo, units))
        );
    }

    function isSame(input, units) {
        var localInput = isMoment(input) ? input : createLocal(input),
            inputMs;
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(units) || 'millisecond';
        if (units === 'millisecond') {
            return this.valueOf() === localInput.valueOf();
        } else {
            inputMs = localInput.valueOf();
            return (
                this.clone().startOf(units).valueOf() <= inputMs &&
                inputMs <= this.clone().endOf(units).valueOf()
            );
        }
    }

    function isSameOrAfter(input, units) {
        return this.isSame(input, units) || this.isAfter(input, units);
    }

    function isSameOrBefore(input, units) {
        return this.isSame(input, units) || this.isBefore(input, units);
    }

    function diff(input, units, asFloat) {
        var that, zoneDelta, output;

        if (!this.isValid()) {
            return NaN;
        }

        that = cloneWithOffset(input, this);

        if (!that.isValid()) {
            return NaN;
        }

        zoneDelta = (that.utcOffset() - this.utcOffset()) * 6e4;

        units = normalizeUnits(units);

        switch (units) {
            case 'year':
                output = monthDiff(this, that) / 12;
                break;
            case 'month':
                output = monthDiff(this, that);
                break;
            case 'quarter':
                output = monthDiff(this, that) / 3;
                break;
            case 'second':
                output = (this - that) / 1e3;
                break; // 1000
            case 'minute':
                output = (this - that) / 6e4;
                break; // 1000 * 60
            case 'hour':
                output = (this - that) / 36e5;
                break; // 1000 * 60 * 60
            case 'day':
                output = (this - that - zoneDelta) / 864e5;
                break; // 1000 * 60 * 60 * 24, negate dst
            case 'week':
                output = (this - that - zoneDelta) / 6048e5;
                break; // 1000 * 60 * 60 * 24 * 7, negate dst
            default:
                output = this - that;
        }

        return asFloat ? output : absFloor(output);
    }

    function monthDiff(a, b) {
        if (a.date() < b.date()) {
            // end-of-month calculations work correct when the start month has more
            // days than the end month.
            return -monthDiff(b, a);
        }
        // difference in months
        var wholeMonthDiff = (b.year() - a.year()) * 12 + (b.month() - a.month()),
            // b is in (anchor - 1 month, anchor + 1 month)
            anchor = a.clone().add(wholeMonthDiff, 'months'),
            anchor2,
            adjust;

        if (b - anchor < 0) {
            anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor - anchor2);
        } else {
            anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor2 - anchor);
        }

        //check for negative zero, return zero if negative zero
        return -(wholeMonthDiff + adjust) || 0;
    }

    hooks.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZ';
    hooks.defaultFormatUtc = 'YYYY-MM-DDTHH:mm:ss[Z]';

    function toString() {
        return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
    }

    function toISOString(keepOffset) {
        if (!this.isValid()) {
            return null;
        }
        var utc = keepOffset !== true,
            m = utc ? this.clone().utc() : this;
        if (m.year() < 0 || m.year() > 9999) {
            return formatMoment(
                m,
                utc
                    ? 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]'
                    : 'YYYYYY-MM-DD[T]HH:mm:ss.SSSZ'
            );
        }
        if (isFunction(Date.prototype.toISOString)) {
            // native implementation is ~50x faster, use it when we can
            if (utc) {
                return this.toDate().toISOString();
            } else {
                return new Date(this.valueOf() + this.utcOffset() * 60 * 1000)
                    .toISOString()
                    .replace('Z', formatMoment(m, 'Z'));
            }
        }
        return formatMoment(
            m,
            utc ? 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]' : 'YYYY-MM-DD[T]HH:mm:ss.SSSZ'
        );
    }

    /**
     * Return a human readable representation of a moment that can
     * also be evaluated to get a new moment which is the same
     *
     * @link https://nodejs.org/dist/latest/docs/api/util.html#util_custom_inspect_function_on_objects
     */
    function inspect() {
        if (!this.isValid()) {
            return 'moment.invalid(/* ' + this._i + ' */)';
        }
        var func = 'moment',
            zone = '',
            prefix,
            year,
            datetime,
            suffix;
        if (!this.isLocal()) {
            func = this.utcOffset() === 0 ? 'moment.utc' : 'moment.parseZone';
            zone = 'Z';
        }
        prefix = '[' + func + '("]';
        year = 0 <= this.year() && this.year() <= 9999 ? 'YYYY' : 'YYYYYY';
        datetime = '-MM-DD[T]HH:mm:ss.SSS';
        suffix = zone + '[")]';

        return this.format(prefix + year + datetime + suffix);
    }

    function format(inputString) {
        if (!inputString) {
            inputString = this.isUtc()
                ? hooks.defaultFormatUtc
                : hooks.defaultFormat;
        }
        var output = formatMoment(this, inputString);
        return this.localeData().postformat(output);
    }

    function from(time, withoutSuffix) {
        if (
            this.isValid() &&
            ((isMoment(time) && time.isValid()) || createLocal(time).isValid())
        ) {
            return createDuration({ to: this, from: time })
                .locale(this.locale())
                .humanize(!withoutSuffix);
        } else {
            return this.localeData().invalidDate();
        }
    }

    function fromNow(withoutSuffix) {
        return this.from(createLocal(), withoutSuffix);
    }

    function to(time, withoutSuffix) {
        if (
            this.isValid() &&
            ((isMoment(time) && time.isValid()) || createLocal(time).isValid())
        ) {
            return createDuration({ from: this, to: time })
                .locale(this.locale())
                .humanize(!withoutSuffix);
        } else {
            return this.localeData().invalidDate();
        }
    }

    function toNow(withoutSuffix) {
        return this.to(createLocal(), withoutSuffix);
    }

    // If passed a locale key, it will set the locale for this
    // instance.  Otherwise, it will return the locale configuration
    // variables for this instance.
    function locale(key) {
        var newLocaleData;

        if (key === undefined) {
            return this._locale._abbr;
        } else {
            newLocaleData = getLocale(key);
            if (newLocaleData != null) {
                this._locale = newLocaleData;
            }
            return this;
        }
    }

    var lang = deprecate(
        'moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.',
        function (key) {
            if (key === undefined) {
                return this.localeData();
            } else {
                return this.locale(key);
            }
        }
    );

    function localeData() {
        return this._locale;
    }

    var MS_PER_SECOND = 1000,
        MS_PER_MINUTE = 60 * MS_PER_SECOND,
        MS_PER_HOUR = 60 * MS_PER_MINUTE,
        MS_PER_400_YEARS = (365 * 400 + 97) * 24 * MS_PER_HOUR;

    // actual modulo - handles negative numbers (for dates before 1970):
    function mod$1(dividend, divisor) {
        return ((dividend % divisor) + divisor) % divisor;
    }

    function localStartOfDate(y, m, d) {
        // the date constructor remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0) {
            // preserve leap years using a full 400 year cycle, then reset
            return new Date(y + 400, m, d) - MS_PER_400_YEARS;
        } else {
            return new Date(y, m, d).valueOf();
        }
    }

    function utcStartOfDate(y, m, d) {
        // Date.UTC remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0) {
            // preserve leap years using a full 400 year cycle, then reset
            return Date.UTC(y + 400, m, d) - MS_PER_400_YEARS;
        } else {
            return Date.UTC(y, m, d);
        }
    }

    function startOf(units) {
        var time, startOfDate;
        units = normalizeUnits(units);
        if (units === undefined || units === 'millisecond' || !this.isValid()) {
            return this;
        }

        startOfDate = this._isUTC ? utcStartOfDate : localStartOfDate;

        switch (units) {
            case 'year':
                time = startOfDate(this.year(), 0, 1);
                break;
            case 'quarter':
                time = startOfDate(
                    this.year(),
                    this.month() - (this.month() % 3),
                    1
                );
                break;
            case 'month':
                time = startOfDate(this.year(), this.month(), 1);
                break;
            case 'week':
                time = startOfDate(
                    this.year(),
                    this.month(),
                    this.date() - this.weekday()
                );
                break;
            case 'isoWeek':
                time = startOfDate(
                    this.year(),
                    this.month(),
                    this.date() - (this.isoWeekday() - 1)
                );
                break;
            case 'day':
            case 'date':
                time = startOfDate(this.year(), this.month(), this.date());
                break;
            case 'hour':
                time = this._d.valueOf();
                time -= mod$1(
                    time + (this._isUTC ? 0 : this.utcOffset() * MS_PER_MINUTE),
                    MS_PER_HOUR
                );
                break;
            case 'minute':
                time = this._d.valueOf();
                time -= mod$1(time, MS_PER_MINUTE);
                break;
            case 'second':
                time = this._d.valueOf();
                time -= mod$1(time, MS_PER_SECOND);
                break;
        }

        this._d.setTime(time);
        hooks.updateOffset(this, true);
        return this;
    }

    function endOf(units) {
        var time, startOfDate;
        units = normalizeUnits(units);
        if (units === undefined || units === 'millisecond' || !this.isValid()) {
            return this;
        }

        startOfDate = this._isUTC ? utcStartOfDate : localStartOfDate;

        switch (units) {
            case 'year':
                time = startOfDate(this.year() + 1, 0, 1) - 1;
                break;
            case 'quarter':
                time =
                    startOfDate(
                        this.year(),
                        this.month() - (this.month() % 3) + 3,
                        1
                    ) - 1;
                break;
            case 'month':
                time = startOfDate(this.year(), this.month() + 1, 1) - 1;
                break;
            case 'week':
                time =
                    startOfDate(
                        this.year(),
                        this.month(),
                        this.date() - this.weekday() + 7
                    ) - 1;
                break;
            case 'isoWeek':
                time =
                    startOfDate(
                        this.year(),
                        this.month(),
                        this.date() - (this.isoWeekday() - 1) + 7
                    ) - 1;
                break;
            case 'day':
            case 'date':
                time = startOfDate(this.year(), this.month(), this.date() + 1) - 1;
                break;
            case 'hour':
                time = this._d.valueOf();
                time +=
                    MS_PER_HOUR -
                    mod$1(
                        time + (this._isUTC ? 0 : this.utcOffset() * MS_PER_MINUTE),
                        MS_PER_HOUR
                    ) -
                    1;
                break;
            case 'minute':
                time = this._d.valueOf();
                time += MS_PER_MINUTE - mod$1(time, MS_PER_MINUTE) - 1;
                break;
            case 'second':
                time = this._d.valueOf();
                time += MS_PER_SECOND - mod$1(time, MS_PER_SECOND) - 1;
                break;
        }

        this._d.setTime(time);
        hooks.updateOffset(this, true);
        return this;
    }

    function valueOf() {
        return this._d.valueOf() - (this._offset || 0) * 60000;
    }

    function unix() {
        return Math.floor(this.valueOf() / 1000);
    }

    function toDate() {
        return new Date(this.valueOf());
    }

    function toArray() {
        var m = this;
        return [
            m.year(),
            m.month(),
            m.date(),
            m.hour(),
            m.minute(),
            m.second(),
            m.millisecond(),
        ];
    }

    function toObject() {
        var m = this;
        return {
            years: m.year(),
            months: m.month(),
            date: m.date(),
            hours: m.hours(),
            minutes: m.minutes(),
            seconds: m.seconds(),
            milliseconds: m.milliseconds(),
        };
    }

    function toJSON() {
        // new Date(NaN).toJSON() === null
        return this.isValid() ? this.toISOString() : null;
    }

    function isValid$2() {
        return isValid(this);
    }

    function parsingFlags() {
        return extend({}, getParsingFlags(this));
    }

    function invalidAt() {
        return getParsingFlags(this).overflow;
    }

    function creationData() {
        return {
            input: this._i,
            format: this._f,
            locale: this._locale,
            isUTC: this._isUTC,
            strict: this._strict,
        };
    }

    addFormatToken('N', 0, 0, 'eraAbbr');
    addFormatToken('NN', 0, 0, 'eraAbbr');
    addFormatToken('NNN', 0, 0, 'eraAbbr');
    addFormatToken('NNNN', 0, 0, 'eraName');
    addFormatToken('NNNNN', 0, 0, 'eraNarrow');

    addFormatToken('y', ['y', 1], 'yo', 'eraYear');
    addFormatToken('y', ['yy', 2], 0, 'eraYear');
    addFormatToken('y', ['yyy', 3], 0, 'eraYear');
    addFormatToken('y', ['yyyy', 4], 0, 'eraYear');

    addRegexToken('N', matchEraAbbr);
    addRegexToken('NN', matchEraAbbr);
    addRegexToken('NNN', matchEraAbbr);
    addRegexToken('NNNN', matchEraName);
    addRegexToken('NNNNN', matchEraNarrow);

    addParseToken(['N', 'NN', 'NNN', 'NNNN', 'NNNNN'], function (
        input,
        array,
        config,
        token
    ) {
        var era = config._locale.erasParse(input, token, config._strict);
        if (era) {
            getParsingFlags(config).era = era;
        } else {
            getParsingFlags(config).invalidEra = input;
        }
    });

    addRegexToken('y', matchUnsigned);
    addRegexToken('yy', matchUnsigned);
    addRegexToken('yyy', matchUnsigned);
    addRegexToken('yyyy', matchUnsigned);
    addRegexToken('yo', matchEraYearOrdinal);

    addParseToken(['y', 'yy', 'yyy', 'yyyy'], YEAR);
    addParseToken(['yo'], function (input, array, config, token) {
        var match;
        if (config._locale._eraYearOrdinalRegex) {
            match = input.match(config._locale._eraYearOrdinalRegex);
        }

        if (config._locale.eraYearOrdinalParse) {
            array[YEAR] = config._locale.eraYearOrdinalParse(input, match);
        } else {
            array[YEAR] = parseInt(input, 10);
        }
    });

    function localeEras(m, format) {
        var i,
            l,
            date,
            eras = this._eras || getLocale('en')._eras;
        for (i = 0, l = eras.length; i < l; ++i) {
            switch (typeof eras[i].since) {
                case 'string':
                    // truncate time
                    date = hooks(eras[i].since).startOf('day');
                    eras[i].since = date.valueOf();
                    break;
            }

            switch (typeof eras[i].until) {
                case 'undefined':
                    eras[i].until = +Infinity;
                    break;
                case 'string':
                    // truncate time
                    date = hooks(eras[i].until).startOf('day').valueOf();
                    eras[i].until = date.valueOf();
                    break;
            }
        }
        return eras;
    }

    function localeErasParse(eraName, format, strict) {
        var i,
            l,
            eras = this.eras(),
            name,
            abbr,
            narrow;
        eraName = eraName.toUpperCase();

        for (i = 0, l = eras.length; i < l; ++i) {
            name = eras[i].name.toUpperCase();
            abbr = eras[i].abbr.toUpperCase();
            narrow = eras[i].narrow.toUpperCase();

            if (strict) {
                switch (format) {
                    case 'N':
                    case 'NN':
                    case 'NNN':
                        if (abbr === eraName) {
                            return eras[i];
                        }
                        break;

                    case 'NNNN':
                        if (name === eraName) {
                            return eras[i];
                        }
                        break;

                    case 'NNNNN':
                        if (narrow === eraName) {
                            return eras[i];
                        }
                        break;
                }
            } else if ([name, abbr, narrow].indexOf(eraName) >= 0) {
                return eras[i];
            }
        }
    }

    function localeErasConvertYear(era, year) {
        var dir = era.since <= era.until ? +1 : -1;
        if (year === undefined) {
            return hooks(era.since).year();
        } else {
            return hooks(era.since).year() + (year - era.offset) * dir;
        }
    }

    function getEraName() {
        var i,
            l,
            val,
            eras = this.localeData().eras();
        for (i = 0, l = eras.length; i < l; ++i) {
            // truncate time
            val = this.clone().startOf('day').valueOf();

            if (eras[i].since <= val && val <= eras[i].until) {
                return eras[i].name;
            }
            if (eras[i].until <= val && val <= eras[i].since) {
                return eras[i].name;
            }
        }

        return '';
    }

    function getEraNarrow() {
        var i,
            l,
            val,
            eras = this.localeData().eras();
        for (i = 0, l = eras.length; i < l; ++i) {
            // truncate time
            val = this.clone().startOf('day').valueOf();

            if (eras[i].since <= val && val <= eras[i].until) {
                return eras[i].narrow;
            }
            if (eras[i].until <= val && val <= eras[i].since) {
                return eras[i].narrow;
            }
        }

        return '';
    }

    function getEraAbbr() {
        var i,
            l,
            val,
            eras = this.localeData().eras();
        for (i = 0, l = eras.length; i < l; ++i) {
            // truncate time
            val = this.clone().startOf('day').valueOf();

            if (eras[i].since <= val && val <= eras[i].until) {
                return eras[i].abbr;
            }
            if (eras[i].until <= val && val <= eras[i].since) {
                return eras[i].abbr;
            }
        }

        return '';
    }

    function getEraYear() {
        var i,
            l,
            dir,
            val,
            eras = this.localeData().eras();
        for (i = 0, l = eras.length; i < l; ++i) {
            dir = eras[i].since <= eras[i].until ? +1 : -1;

            // truncate time
            val = this.clone().startOf('day').valueOf();

            if (
                (eras[i].since <= val && val <= eras[i].until) ||
                (eras[i].until <= val && val <= eras[i].since)
            ) {
                return (
                    (this.year() - hooks(eras[i].since).year()) * dir +
                    eras[i].offset
                );
            }
        }

        return this.year();
    }

    function erasNameRegex(isStrict) {
        if (!hasOwnProp(this, '_erasNameRegex')) {
            computeErasParse.call(this);
        }
        return isStrict ? this._erasNameRegex : this._erasRegex;
    }

    function erasAbbrRegex(isStrict) {
        if (!hasOwnProp(this, '_erasAbbrRegex')) {
            computeErasParse.call(this);
        }
        return isStrict ? this._erasAbbrRegex : this._erasRegex;
    }

    function erasNarrowRegex(isStrict) {
        if (!hasOwnProp(this, '_erasNarrowRegex')) {
            computeErasParse.call(this);
        }
        return isStrict ? this._erasNarrowRegex : this._erasRegex;
    }

    function matchEraAbbr(isStrict, locale) {
        return locale.erasAbbrRegex(isStrict);
    }

    function matchEraName(isStrict, locale) {
        return locale.erasNameRegex(isStrict);
    }

    function matchEraNarrow(isStrict, locale) {
        return locale.erasNarrowRegex(isStrict);
    }

    function matchEraYearOrdinal(isStrict, locale) {
        return locale._eraYearOrdinalRegex || matchUnsigned;
    }

    function computeErasParse() {
        var abbrPieces = [],
            namePieces = [],
            narrowPieces = [],
            mixedPieces = [],
            i,
            l,
            eras = this.eras();

        for (i = 0, l = eras.length; i < l; ++i) {
            namePieces.push(regexEscape(eras[i].name));
            abbrPieces.push(regexEscape(eras[i].abbr));
            narrowPieces.push(regexEscape(eras[i].narrow));

            mixedPieces.push(regexEscape(eras[i].name));
            mixedPieces.push(regexEscape(eras[i].abbr));
            mixedPieces.push(regexEscape(eras[i].narrow));
        }

        this._erasRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
        this._erasNameRegex = new RegExp('^(' + namePieces.join('|') + ')', 'i');
        this._erasAbbrRegex = new RegExp('^(' + abbrPieces.join('|') + ')', 'i');
        this._erasNarrowRegex = new RegExp(
            '^(' + narrowPieces.join('|') + ')',
            'i'
        );
    }

    // FORMATTING

    addFormatToken(0, ['gg', 2], 0, function () {
        return this.weekYear() % 100;
    });

    addFormatToken(0, ['GG', 2], 0, function () {
        return this.isoWeekYear() % 100;
    });

    function addWeekYearFormatToken(token, getter) {
        addFormatToken(0, [token, token.length], 0, getter);
    }

    addWeekYearFormatToken('gggg', 'weekYear');
    addWeekYearFormatToken('ggggg', 'weekYear');
    addWeekYearFormatToken('GGGG', 'isoWeekYear');
    addWeekYearFormatToken('GGGGG', 'isoWeekYear');

    // ALIASES

    addUnitAlias('weekYear', 'gg');
    addUnitAlias('isoWeekYear', 'GG');

    // PRIORITY

    addUnitPriority('weekYear', 1);
    addUnitPriority('isoWeekYear', 1);

    // PARSING

    addRegexToken('G', matchSigned);
    addRegexToken('g', matchSigned);
    addRegexToken('GG', match1to2, match2);
    addRegexToken('gg', match1to2, match2);
    addRegexToken('GGGG', match1to4, match4);
    addRegexToken('gggg', match1to4, match4);
    addRegexToken('GGGGG', match1to6, match6);
    addRegexToken('ggggg', match1to6, match6);

    addWeekParseToken(['gggg', 'ggggg', 'GGGG', 'GGGGG'], function (
        input,
        week,
        config,
        token
    ) {
        week[token.substr(0, 2)] = toInt(input);
    });

    addWeekParseToken(['gg', 'GG'], function (input, week, config, token) {
        week[token] = hooks.parseTwoDigitYear(input);
    });

    // MOMENTS

    function getSetWeekYear(input) {
        return getSetWeekYearHelper.call(
            this,
            input,
            this.week(),
            this.weekday(),
            this.localeData()._week.dow,
            this.localeData()._week.doy
        );
    }

    function getSetISOWeekYear(input) {
        return getSetWeekYearHelper.call(
            this,
            input,
            this.isoWeek(),
            this.isoWeekday(),
            1,
            4
        );
    }

    function getISOWeeksInYear() {
        return weeksInYear(this.year(), 1, 4);
    }

    function getISOWeeksInISOWeekYear() {
        return weeksInYear(this.isoWeekYear(), 1, 4);
    }

    function getWeeksInYear() {
        var weekInfo = this.localeData()._week;
        return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
    }

    function getWeeksInWeekYear() {
        var weekInfo = this.localeData()._week;
        return weeksInYear(this.weekYear(), weekInfo.dow, weekInfo.doy);
    }

    function getSetWeekYearHelper(input, week, weekday, dow, doy) {
        var weeksTarget;
        if (input == null) {
            return weekOfYear(this, dow, doy).year;
        } else {
            weeksTarget = weeksInYear(input, dow, doy);
            if (week > weeksTarget) {
                week = weeksTarget;
            }
            return setWeekAll.call(this, input, week, weekday, dow, doy);
        }
    }

    function setWeekAll(weekYear, week, weekday, dow, doy) {
        var dayOfYearData = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy),
            date = createUTCDate(dayOfYearData.year, 0, dayOfYearData.dayOfYear);

        this.year(date.getUTCFullYear());
        this.month(date.getUTCMonth());
        this.date(date.getUTCDate());
        return this;
    }

    // FORMATTING

    addFormatToken('Q', 0, 'Qo', 'quarter');

    // ALIASES

    addUnitAlias('quarter', 'Q');

    // PRIORITY

    addUnitPriority('quarter', 7);

    // PARSING

    addRegexToken('Q', match1);
    addParseToken('Q', function (input, array) {
        array[MONTH] = (toInt(input) - 1) * 3;
    });

    // MOMENTS

    function getSetQuarter(input) {
        return input == null
            ? Math.ceil((this.month() + 1) / 3)
            : this.month((input - 1) * 3 + (this.month() % 3));
    }

    // FORMATTING

    addFormatToken('D', ['DD', 2], 'Do', 'date');

    // ALIASES

    addUnitAlias('date', 'D');

    // PRIORITY
    addUnitPriority('date', 9);

    // PARSING

    addRegexToken('D', match1to2);
    addRegexToken('DD', match1to2, match2);
    addRegexToken('Do', function (isStrict, locale) {
        // TODO: Remove "ordinalParse" fallback in next major release.
        return isStrict
            ? locale._dayOfMonthOrdinalParse || locale._ordinalParse
            : locale._dayOfMonthOrdinalParseLenient;
    });

    addParseToken(['D', 'DD'], DATE);
    addParseToken('Do', function (input, array) {
        array[DATE] = toInt(input.match(match1to2)[0]);
    });

    // MOMENTS

    var getSetDayOfMonth = makeGetSet('Date', true);

    // FORMATTING

    addFormatToken('DDD', ['DDDD', 3], 'DDDo', 'dayOfYear');

    // ALIASES

    addUnitAlias('dayOfYear', 'DDD');

    // PRIORITY
    addUnitPriority('dayOfYear', 4);

    // PARSING

    addRegexToken('DDD', match1to3);
    addRegexToken('DDDD', match3);
    addParseToken(['DDD', 'DDDD'], function (input, array, config) {
        config._dayOfYear = toInt(input);
    });

    // HELPERS

    // MOMENTS

    function getSetDayOfYear(input) {
        var dayOfYear =
            Math.round(
                (this.clone().startOf('day') - this.clone().startOf('year')) / 864e5
            ) + 1;
        return input == null ? dayOfYear : this.add(input - dayOfYear, 'd');
    }

    // FORMATTING

    addFormatToken('m', ['mm', 2], 0, 'minute');

    // ALIASES

    addUnitAlias('minute', 'm');

    // PRIORITY

    addUnitPriority('minute', 14);

    // PARSING

    addRegexToken('m', match1to2);
    addRegexToken('mm', match1to2, match2);
    addParseToken(['m', 'mm'], MINUTE);

    // MOMENTS

    var getSetMinute = makeGetSet('Minutes', false);

    // FORMATTING

    addFormatToken('s', ['ss', 2], 0, 'second');

    // ALIASES

    addUnitAlias('second', 's');

    // PRIORITY

    addUnitPriority('second', 15);

    // PARSING

    addRegexToken('s', match1to2);
    addRegexToken('ss', match1to2, match2);
    addParseToken(['s', 'ss'], SECOND);

    // MOMENTS

    var getSetSecond = makeGetSet('Seconds', false);

    // FORMATTING

    addFormatToken('S', 0, 0, function () {
        return ~~(this.millisecond() / 100);
    });

    addFormatToken(0, ['SS', 2], 0, function () {
        return ~~(this.millisecond() / 10);
    });

    addFormatToken(0, ['SSS', 3], 0, 'millisecond');
    addFormatToken(0, ['SSSS', 4], 0, function () {
        return this.millisecond() * 10;
    });
    addFormatToken(0, ['SSSSS', 5], 0, function () {
        return this.millisecond() * 100;
    });
    addFormatToken(0, ['SSSSSS', 6], 0, function () {
        return this.millisecond() * 1000;
    });
    addFormatToken(0, ['SSSSSSS', 7], 0, function () {
        return this.millisecond() * 10000;
    });
    addFormatToken(0, ['SSSSSSSS', 8], 0, function () {
        return this.millisecond() * 100000;
    });
    addFormatToken(0, ['SSSSSSSSS', 9], 0, function () {
        return this.millisecond() * 1000000;
    });

    // ALIASES

    addUnitAlias('millisecond', 'ms');

    // PRIORITY

    addUnitPriority('millisecond', 16);

    // PARSING

    addRegexToken('S', match1to3, match1);
    addRegexToken('SS', match1to3, match2);
    addRegexToken('SSS', match1to3, match3);

    var token, getSetMillisecond;
    for (token = 'SSSS'; token.length <= 9; token += 'S') {
        addRegexToken(token, matchUnsigned);
    }

    function parseMs(input, array) {
        array[MILLISECOND] = toInt(('0.' + input) * 1000);
    }

    for (token = 'S'; token.length <= 9; token += 'S') {
        addParseToken(token, parseMs);
    }

    getSetMillisecond = makeGetSet('Milliseconds', false);

    // FORMATTING

    addFormatToken('z', 0, 0, 'zoneAbbr');
    addFormatToken('zz', 0, 0, 'zoneName');

    // MOMENTS

    function getZoneAbbr() {
        return this._isUTC ? 'UTC' : '';
    }

    function getZoneName() {
        return this._isUTC ? 'Coordinated Universal Time' : '';
    }

    var proto = Moment.prototype;

    proto.add = add;
    proto.calendar = calendar$1;
    proto.clone = clone;
    proto.diff = diff;
    proto.endOf = endOf;
    proto.format = format;
    proto.from = from;
    proto.fromNow = fromNow;
    proto.to = to;
    proto.toNow = toNow;
    proto.get = stringGet;
    proto.invalidAt = invalidAt;
    proto.isAfter = isAfter;
    proto.isBefore = isBefore;
    proto.isBetween = isBetween;
    proto.isSame = isSame;
    proto.isSameOrAfter = isSameOrAfter;
    proto.isSameOrBefore = isSameOrBefore;
    proto.isValid = isValid$2;
    proto.lang = lang;
    proto.locale = locale;
    proto.localeData = localeData;
    proto.max = prototypeMax;
    proto.min = prototypeMin;
    proto.parsingFlags = parsingFlags;
    proto.set = stringSet;
    proto.startOf = startOf;
    proto.subtract = subtract;
    proto.toArray = toArray;
    proto.toObject = toObject;
    proto.toDate = toDate;
    proto.toISOString = toISOString;
    proto.inspect = inspect;
    if (typeof Symbol !== 'undefined' && Symbol.for != null) {
        proto[Symbol.for('nodejs.util.inspect.custom')] = function () {
            return 'Moment<' + this.format() + '>';
        };
    }
    proto.toJSON = toJSON;
    proto.toString = toString;
    proto.unix = unix;
    proto.valueOf = valueOf;
    proto.creationData = creationData;
    proto.eraName = getEraName;
    proto.eraNarrow = getEraNarrow;
    proto.eraAbbr = getEraAbbr;
    proto.eraYear = getEraYear;
    proto.year = getSetYear;
    proto.isLeapYear = getIsLeapYear;
    proto.weekYear = getSetWeekYear;
    proto.isoWeekYear = getSetISOWeekYear;
    proto.quarter = proto.quarters = getSetQuarter;
    proto.month = getSetMonth;
    proto.daysInMonth = getDaysInMonth;
    proto.week = proto.weeks = getSetWeek;
    proto.isoWeek = proto.isoWeeks = getSetISOWeek;
    proto.weeksInYear = getWeeksInYear;
    proto.weeksInWeekYear = getWeeksInWeekYear;
    proto.isoWeeksInYear = getISOWeeksInYear;
    proto.isoWeeksInISOWeekYear = getISOWeeksInISOWeekYear;
    proto.date = getSetDayOfMonth;
    proto.day = proto.days = getSetDayOfWeek;
    proto.weekday = getSetLocaleDayOfWeek;
    proto.isoWeekday = getSetISODayOfWeek;
    proto.dayOfYear = getSetDayOfYear;
    proto.hour = proto.hours = getSetHour;
    proto.minute = proto.minutes = getSetMinute;
    proto.second = proto.seconds = getSetSecond;
    proto.millisecond = proto.milliseconds = getSetMillisecond;
    proto.utcOffset = getSetOffset;
    proto.utc = setOffsetToUTC;
    proto.local = setOffsetToLocal;
    proto.parseZone = setOffsetToParsedOffset;
    proto.hasAlignedHourOffset = hasAlignedHourOffset;
    proto.isDST = isDaylightSavingTime;
    proto.isLocal = isLocal;
    proto.isUtcOffset = isUtcOffset;
    proto.isUtc = isUtc;
    proto.isUTC = isUtc;
    proto.zoneAbbr = getZoneAbbr;
    proto.zoneName = getZoneName;
    proto.dates = deprecate(
        'dates accessor is deprecated. Use date instead.',
        getSetDayOfMonth
    );
    proto.months = deprecate(
        'months accessor is deprecated. Use month instead',
        getSetMonth
    );
    proto.years = deprecate(
        'years accessor is deprecated. Use year instead',
        getSetYear
    );
    proto.zone = deprecate(
        'moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/',
        getSetZone
    );
    proto.isDSTShifted = deprecate(
        'isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information',
        isDaylightSavingTimeShifted
    );

    function createUnix(input) {
        return createLocal(input * 1000);
    }

    function createInZone() {
        return createLocal.apply(null, arguments).parseZone();
    }

    function preParsePostFormat(string) {
        return string;
    }

    var proto$1 = Locale.prototype;

    proto$1.calendar = calendar;
    proto$1.longDateFormat = longDateFormat;
    proto$1.invalidDate = invalidDate;
    proto$1.ordinal = ordinal;
    proto$1.preparse = preParsePostFormat;
    proto$1.postformat = preParsePostFormat;
    proto$1.relativeTime = relativeTime;
    proto$1.pastFuture = pastFuture;
    proto$1.set = set;
    proto$1.eras = localeEras;
    proto$1.erasParse = localeErasParse;
    proto$1.erasConvertYear = localeErasConvertYear;
    proto$1.erasAbbrRegex = erasAbbrRegex;
    proto$1.erasNameRegex = erasNameRegex;
    proto$1.erasNarrowRegex = erasNarrowRegex;

    proto$1.months = localeMonths;
    proto$1.monthsShort = localeMonthsShort;
    proto$1.monthsParse = localeMonthsParse;
    proto$1.monthsRegex = monthsRegex;
    proto$1.monthsShortRegex = monthsShortRegex;
    proto$1.week = localeWeek;
    proto$1.firstDayOfYear = localeFirstDayOfYear;
    proto$1.firstDayOfWeek = localeFirstDayOfWeek;

    proto$1.weekdays = localeWeekdays;
    proto$1.weekdaysMin = localeWeekdaysMin;
    proto$1.weekdaysShort = localeWeekdaysShort;
    proto$1.weekdaysParse = localeWeekdaysParse;

    proto$1.weekdaysRegex = weekdaysRegex;
    proto$1.weekdaysShortRegex = weekdaysShortRegex;
    proto$1.weekdaysMinRegex = weekdaysMinRegex;

    proto$1.isPM = localeIsPM;
    proto$1.meridiem = localeMeridiem;

    function get$1(format, index, field, setter) {
        var locale = getLocale(),
            utc = createUTC().set(setter, index);
        return locale[field](utc, format);
    }

    function listMonthsImpl(format, index, field) {
        if (isNumber(format)) {
            index = format;
            format = undefined;
        }

        format = format || '';

        if (index != null) {
            return get$1(format, index, field, 'month');
        }

        var i,
            out = [];
        for (i = 0; i < 12; i++) {
            out[i] = get$1(format, i, field, 'month');
        }
        return out;
    }

    // ()
    // (5)
    // (fmt, 5)
    // (fmt)
    // (true)
    // (true, 5)
    // (true, fmt, 5)
    // (true, fmt)
    function listWeekdaysImpl(localeSorted, format, index, field) {
        if (typeof localeSorted === 'boolean') {
            if (isNumber(format)) {
                index = format;
                format = undefined;
            }

            format = format || '';
        } else {
            format = localeSorted;
            index = format;
            localeSorted = false;

            if (isNumber(format)) {
                index = format;
                format = undefined;
            }

            format = format || '';
        }

        var locale = getLocale(),
            shift = localeSorted ? locale._week.dow : 0,
            i,
            out = [];

        if (index != null) {
            return get$1(format, (index + shift) % 7, field, 'day');
        }

        for (i = 0; i < 7; i++) {
            out[i] = get$1(format, (i + shift) % 7, field, 'day');
        }
        return out;
    }

    function listMonths(format, index) {
        return listMonthsImpl(format, index, 'months');
    }

    function listMonthsShort(format, index) {
        return listMonthsImpl(format, index, 'monthsShort');
    }

    function listWeekdays(localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdays');
    }

    function listWeekdaysShort(localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdaysShort');
    }

    function listWeekdaysMin(localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdaysMin');
    }

    getSetGlobalLocale('en', {
        eras: [
            {
                since: '0001-01-01',
                until: +Infinity,
                offset: 1,
                name: 'Anno Domini',
                narrow: 'AD',
                abbr: 'AD',
            },
            {
                since: '0000-12-31',
                until: -Infinity,
                offset: 1,
                name: 'Before Christ',
                narrow: 'BC',
                abbr: 'BC',
            },
        ],
        dayOfMonthOrdinalParse: /\d{1,2}(th|st|nd|rd)/,
        ordinal: function (number) {
            var b = number % 10,
                output =
                    toInt((number % 100) / 10) === 1
                        ? 'th'
                        : b === 1
                        ? 'st'
                        : b === 2
                        ? 'nd'
                        : b === 3
                        ? 'rd'
                        : 'th';
            return number + output;
        },
    });

    // Side effect imports

    hooks.lang = deprecate(
        'moment.lang is deprecated. Use moment.locale instead.',
        getSetGlobalLocale
    );
    hooks.langData = deprecate(
        'moment.langData is deprecated. Use moment.localeData instead.',
        getLocale
    );

    var mathAbs = Math.abs;

    function abs() {
        var data = this._data;

        this._milliseconds = mathAbs(this._milliseconds);
        this._days = mathAbs(this._days);
        this._months = mathAbs(this._months);

        data.milliseconds = mathAbs(data.milliseconds);
        data.seconds = mathAbs(data.seconds);
        data.minutes = mathAbs(data.minutes);
        data.hours = mathAbs(data.hours);
        data.months = mathAbs(data.months);
        data.years = mathAbs(data.years);

        return this;
    }

    function addSubtract$1(duration, input, value, direction) {
        var other = createDuration(input, value);

        duration._milliseconds += direction * other._milliseconds;
        duration._days += direction * other._days;
        duration._months += direction * other._months;

        return duration._bubble();
    }

    // supports only 2.0-style add(1, 's') or add(duration)
    function add$1(input, value) {
        return addSubtract$1(this, input, value, 1);
    }

    // supports only 2.0-style subtract(1, 's') or subtract(duration)
    function subtract$1(input, value) {
        return addSubtract$1(this, input, value, -1);
    }

    function absCeil(number) {
        if (number < 0) {
            return Math.floor(number);
        } else {
            return Math.ceil(number);
        }
    }

    function bubble() {
        var milliseconds = this._milliseconds,
            days = this._days,
            months = this._months,
            data = this._data,
            seconds,
            minutes,
            hours,
            years,
            monthsFromDays;

        // if we have a mix of positive and negative values, bubble down first
        // check: https://github.com/moment/moment/issues/2166
        if (
            !(
                (milliseconds >= 0 && days >= 0 && months >= 0) ||
                (milliseconds <= 0 && days <= 0 && months <= 0)
            )
        ) {
            milliseconds += absCeil(monthsToDays(months) + days) * 864e5;
            days = 0;
            months = 0;
        }

        // The following code bubbles up values, see the tests for
        // examples of what that means.
        data.milliseconds = milliseconds % 1000;

        seconds = absFloor(milliseconds / 1000);
        data.seconds = seconds % 60;

        minutes = absFloor(seconds / 60);
        data.minutes = minutes % 60;

        hours = absFloor(minutes / 60);
        data.hours = hours % 24;

        days += absFloor(hours / 24);

        // convert days to months
        monthsFromDays = absFloor(daysToMonths(days));
        months += monthsFromDays;
        days -= absCeil(monthsToDays(monthsFromDays));

        // 12 months -> 1 year
        years = absFloor(months / 12);
        months %= 12;

        data.days = days;
        data.months = months;
        data.years = years;

        return this;
    }

    function daysToMonths(days) {
        // 400 years have 146097 days (taking into account leap year rules)
        // 400 years have 12 months === 4800
        return (days * 4800) / 146097;
    }

    function monthsToDays(months) {
        // the reverse of daysToMonths
        return (months * 146097) / 4800;
    }

    function as(units) {
        if (!this.isValid()) {
            return NaN;
        }
        var days,
            months,
            milliseconds = this._milliseconds;

        units = normalizeUnits(units);

        if (units === 'month' || units === 'quarter' || units === 'year') {
            days = this._days + milliseconds / 864e5;
            months = this._months + daysToMonths(days);
            switch (units) {
                case 'month':
                    return months;
                case 'quarter':
                    return months / 3;
                case 'year':
                    return months / 12;
            }
        } else {
            // handle milliseconds separately because of floating point math errors (issue #1867)
            days = this._days + Math.round(monthsToDays(this._months));
            switch (units) {
                case 'week':
                    return days / 7 + milliseconds / 6048e5;
                case 'day':
                    return days + milliseconds / 864e5;
                case 'hour':
                    return days * 24 + milliseconds / 36e5;
                case 'minute':
                    return days * 1440 + milliseconds / 6e4;
                case 'second':
                    return days * 86400 + milliseconds / 1000;
                // Math.floor prevents floating point math errors here
                case 'millisecond':
                    return Math.floor(days * 864e5) + milliseconds;
                default:
                    throw new Error('Unknown unit ' + units);
            }
        }
    }

    // TODO: Use this.as('ms')?
    function valueOf$1() {
        if (!this.isValid()) {
            return NaN;
        }
        return (
            this._milliseconds +
            this._days * 864e5 +
            (this._months % 12) * 2592e6 +
            toInt(this._months / 12) * 31536e6
        );
    }

    function makeAs(alias) {
        return function () {
            return this.as(alias);
        };
    }

    var asMilliseconds = makeAs('ms'),
        asSeconds = makeAs('s'),
        asMinutes = makeAs('m'),
        asHours = makeAs('h'),
        asDays = makeAs('d'),
        asWeeks = makeAs('w'),
        asMonths = makeAs('M'),
        asQuarters = makeAs('Q'),
        asYears = makeAs('y');

    function clone$1() {
        return createDuration(this);
    }

    function get$2(units) {
        units = normalizeUnits(units);
        return this.isValid() ? this[units + 's']() : NaN;
    }

    function makeGetter(name) {
        return function () {
            return this.isValid() ? this._data[name] : NaN;
        };
    }

    var milliseconds = makeGetter('milliseconds'),
        seconds = makeGetter('seconds'),
        minutes = makeGetter('minutes'),
        hours = makeGetter('hours'),
        days = makeGetter('days'),
        months = makeGetter('months'),
        years = makeGetter('years');

    function weeks() {
        return absFloor(this.days() / 7);
    }

    var round = Math.round,
        thresholds = {
            ss: 44, // a few seconds to seconds
            s: 45, // seconds to minute
            m: 45, // minutes to hour
            h: 22, // hours to day
            d: 26, // days to month/week
            w: null, // weeks to month
            M: 11, // months to year
        };

    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
        return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }

    function relativeTime$1(posNegDuration, withoutSuffix, thresholds, locale) {
        var duration = createDuration(posNegDuration).abs(),
            seconds = round(duration.as('s')),
            minutes = round(duration.as('m')),
            hours = round(duration.as('h')),
            days = round(duration.as('d')),
            months = round(duration.as('M')),
            weeks = round(duration.as('w')),
            years = round(duration.as('y')),
            a =
                (seconds <= thresholds.ss && ['s', seconds]) ||
                (seconds < thresholds.s && ['ss', seconds]) ||
                (minutes <= 1 && ['m']) ||
                (minutes < thresholds.m && ['mm', minutes]) ||
                (hours <= 1 && ['h']) ||
                (hours < thresholds.h && ['hh', hours]) ||
                (days <= 1 && ['d']) ||
                (days < thresholds.d && ['dd', days]);

        if (thresholds.w != null) {
            a =
                a ||
                (weeks <= 1 && ['w']) ||
                (weeks < thresholds.w && ['ww', weeks]);
        }
        a = a ||
            (months <= 1 && ['M']) ||
            (months < thresholds.M && ['MM', months]) ||
            (years <= 1 && ['y']) || ['yy', years];

        a[2] = withoutSuffix;
        a[3] = +posNegDuration > 0;
        a[4] = locale;
        return substituteTimeAgo.apply(null, a);
    }

    // This function allows you to set the rounding function for relative time strings
    function getSetRelativeTimeRounding(roundingFunction) {
        if (roundingFunction === undefined) {
            return round;
        }
        if (typeof roundingFunction === 'function') {
            round = roundingFunction;
            return true;
        }
        return false;
    }

    // This function allows you to set a threshold for relative time strings
    function getSetRelativeTimeThreshold(threshold, limit) {
        if (thresholds[threshold] === undefined) {
            return false;
        }
        if (limit === undefined) {
            return thresholds[threshold];
        }
        thresholds[threshold] = limit;
        if (threshold === 's') {
            thresholds.ss = limit - 1;
        }
        return true;
    }

    function humanize(argWithSuffix, argThresholds) {
        if (!this.isValid()) {
            return this.localeData().invalidDate();
        }

        var withSuffix = false,
            th = thresholds,
            locale,
            output;

        if (typeof argWithSuffix === 'object') {
            argThresholds = argWithSuffix;
            argWithSuffix = false;
        }
        if (typeof argWithSuffix === 'boolean') {
            withSuffix = argWithSuffix;
        }
        if (typeof argThresholds === 'object') {
            th = Object.assign({}, thresholds, argThresholds);
            if (argThresholds.s != null && argThresholds.ss == null) {
                th.ss = argThresholds.s - 1;
            }
        }

        locale = this.localeData();
        output = relativeTime$1(this, !withSuffix, th, locale);

        if (withSuffix) {
            output = locale.pastFuture(+this, output);
        }

        return locale.postformat(output);
    }

    var abs$1 = Math.abs;

    function sign(x) {
        return (x > 0) - (x < 0) || +x;
    }

    function toISOString$1() {
        // for ISO strings we do not use the normal bubbling rules:
        //  * milliseconds bubble up until they become hours
        //  * days do not bubble at all
        //  * months bubble up until they become years
        // This is because there is no context-free conversion between hours and days
        // (think of clock changes)
        // and also not between days and months (28-31 days per month)
        if (!this.isValid()) {
            return this.localeData().invalidDate();
        }

        var seconds = abs$1(this._milliseconds) / 1000,
            days = abs$1(this._days),
            months = abs$1(this._months),
            minutes,
            hours,
            years,
            s,
            total = this.asSeconds(),
            totalSign,
            ymSign,
            daysSign,
            hmsSign;

        if (!total) {
            // this is the same as C#'s (Noda) and python (isodate)...
            // but not other JS (goog.date)
            return 'P0D';
        }

        // 3600 seconds -> 60 minutes -> 1 hour
        minutes = absFloor(seconds / 60);
        hours = absFloor(minutes / 60);
        seconds %= 60;
        minutes %= 60;

        // 12 months -> 1 year
        years = absFloor(months / 12);
        months %= 12;

        // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
        s = seconds ? seconds.toFixed(3).replace(/\.?0+$/, '') : '';

        totalSign = total < 0 ? '-' : '';
        ymSign = sign(this._months) !== sign(total) ? '-' : '';
        daysSign = sign(this._days) !== sign(total) ? '-' : '';
        hmsSign = sign(this._milliseconds) !== sign(total) ? '-' : '';

        return (
            totalSign +
            'P' +
            (years ? ymSign + years + 'Y' : '') +
            (months ? ymSign + months + 'M' : '') +
            (days ? daysSign + days + 'D' : '') +
            (hours || minutes || seconds ? 'T' : '') +
            (hours ? hmsSign + hours + 'H' : '') +
            (minutes ? hmsSign + minutes + 'M' : '') +
            (seconds ? hmsSign + s + 'S' : '')
        );
    }

    var proto$2 = Duration.prototype;

    proto$2.isValid = isValid$1;
    proto$2.abs = abs;
    proto$2.add = add$1;
    proto$2.subtract = subtract$1;
    proto$2.as = as;
    proto$2.asMilliseconds = asMilliseconds;
    proto$2.asSeconds = asSeconds;
    proto$2.asMinutes = asMinutes;
    proto$2.asHours = asHours;
    proto$2.asDays = asDays;
    proto$2.asWeeks = asWeeks;
    proto$2.asMonths = asMonths;
    proto$2.asQuarters = asQuarters;
    proto$2.asYears = asYears;
    proto$2.valueOf = valueOf$1;
    proto$2._bubble = bubble;
    proto$2.clone = clone$1;
    proto$2.get = get$2;
    proto$2.milliseconds = milliseconds;
    proto$2.seconds = seconds;
    proto$2.minutes = minutes;
    proto$2.hours = hours;
    proto$2.days = days;
    proto$2.weeks = weeks;
    proto$2.months = months;
    proto$2.years = years;
    proto$2.humanize = humanize;
    proto$2.toISOString = toISOString$1;
    proto$2.toString = toISOString$1;
    proto$2.toJSON = toISOString$1;
    proto$2.locale = locale;
    proto$2.localeData = localeData;

    proto$2.toIsoString = deprecate(
        'toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)',
        toISOString$1
    );
    proto$2.lang = lang;

    // FORMATTING

    addFormatToken('X', 0, 0, 'unix');
    addFormatToken('x', 0, 0, 'valueOf');

    // PARSING

    addRegexToken('x', matchSigned);
    addRegexToken('X', matchTimestamp);
    addParseToken('X', function (input, array, config) {
        config._d = new Date(parseFloat(input) * 1000);
    });
    addParseToken('x', function (input, array, config) {
        config._d = new Date(toInt(input));
    });

    //! moment.js

    hooks.version = '2.29.1';

    setHookCallback(createLocal);

    hooks.fn = proto;
    hooks.min = min;
    hooks.max = max;
    hooks.now = now;
    hooks.utc = createUTC;
    hooks.unix = createUnix;
    hooks.months = listMonths;
    hooks.isDate = isDate;
    hooks.locale = getSetGlobalLocale;
    hooks.invalid = createInvalid;
    hooks.duration = createDuration;
    hooks.isMoment = isMoment;
    hooks.weekdays = listWeekdays;
    hooks.parseZone = createInZone;
    hooks.localeData = getLocale;
    hooks.isDuration = isDuration;
    hooks.monthsShort = listMonthsShort;
    hooks.weekdaysMin = listWeekdaysMin;
    hooks.defineLocale = defineLocale;
    hooks.updateLocale = updateLocale;
    hooks.locales = listLocales;
    hooks.weekdaysShort = listWeekdaysShort;
    hooks.normalizeUnits = normalizeUnits;
    hooks.relativeTimeRounding = getSetRelativeTimeRounding;
    hooks.relativeTimeThreshold = getSetRelativeTimeThreshold;
    hooks.calendarFormat = getCalendarFormat;
    hooks.prototype = proto;

    // currently HTML5 input type only supports 24-hour formats
    hooks.HTML5_FMT = {
        DATETIME_LOCAL: 'YYYY-MM-DDTHH:mm', // <input type="datetime-local" />
        DATETIME_LOCAL_SECONDS: 'YYYY-MM-DDTHH:mm:ss', // <input type="datetime-local" step="1" />
        DATETIME_LOCAL_MS: 'YYYY-MM-DDTHH:mm:ss.SSS', // <input type="datetime-local" step="0.001" />
        DATE: 'YYYY-MM-DD', // <input type="date" />
        TIME: 'HH:mm', // <input type="time" />
        TIME_SECONDS: 'HH:mm:ss', // <input type="time" step="1" />
        TIME_MS: 'HH:mm:ss.SSS', // <input type="time" step="0.001" />
        WEEK: 'GGGG-[W]WW', // <input type="week" />
        MONTH: 'YYYY-MM', // <input type="month" />
    };

    return hooks;

})));

},{}],2:[function(require,module,exports){
// INDEX.JS
/** Copyright (c) 2018 Craig Yamato */

/**
 * @fileoverview The SyslogPro module for sending syslog messages
 * Most APIs will return a promise. These APIs can be used using
 * `then(...)/catch(...)`
 *
 * Syslog formatting classes can be used as input into a Syslog class to be used
 * simultaneously to the same Syslog server.  The Syslog Class with a configured
 * Syslog server target can also be used as the input into each of the
 * formatting classes so that they may run independently.
 * @author Craig Yamato <craig@kentik.com>
 * @copyright (c) 2018 - Craig Yamato
 * @version 0.1.0
 * @exports Syslog
 * @exports LEEF
 * @exports CEF
 * @module SyslogPro
 */
'use strict';
const moment = require('moment');
const os = require('os');
const dns = require('dns');
let dnsPromises = dns.promises;
const fs = require('fs');

/**
 * Format the ANSI foreground color code from a RGB hex code or ANSI color code
 * @private
 * @param {string} hex - The color hex code in the form of #FFFFFF or Number of
 *     the ANSI color code (30-37 Standard & 0-255 Extended)
 * @returns {Promise} - The formatted ANSI color code
 * @throws {Error} - A Format Error
 */
function rgbToAnsi(hex,
  extendedColor) {
  return new Promise((resolve, reject) => {
    let colorCode = 0; // Var to hold color code
    // Break HEX Code up into RGB
    const hexParts = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (hexParts || typeof hex === 'number') {
      if (typeof hex === 'number') {
        if (extendedColor && hex < 256) {
          resolve(hex);
        } else if ((hex > 29 && hex < 38) || (hex > 89 && hex < 98)) {
          resolve(hex);
        } else {
          reject(new Error('FORMAT ERROR: Color code not in range'));
        }
      } else {
        const r = parseInt(hexParts[1], 16);
        const g = parseInt(hexParts[2], 16);
        const b = parseInt(hexParts[3], 16);
        if (extendedColor) {
          if (r === g && g === b) {
            // Gray Scale Color
            if (r < 8) {
              colorCode = 16;
            } else if (r > 248) {
              colorCode = 231;
            } else {
              colorCode = Math.round(((r - 8) / 247) * 24) + 232;
            }
          } else {
            colorCode = 16
                + (36 * Math.round(r / 255 * 5))
                + (6 * Math.round(g / 255 * 5))
                + Math.round(b / 255 * 5);
          }
        } else {
          colorCode = 30;
          const red = r / 255;
          const green = g / 255;
          const blue = b / 255;
          let v = Math.max(red, green, blue) * 100;
          v = Math.round(v / 50);
          if (v === 1) {
            colorCode += ((Math.round(b / 255) << 2)
                | (Math.round(g / 255) << 1)
                | Math.round(r / 255));
          }
          if (v === 2) {
            colorCode += 60;
          }
        }
      }
      resolve(colorCode);
      return;
    } else {
      reject(new Error('TYPE ERROR: Not in RGB color hex or color code'));
      return;
    }
  });
}

/**
 * A class to work with syslog messages using UDP, TCP, or TLS transport.
 * There is support for Syslog message formatting RFC-3164, RFC-5424 including
 * Structured Data, IBM LEEF (Log Event Extended Format), and HP CEF (Common
 * Event Format).
 * Syslog formatting classes can be used as input into a Syslog class to be used
 * simultaneously to the same Syslog server. *
 * @requires moment
 * @version 0.0.0
 * @since 0.0.0
 */
class Syslog {
  /**
   * Construct a new Syslog transport object with user options
   * @public
   * @version 0.0.0
   * @since 0.0.0
   * @this Syslog
   * @param {object} [options] - Options object
   * >>>Transport Configuration
   * @param {string} [options.target='localhost'] - The IP Address|FQDN of the
   *    Syslog Server, this option if set will take presidents over any target
   *    set in a formatting object
   * @param {string} [options.protocol='udp'] - L4 transport protocol
   *    (udp|tcp|tls), this option if set will take presidents over any
   *    transport set in a formatting object
   * @param {number} [options.port=514] - IP port, this option if set will take
   *    presidents over any IP Port set in a formatting object
   * @param {number} [options.tcpTimeout=10000] - Ignored for all other
   *    transports, this option if set will take presidents over any timeout
   *    set in a formatting object
   * @param {string[]} [options.tlsServerCerts] - Array of authorized TLS server
   *    certificates file locations, this option if set will take presidents
   *    over any certificates set in a formatting object
   * @param {string} [options.tlsClientCert] - Client TLS certificate file
   *    location that this client should use, this option if set will take
   *    presidents over any certificates set in a formatting object
   * @param {string} [options.tlsClientKey] - Client TLS key file
   *    location that this client should use, this option if set will take
   *    presidents over any certificates set in a formatting object
   * >>>Syslog Format Settings
   * @param {string} [options.format='none'] - Valid syslog format options for
   *    this module are 'none', 'rfc3164', 'rfc5424', 'leef', 'cef'
   * @param {RFC3164} [options.rfc5424] - {@link module:SyslogPro~RFC5424|
   *    RFC5424 related settings}
   * @param {RFC5424} [options.rfc5424] - {@link module:SyslogPro~RFC5424|
   *    RFC5424 related settings}
   * @param {LEEF} [options.leef] - {@link module:SyslogPro~LEEF|IBM LEEF
   *    (Log Event Extended Format) object}
   * @param {CEF} [options.cef] - {@link module:SyslogPro~CEF|HP CEF
   *    (Common Event Format) formatting object}
   */
  constructor(options) {
    this.constructor__ = true;
    if (!options) {
      options = {};
    }
    // Basic transport setup
    /** @type {string} */
    this.target = options.target || 'localhost';
    /** @type {string} */
    this.protocol = options.protocol || 'udp';
    this.protocol = this.protocol.toLowerCase();
    /** @type {number} */
    this.port = options.port || 514;
    /** @type {number} */
    this.tcpTimeout = options.tcpTimeout || 10000;
    if ((typeof options.tlsServerCerts === 'object'
        && Array.isArray(options.tlsServerCerts))
        || typeof options.tlsServerCerts === 'string') {
      this.addTlsServerCerts(options.tlsServerCerts);
    } else {
      /** @type {string[]} */
      this.tlsServerCerts = [];
    }
    if (options.tlsClientCert) {
      /** @type {string} */
      this.tlsClientCert = options.tlsClientCert;
    }
    if (options.tlsClientKey) {
      /** @type {string} */
      this.tlsClientKey = options.tlsClientKey;
    }
    // Syslog Format
    if (typeof options.format === 'string') {
      /** @type {string} */
      this.format = options.format.toLowerCase();
    } else {
      this.format = options.format || 'none';
    }
    if (options.rfc3164) {
      if (options.rfc3164.constructor__) {
        /** @type {RFC3164} */
        this.rfc3164 = options.rfc3164;
      } else {
        this.rfc3164 = new RFC3164(options);
      }
    }
    if (options.rfc5424) {
      if (options.rfc5424.constructor__) {
        /** @type {RFC5424} */
        this.rfc5424 = options.rfc5424;
      } else {
        this.rfc5424 = new RFC5424(options);
      }
    }
    if (options.leef) {
      if (options.leef.constructor__) {
        /** @type {LEEF} */
        this.leef = options.leef;
      } else {
        this.leef = new LEEF(options);
      }
    }
    if (options.cef) {
      if (options.cef.constructor__) {
        /** @type {CEF} */
        this.cef = options.cef;
      } else {
        this.cef = new CEF(options);
      }
    }
    if (this.format === 'rfc3164' && !this.rfc3164) {
      this.rfc3164 = new RFC3164();
    }
    if (this.format === 'rfc5424' && !this.rfc5424) {
      this.rfc5424 = new RFC5424();
    }
    if (this.format === 'leef' && !this.leef) {
      this.leef = new LEEF();
    }
    if (this.format === 'cef' && !this.cef) {
      this.cef = new CEF();
    }
  }

  /**
   * Add a TLS server certificate which can be used to authenticate the server
   * this syslog client is connecting too.  This function will validate the
   * input as a file location string and add it to an array of certificates
   * @private
   * @version 0.0.0
   * @since 0.0.0
   * @param {string|string[]} certs - File location of the certificate(s)
   * @returns {Promise} - True
   * @throws {Error} - A Type Error
   */
  addTlsServerCerts(certs) {
    return new Promise((resolve, reject) => {
      if (typeof certs === 'object' && Array.isArray(certs)) {
        /** @private @type {string[]} */
        this.tlsServerCerts = certs;
      } else if (typeof certs === 'string') {
        this.tlsServerCerts = [certs];
      } else {
        let errMsg =
            'TYPE ERROR: Server Cert file locations should be a string';
        errMsg += ' or array of strings';
        reject(new Error(errMsg));
      }
      resolve(true);
    });
  }
  /**
   * Send the Syslog message over UDP
   * @private
   * @param {string} msg - The formatted Syslog Message
   * @returns {Promise} - The Syslog formatted string sent
   * @throws {Error} - Network Error
   */
  udpMessage(msg) {
    return new Promise((resolve, reject) => {
      // Test for target DNS and Address Family (IPv4/6) by looking up the DNS
      const dgram = require('dgram');
      const dnsOptions = {
        verbatim: true,
      };
      dnsPromises.lookup(this.target, dnsOptions)
        .then((result) => {
          const udpType = result.family === 4 ? 'udp4' : 'udp6';
          let client = dgram.createSocket(udpType);
          // Turn msg in to a UTF8 buffer
          let msgBuffer = Buffer.from(msg, 'utf8');
          client.send(msgBuffer, this.port, this.target, () => {
            client.close();
            resolve(msg);
          });
        })
        .catch((error) => {
          reject(error); // Reject out of the sendMessage function promise
        });
    });
  }
  /**
   * Send the Syslog message over TCP
   * @private
   * @param {string} msg - The formatted Syslog Message
   * @returns {Promise} - The Syslog formatted string sent
   * @throws {Error} - Timeout error for TCP and TLS connections
   * @throws {Error} - Network Error
   */
  tcpMessage(msg) {
    return new Promise((resolve, reject) => {
      const net = require('net');
      const dnsOptions = {
        verbatim: true,
      };
      dnsPromises.lookup(this.target, dnsOptions)
        .then((result) => {
          const tcpOptions = {
            host: this.target,
            port: this.port,
            family: result.family,
          };
          const client = net.createConnection(tcpOptions, () => {
            // Turn msg in to a UTF8 buffer
            let msgBuffer = Buffer.from(msg, 'utf8');
            client.write(msgBuffer, () => {
              client.end();
            });
          });
          client.setTimeout(this.tcpTimeout);
          client.on('end', () => {
            resolve(msg);
          });
          client.on('timeout', () => {
            client.end();
            reject(new Error('TIMEOUT ERROR: Syslog server TCP timeout'));
          });
          client.on('error', (error) => {
            client.destroy();
            reject(error);
          });
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  /**
   * Send the Syslog message over TLS
   * @private
   * @param {string} msg - The formatted Syslog Message
   * @returns {Promise} - The Syslog formatted string sent
   * @throws {Error} - Timeout error for TCP and TLS connections
   * @throws {Error} - Network Error
   */
  tlsMessage(msg) {
    return new Promise((resolve, reject) => {
      const tls = require('tls');
      const tlsOptions = {
        host: this.target,
        port: this.port,
      };
      // Load client cert and key if requested
      if (typeof this.tlsClientKey === 'string'
          && typeof this.tlsClientCert === 'string') {
        tlsOptions.key = fs.readFileSync(this.tlsClientKey);
        tlsOptions.cert = fs.readFileSync(this.tlsClientCert);
      } else if (typeof this.tlsClientKey !== 'string'
          && typeof this.tlsClientKey !== 'undefined') {
        let errMsg = 'TYPE ERROR: TLS Client Key is not a file';
        errMsg += 'location string';
        reject(new Error(errMsg));
        return;
      } else if (typeof this.tlsClientCert !== 'string'
          && typeof this.tlsClientCert !== 'undefined') {
        let errMsg = 'TYPE ERROR: TLS Client Cert is not a file';
        errMsg += 'location string';
        reject(new Error(errMsg));
        return;
      }
      // Load any server certs if provided
      let tlsCerts = this.tlsServerCerts.length;
      if (tlsCerts > 0) {
        let tlsOptionsCerts = [];
        for (let certIndex = 0; certIndex < tlsCerts; certIndex++) {
          if (typeof this.tlsServerCerts[certIndex] !== 'string') {
            let errMsg = 'TYPE ERROR: TLS Server Cert is not a file';
            errMsg += 'location string';
            reject(new Error(errMsg));
          }
          let cert = fs.readFileSync(this.tlsServerCerts[certIndex]);
          tlsOptionsCerts.push(cert);
        }
        tlsOptions.ca = tlsOptionsCerts;
        tlsOptions.rejectUnauthorized = true;
      }
      const client = tls.connect(tlsOptions, () => {
        // Turn msg in to a UTF8 buffer
        let msgBuffer = Buffer.from(msg, 'utf8');
        client.write(msgBuffer, () => {
          client.end();
        });
      });
      client.setTimeout(this.tcpTimeout);
      client.on('end', () => {
        resolve(msg);
      });
      client.on('timeout', () => {
        client.end();
        reject(new Error('TIMEOUT ERROR: Syslog server TLS timeout'));
      });
      client.on('error', (error) => {
        client.destroy();
        reject(error);
      });
    });
  }
  /**
   * Send the Syslog message to the selected target Syslog server using the
   * selected transport.
   * @private
   * @param {string} msg - The formatted Syslog Message
   * @returns {Promise} - The Syslog formatted string sent
   * @throws {Error} - Timeout error for TCP and TLS connections
   * @throws {Error} - Network Error
   */
  send(msg) {
    return new Promise((resolve, reject) => {
      if (typeof msg !== 'string') {
        reject(new Error('TYPE ERROR: Syslog message must be a string'));
        return;
      }
      this.protocol = this.protocol.toLowerCase();
      if (this.protocol === 'udp') {
        this.udpMessage(msg)
          .then((result) => {
            resolve(result);
          })
          .catch((reson) => {
            reject(reson);
          });
      } else if (this.protocol === 'tcp') {
        this.tcpMessage(msg)
          .then((result) => {
            resolve(result);
          })
          .catch((reson) => {
            reject(reson);
          });
      } else if (this.protocol === 'tls') {
        this.tlsMessage(msg)
          .then((result) => {
            resolve(result);
          })
          .catch((reson) => {
            reject(reson);
          });
      } else {
        let errorMsg = 'FORMAT ERROR: Protocol not recognized, should be ';
        errorMsg += 'udp|tcp|tls';
        reject(new Error(errorMsg));
      }
    });
  }
}

/**
 * A class to work with RFC3164 formatted syslog messages. The messaging is
 * fully configurable and ANSI foreground colors can be added.  Both ANSI 8 and
 * ANSI 256 color are fully supported. Most APIs will return a promise. These
 * APIs can be used using `then(...)/catch(...)`
 *
 * A Syslog class with a configured
 * Syslog server target can also be used as the input into the formatting
 * classes so that it may run independently.
 *
 * The RFC3164 Syslog logging format is meant to be used as a stream of log data
 * from a service or application. This class is designed to be used in this
 * fashion where new messages are written to the class as needed.
 * @requires moment
 * @version 0.0.0
 * @since 0.0.0
 */
class RFC3164 {
  /**
   * Construct a new RFC3164 formatted Syslog object with user options
   * @public
   * @this RFC3164
   * @param {object} [options] - Options object
   * @param {string} [options.applacationName='NodeJSLogger'] - Application
   * @param {string} [options.hostname=os.hostname] - The name of this server
   * @param {number} [options.facility=23] - Facility code to use sending this
   *    message
   * @param {boolean} [options.color=false] - Apply color coding encoding tag
   *    with syslog message text
   * @param {boolean} [options.extendedColor=false] - Use the extended ANSI
   *    color set encoding tag with syslog message text
   * @param {object} [options.colors] - User defended colors for
   *    severities
   * @param {string} [options.colors.emergencyColor] - A RGB Hex coded color in
   *    the form of #FFFFFF or as or the ANSI color code number (30-37 Standard
   *    & 0-255 Extended)
   * @param {string} [options.colors.alertColor] - A RGB Hex coded color in the
   *    form of #FFFFFF or as or the ANSI color code number (30-37 Standard &
   *    0-255 Extended)
   * @param {string} [options.colors.criticalColor] - A RGB Hex coded color in
   *    the form of #FFFFFF or as or the ANSI color code number (30-37 Standard
   *    & 0-255 Extended)
   * @param {string} [options.colors.errorColor] - A RGB Hex coded color in the
   *    form of #FFFFFF or as or the ANSI color code number (30-37 Standard &
   *    0-255 Extended)
   * @param {string} [options.colors.warningColor] - A RGB Hex coded color in
   *    the form of #FFFFFF or as or the ANSI color code number (30-37 Standard
   *     & 0-255 Extended)
   * @param {string} [options.colors.noticeColor] - A RGB Hex coded color in the
   *     form of #FFFFFF or as or the ANSI color code number (30-37 Standard &
   *     0-255 Extended)
   * @param {string} [options.colors.informationalColor] - A RGB Hex coded color
   *    in the form of #FFFFFF or as or the ANSI color code number (30-37
   *    Standard & 0-255 Extended)
   * @param {string} [options.colors.debugColor] - A RGB Hex coded color in the
   *    form of #FFFFFF or as or the ANSI color code number (30-37 Standard &
   *    0-255 Extended)
   * @param {Syslog} [options.server=false] - A {@link module:SyslogPro~Syslog|
   *    Syslog server connection} that should be used to send messages directly
   *    from this class. @see SyslogPro~Syslog
   */
  constructor(options) {
    /** @private @type {boolean} */
    this.constructor__ = true;
    options = options || {};
    this.hostname = options.hostname || os.hostname();
    this.applacationName = options.applacationName || '';
    this.facility = options.facility || 23;
    if (options.color) {
      /** @type {boolean} */
      this.color = true;
    } else {
      this.color = false;
    }
    if (options.extendedColor) {
      /** @type {boolean} */
      this.extendedColor = true;
    } else {
      this.extendedColor = false;
    }
    if (options.server) {
      if (!options.server.constructor__) {
        /** @private @type {Syslog} */
        this.server = new Syslog(options.server);
      } else {
        this.server = options.server;
      }
    }
    if (this.extendedColor) {
      /** @private @type {number} */
      this.emergencyColor = 1; // Red foreground color
      /** @private @type {number} */
      this.alertColor = 202; // Dark Orange foreground color
      /** @private @type {number} */
      this.criticalColor = 208; // Orange foreground color
      /** @private @type {number} */
      this.errorColor = 178; // Light Orange foreground color
      /** @private @type {number} */
      this.warningColor = 226; // Yellow foreground color
      /** @private @type {number} */
      this.noticeColor = 117; // Light Blue foreground color
      /** @private @type {number} */
      this.informationalColor = 45; // Blue foreground color
      /** @private @type {number} */
      this.debugColor = 27; // Dark Blue foreground color
    } else {
      this.emergencyColor = 31; // Red foreground color
      this.alertColor = 31; // Red foreground color
      this.criticalColor = 31; // Red foreground color
      this.errorColor = 33; // Yellow foreground color
      this.warningColor = 33; // Yellow foreground color
      this.noticeColor = 36; // Blue foreground color
      this.informationalColor = 36; // Blue foreground color
      this.debugColor = 34; // Dark Blue foreground color
    }
    if (typeof options.colors === 'object') {
      this.setColor(options.colors, this.extendedColor);
    }
  }
  /**
   * Sets the color to be used for messages at a set priority
   * @public
   * @param {string} [colors.emergencyColor] - A RGB Hex coded color in the form
   *    of #FFFFFF or as or the ANSI color code number (30-37 Standard & 0-255
   *    Extended)
   * @param {string} [colors.alertColor] - A RGB Hex coded color in the form
   *    of #FFFFFF or as or the ANSI color code number (30-37 Standard & 0-255
   *    Extended)
   * @param {string} [colors.criticalColor] - A RGB Hex coded color in the form
   *    of #FFFFFF or as or the ANSI color code number (30-37 Standard & 0-255
   *    Extended)
   * @param {string} [colors.errorColor] - A RGB Hex coded color in the form
   *    of #FFFFFF or as or the ANSI color code number (30-37 Standard & 0-255
   *    Extended)
   * @param {string} [colors.warningColor] - A RGB Hex coded color in the form
   *    of #FFFFFF or as or the ANSI color code number (30-37 Standard & 0-255
   *    Extended)
   * @param {string} [colors.noticeColor] - A RGB Hex coded color in the form
   *    of #FFFFFF or as or the ANSI color code number (30-37 Standard & 0-255
   *    Extended)
   * @param {string} [colors.informationalColor] - A RGB Hex coded color in the
   *    form of #FFFFFF or as or the ANSI color code number (30-37 Standard &
   *    0-255 Extended)
   * @param {string} [colors.debugColor] - A RGB Hex coded color in the form
   *    of #FFFFFF or as or the ANSI color code number (30-37 Standard & 0-255
   *    Extended)
   * @throws {Error} A standard error object
   */
  setColor(colors, extendedColor) {
    return new Promise((resolve, reject) => {
      let colorPromises = [];
      if (colors.emergencyColor) {
        colorPromises.push(
          new Promise((resolve, reject) => {
            rgbToAnsi(colors.emergencyColor, this.extendedColor)
              .then((result) => {
                this.emergencyColor = result;
                resolve(true);
              })
              .catch((reson) => {
                reson.message = 'TYPE ERROR: ';
                reson.message += 'emergencyColor';
                reson.message += ' Not in RGB color hex or color code';
                reject(reson);
              });
          }));
      }
      if (colors.alertColor) {
        colorPromises.push(
          new Promise((resolve, reject) => {
            rgbToAnsi(colors.alertColor, this.extendedColor)
              .then((result) => {
                this.alertColor = result;
                resolve(true);
              })
              .catch((reson) => {
                reson.message = 'TYPE ERROR: ';
                reson.message += 'alertColor';
                reson.message += ' Not in RGB color hex or color code';
                reject(reson);
              });
          }));
      }
      if (colors.criticalColor) {
        colorPromises.push(
          new Promise((resolve, reject) => {
            rgbToAnsi(colors.criticalColor, this.extendedColor)
              .then((result) => {
                this.criticalColor = result;
                resolve(true);
              })
              .catch((reson) => {
                reson.message = 'TYPE ERROR: ';
                reson.message += 'criticalColor';
                reson.message += ' Not in RGB color hex or color code';
                reject(reson);
              });
          }));
      }
      if (colors.errorColor) {
        colorPromises.push(
          new Promise((resolve, reject) => {
            rgbToAnsi(colors.errorColor, this.extendedColor)
              .then((result) => {
                this.errorColor = result;
                resolve(true);
              })
              .catch((reson) => {
                reson.message = 'TYPE ERROR: ';
                reson.message += 'errorColor';
                reson.message += ' Not in RGB color hex or color code';
                reject(reson);
              });
          }));
      }
      if (colors.warningColor) {
        colorPromises.push(
          new Promise((resolve, reject) => {
            rgbToAnsi(colors.warningColor, this.extendedColor)
              .then((result) => {
                this.warningColor = result;
                resolve(true);
              })
              .catch((reson) => {
                reson.message = 'TYPE ERROR: ';
                reson.message += 'warningColor';
                reson.message += ' Not in RGB color hex or color code';
                reject(reson);
              });
          }));
      }
      if (colors.noticeColor) {
        colorPromises.push(
          new Promise((resolve, reject) => {
            rgbToAnsi(colors.noticeColor, this.extendedColor)
              .then((result) => {
                this.noticeColor = result;
                resolve(true);
              })
              .catch((reson) => {
                reson.message = 'TYPE ERROR: ';
                reson.message += 'noticeColor';
                reson.message += ' Not in RGB color hex or color code';
                reject(reson);
              });
          }));
      }
      if (colors.informationalColor) {
        colorPromises.push(
          new Promise((resolve, reject) => {
            rgbToAnsi(colors.informationalColor, this.extendedColor)
              .then((result) => {
                this.informationalColor = result;
                resolve(true);
              })
              .catch((reson) => {
                reson.message = 'TYPE ERROR: ';
                reson.message += 'informationalColor';
                reson.message += ' Not in RGB color hex or color code';
                reject(reson);
              });
          }));
      }
      if (colors.debugColor) {
        colorPromises.push(
          new Promise((resolve, reject) => {
            rgbToAnsi(colors.debugColor, this.extendedColor)
              .then((result) => {
                this.debugColor = result;
                resolve(true);
              })
              .catch((reson) => {
                reson.message = 'TYPE ERROR: ';
                reson.message += 'debugColor';
                reson.message += ' Not in RGB color hex or color code';
                reject(reson);
              });
          }));
      }
      Promise.all(colorPromises)
        .then((results) => {
          resolve(true);
        })
        .catch((reson) => {
          reject(reson);
        });
    });
  }
  /**
   * Building a formatted message.  Returns a promise with a formatted message
   * @public
   * @param {string} msg - The Syslog Message
   * @param {object} [options] - Options object
   * @param {number} [options.severity=7] - An array of structure
   * @param {number} [options.colorCode=36] - The ANSI color code to use if
   *    message coloration is selected
   * @returns {Promise} A Syslog formatted string according to the selected RFC
   * @throws {Error} A standard error object
   */
  buildMessage(msg, options) {
    return new Promise((resolve, reject) => {
      options = options || {};
      let severity = typeof options.severity === 'number' ?
        options.severity : 6;
      if (typeof msg !== 'string' || options.msgSeverity > 7) {
        let errMsg = 'FORMAT ERROR: Syslog message must be a string';
        errMsg += ' msgSeverity must be a number between 0 and 7';
        reject(new Error(errMsg));
        return;
      }
      let fmtMsg = ''; // Formatted Syslog message string var
      const newLine = '\n';
      const newLineRegEx = /(\r|\n|(\r\n))/;
      const escapeCode = '\u001B';
      const resetColor = '\u001B[0m';
      // The PRI is common to both RFC formats
      const pri = (this.facility * 8) + severity;
      // Remove any newline character
      msg = msg.replace(newLineRegEx, '');
      // Add requested color
      if (this.color) {
        options.msgColor = options.msgColor || 36;
        let colorCode = '[';
        if (this.extendedColor) {
          colorCode += '38;5;'; // Extended 256 Colors ANSI Code
        }
        if (typeof options.msgColor === 'number') {
          colorCode += options.msgColor;
          colorCode += 'm'; // ANSI Color Closer
        } else {
          colorCode = '[39m'; // Use terminal's default color
        }
        msg = escapeCode + colorCode + msg + resetColor;
      }
      // RegEx to find a leading 0 in the day of a DateTime for RFC3164 RFC3164
      // uses BSD timeformat
      const rfc3164DateRegEx =
/((A|D|F|J|M|N|O|S)(a|c|e|p|o|u)(b|c|g|l|n|p|r|t|v|y)\s)0(\d\s\d\d:\d\d:\d\d)/;
      const timestamp = moment()
        .format('MMM DD hh:mm:ss')
        .replace(rfc3164DateRegEx, '$1 $5');
      // Build message
      fmtMsg = '<' + pri + '>';
      fmtMsg += timestamp;
      fmtMsg += ' ' + this.hostname;
      fmtMsg += ' ' + this.applacationName;
      fmtMsg += ' ' + msg;
      fmtMsg += newLine;
      resolve(fmtMsg);
    });
  }
  /**
   * send a RFC5424 formatted message.  Returns a promise with the formatted
   *    message that was sent.  If no server connection was defined when the
   *    class was created a default Syslog connector will be used.
   *    @see SyslogPro~Syslog
   * @public
   * @param {string} msg - The unformatted Syslog message to send
   * @param {object} [options] - Options object
   * @param {number} [options.severity=7] - An array of structure
   * @param {number} [options.colorCode=36] - The ANSI color code to use if
   * @returns {Promise} A Syslog formatted string according to the selected RFC
   * @throws {Error} A standard error object
   */
  send(msg, options) {
    return new Promise((resolve, reject) => {
      if (!this.server) {
        this.server = new Syslog();
      }
      this.buildMessage(msg, options)
        .then((result) => {
          this.server.send(result)
            .then((sendResult) => {
              resolve(sendResult);
            })
            .catch((error) => {
              reject(error);
            });
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  /**
   * Send a syslog message with a security level of 0 (Emergency)
   * @public
   * @param {string} msg - The emergency message to send to the Syslog server
   * @returns {Promise} - The formatted syslog message sent to the Syslog server
   * @throws {Error} - Any bubbled-up error
   */
  emergency(msg) {
    return this.send(msg, {
      severity: 0,
      colorCode: this.emergencyColor,
    });
  }
  /**
   * Send a syslog message with a security level of 0 (Emergency)
   * @public
   * @param {string} msg - The emergency message to send to the Syslog server
   * @returns {Promise} - The formatted syslog message sent to the Syslog server
   * @throws {Error} - Any bubbled-up error
   */
  emer(msg) {
    return this.emergency(msg);
  }
  /**
   * Send a syslog message with a severity level of 1 (Alert)
   * @public
   * @param {string} msg - The alert message to send to the Syslog server
   * @returns {Promise} - The formatted syslog message sent to the Syslog server
   * @throws {Error} - Any bubbled-up error
   */
  alert(msg) {
    return this.send(msg, {
      severity: 1,
      colorCode: this.alertColor,
    });
  }
  /**
   * Send a syslog message with a severity level of 2 (Critical)
   * @public
   * @param {string} msg - The critical message to send to the Syslog server
   * @returns {Promise} - The formatted syslog message sent to the Syslog server
   * @throws {Error} - Any bubbled-up error
   */
  critical(msg) {
    return this.send(msg, {
      severity: 2,
      colorCode: this.criticalColor,
    });
  }
  /**
   * Send a syslog message with a severity level of 2 (Critical)
   * @public
   * @param {string} msg - The critical message to send to the Syslog server
   * @returns {Promise} - The formatted syslog message sent to the Syslog server
   * @throws {Error} - Any bubbled-up error
   */
  crit(msg) {
    return this.critical(msg);
  }
  /**
   * Send a syslog message with a severity level of 3 (Error)
   * @public
   * @param {string} msg - The error message to send to the Syslog server
   * @returns {Promise} - The formatted syslog message sent to the Syslog server
   * @throws {Error} - Any bubbled-up error
   */
  error(msg) {
    return this.send(msg, {
      severity: 3,
      colorCode: this.errorColor,
    });
  }
  /**
   * Send a syslog message with a severity level of 3 (Error)
   * @public
   * @param {string} msg - The error message to send to the Syslog server
   * @returns {Promise} - The formatted syslog message sent to the Syslog server
   * @throws {Error} - Any bubbled-up error
   */
  err(msg) {
    return this.error(msg);
  }
  /**
   * Send a syslog message with a severity level of 4 (Warning)
   * @public
   * @param {string} msg - The warning message to send to the Syslog server
   * @returns {Promise} - The formatted syslog message sent to the Syslog server
   * @throws {Error} - Any bubbled-up error
   */
  warning(msg) {
    return this.send(msg, {
      severity: 4,
      colorCode: this.warningColor,
    });
  }
  /**
   * Send a syslog message with a severity level of 4 (Warning)
   * @public
   * @param {string} msg - The warning message to send to the Syslog server
   * @returns {Promise} - The formatted syslog message sent to the Syslog server
   * @throws {Error} - Any bubbled-up error
   */
  warn(msg) {
    return this.warning(msg);
  }
  /**
   * Send a syslog message with a severity level of 5 (Notice)
   * @public
   * @param {string} msg - The notice message to send to the Syslog server
   * @returns {Promise} - The formatted syslog message sent to the Syslog server
   * @throws {Error} - Any bubbled-up error
   */
  notice(msg) {
    return this.send(msg, {
      severity: 5,
      colorCode: this.noticeColor,
    });
  }
  /**
   * Send a syslog message with a severity level of 5 (Notice)
   * @public
   * @param {string} msg - The notice message to send to the Syslog server
   * @returns {Promise} - The formatted syslog message sent to the Syslog server
   * @throws {Error} - Any bubbled-up error
   */
  note(msg) {
    return this.notice(msg);
  }
  /**
   * Send a syslog message with a severity level of 6 (Informational)
   * @public
   * @param {string} msg - The informational message to send to the Syslog
   *    server
   * @returns {Promise} - The formatted syslog message sent to the Syslog server
   * @throws {Error} - Any bubbled-up error
   */
  informational(msg) {
    return this.send(msg, {
      severity: 6,
      colorCode: this.informationalColor,
    });
  }
  /**
   * Send a syslog message with a severity level of 6 (Informational)
   * @public
   * @param {string} msg - The informational message to send to the Syslog
   *    server
   * @returns {Promise} - The formatted syslog message sent to the Syslog server
   * @throws {Error} - Any bubbled-up error
   */
  info(msg) {
    return this.informational(msg);
  }
  /**
   * Send a syslog message with a severity level of 6 (Informational)
   * @public
   * @param {string} msg - The informational message to send to the Syslog
   *    server
   * @returns {Promise} - The formatted syslog message sent to the Syslog server
   * @throws {Error} - Any bubbled-up error
   */
  log(msg) {
    return this.informational(msg);
  }
  /**
   * Send a syslog message with a severity level of 7 (Debug)
   * @public
   * @param {string} msg - The debug message to send to the Syslog server
   * @returns {Promise} - The formatted syslog message sent to the Syslog server
   * @throws {Error} - Any bubbled-up error
   */
  debug(msg) {
    return this.send(msg, {
      severity: 7,
      colorCode: this.debugColor,
    });
  }
}

/**
 * A class to work with RFC5424 formatted syslog messages. The messaging is
 * fully configurable and ANSI foreground  * colors can be added.  Both ANSI 8
 * and ANSI 256 color are fully supported.
 *Most APIs will return a promise. These APIs can be used using
 * `then(...)/catch(...)`
 *
 * A Syslog class with a configured
 * Syslog server target can also be used as the input into the formatting
 * classes so that it may run independently.
 *
 * The RFC5424 Syslog logging format is meant to be used as a stream of log data
 * from a service or application. This class is designed to be used in this
 * fashion where new messages are written to the class as needed.
 * @requires moment
 * @version 0.0.0
 * @since 0.0.0
 */
class RFC5424 {
  /**
   * Construct a new RFC5424 formatted Syslog object with user options
   * @public
   * @this RFC5424
   * @param {object} [options] - Options object
   * @param {string} [options.applacationName='NodeJSLogger'] - Application
   * @param {string} [options.hostname=os.hostname] - The name of this server
   * @param {boolean} [options.timestamp=false] - Included a Timestamp
   * @param {boolean} [options.timestampUTC=false] - RFC standard is for
   *    local time
   * @param {boolean} [options.timestampMS=false] - Timestamp with ms
   *    resolution
   * @param {boolean} [options.timestampTZ=true] - Should the timestamp
   *    included time zone
   * @param {boolean} [options.encludeStructuredData=false] - Included
   *    any provided structured data
   * @param {boolean} [options.utf8BOM=true] - Included the UTF8
   * @param {boolean} [options.color=false] - Included the UTF8
   * @param {boolean} [options.extendedColor=false] - Included the UTF8
   *    encoding tag with syslog message text
   * @param {object} [options.colors] - User defended colors for
   *    severities
   * @param {string} [options.colors.emergencyColor] - A RGB Hex coded color in
   *    the form of #FFFFFF or as or the ANSI color code number (30-37 Standard
   *    & 0-255 Extended)
   * @param {string} [options.colors.alertColor] - A RGB Hex coded color in the
   *    form of #FFFFFF or as or the ANSI color code number (30-37 Standard &
   *    0-255 Extended)
   * @param {string} [options.colors.criticalColor] - A RGB Hex coded color in
   *    the form of #FFFFFF or as or the ANSI color code number (30-37 Standard
   *    & 0-255 Extended)
   * @param {string} [options.colors.errorColor] - A RGB Hex coded color in the
   *    form of #FFFFFF or as or the ANSI color code number (30-37 Standard &
   *    0-255 Extended)
   * @param {string} [options.colors.warningColor] - A RGB Hex coded color in
   *    the form of #FFFFFF or as or the ANSI color code number (30-37 Standard
   *    & 0-255 Extended)
   * @param {string} [options.colors.noticeColor] - A RGB Hex coded color in the
   *    form of #FFFFFF or as or the ANSI color code number (30-37 Standard &
   *    0-255 Extended)
   * @param {string} [options.colors.informationalColor] - A RGB Hex coded color
   *    in the form of #FFFFFF or as or the ANSI color code number (30-37
   *    Standard & 0-255 Extended)
   * @param {string} [options.colors.debugColor] - A RGB Hex coded color in the
   *    form of #FFFFFF or as or the ANSI color code number (30-37 Standard &
   *    0-255 Extended)
   * @param {Syslog} [options.server=false] - A {@link module:SyslogPro~Syslog|
   *    Syslog server connection} that should be used to send messages directly
   *    from this class. @see SyslogPro~Syslog
   */
  constructor(options) {
    /** @private @type {boolean} */
    this.constructor__ = true;
    options = options || {};
    this.hostname = options.hostname || os.hostname();
    this.applacationName = options.applacationName || '';
    if (typeof options.timestamp === 'undefined' || options.timestamp) {
      /** @type {boolean} */
      this.timestamp = true;
    } else {
      this.timestamp = false;
    }
    if (options.timestampUTC) {
      /** @type {boolean} */
      this.timestampUTC = true;
    } else {
      this.timestampUTC = false;
    }
    if (typeof options.timestampTZ === 'undefined' || options.timestampTZ) {
      /** @type {boolean} */
      this.timestampTZ = true;
    } else {
      this.timestampTZ = false;
    }
    if (options.timestampMS) {
      /** @type {boolean} */
      this.timestampMS = true;
    } else {
      this.timestampMS = false;
    }
    if (options.encludeStructuredData) {
      /** @type {boolean} */
      this.encludeStructuredData = true;
    } else {
      this.encludeStructuredData = false;
    }
    if (typeof options.utf8BOM === 'undefined' || options.utf8BOM) {
      /** @type {boolean} */
      this.utf8BOM = true;
    } else {
      this.utf8BOM = false;
    }
    if (options.color) {
      /** @type {boolean} */
      this.color = true;
    } else {
      this.color = false;
    }
    if (options.extendedColor) {
      /** @type {boolean} */
      this.extendedColor = true;
    } else {
      this.extendedColor = false;
    }
    if (options.server) {
      if (!options.server.constructor__) {
        /** @private @type {Syslog} */
        this.server = new Syslog(options.server);
      } else {
        this.server = options.server;
      }
    }
    if (this.extendedColor) {
      /** @private @type {number} */
      this.emergencyColor = 1; // Red foreground color
      /** @private @type {number} */
      this.alertColor = 202; // Dark Orange foreground color
      /** @private @type {number} */
      this.criticalColor = 208; // Orange foreground color
      /** @private @type {number} */
      this.errorColor = 178; // Light Orange foreground color
      /** @private @type {number} */
      this.warningColor = 226; // Yellow foreground color
      /** @private @type {number} */
      this.noticeColor = 117; // Light Blue foreground color
      /** @private @type {number} */
      this.informationalColor = 45; // Blue foreground color
      /** @private @type {number} */
      this.debugColor = 27; // Dark Blue foreground color
    } else {
      this.emergencyColor = 31; // Red foreground color
      this.alertColor = 31; // Red foreground color
      this.criticalColor = 31; // Red foreground color
      this.errorColor = 33; // Yellow foreground color
      this.warningColor = 33; // Yellow foreground color
      this.noticeColor = 36; // Blue foreground color
      this.informationalColor = 36; // Blue foreground color
      this.debugColor = 34; // Dark Blue foreground color
    }
    if (typeof options.colors === 'object') {
      this.setColor(options.colors, this.extendedColor);
    }
  }
  /**
   * Sets the color to be used for messages at a set priority
   * @public
   * @param {string} [colors.emergencyColor] - A RGB Hex coded color in the form
   *    of #FFFFFF or as or the ANSI color code number (30-37 Standard & 0-255
   *    Extended)
   * @param {string} [colors.alertColor] - A RGB Hex coded color in the form
   *    of #FFFFFF or as or the ANSI color code number (30-37 Standard & 0-255
   *    Extended)
   * @param {string} [colors.criticalColor] - A RGB Hex coded color in the form
   *    of #FFFFFF or as or the ANSI color code number (30-37 Standard & 0-255
   *    Extended)
   * @param {string} [colors.errorColor] - A RGB Hex coded color in the form
   *    of #FFFFFF or as or the ANSI color code number (30-37 Standard & 0-255
   *    Extended)
   * @param {string} [colors.warningColor] - A RGB Hex coded color in the form
   *    of #FFFFFF or as or the ANSI color code number (30-37 Standard & 0-255
   *    Extended)
   * @param {string} [colors.noticeColor] - A RGB Hex coded color in the form
   *    of #FFFFFF or as or the ANSI color code number (30-37 Standard & 0-255
   *    Extended)
   * @param {string} [colors.informationalColor] - A RGB Hex coded color in the
   *    form of #FFFFFF or as or the ANSI color code number (30-37 Standard &
   *    0-255 Extended)
   * @param {string} [colors.debugColor] - A RGB Hex coded color in the form
   *    of #FFFFFF or as or the ANSI color code number (30-37 Standard & 0-255
   *    Extended)
   * @throws {Error} A standard error object
   */
  setColor(colors, extendedColor) {
    return new Promise((resolve, reject) => {
      let colorPromises = [];
      if (colors.emergencyColor) {
        colorPromises.push(
          new Promise((resolve, reject) => {
            rgbToAnsi(colors.emergencyColor, this.extendedColor)
              .then((result) => {
                this.emergencyColor = result;
                resolve(true);
              })
              .catch((reson) => {
                reson.message = 'TYPE ERROR: ';
                reson.message += 'emergencyColor';
                reson.message += ' Not in RGB color hex or color code';
                reject(reson);
              });
          }));
      }
      if (colors.alertColor) {
        colorPromises.push(
          new Promise((resolve, reject) => {
            rgbToAnsi(colors.alertColor, this.extendedColor)
              .then((result) => {
                this.alertColor = result;
                resolve(true);
              })
              .catch((reson) => {
                reson.message = 'TYPE ERROR: ';
                reson.message += 'alertColor';
                reson.message += ' Not in RGB color hex or color code';
                reject(reson);
              });
          }));
      }
      if (colors.criticalColor) {
        colorPromises.push(
          new Promise((resolve, reject) => {
            rgbToAnsi(colors.criticalColor, this.extendedColor)
              .then((result) => {
                this.criticalColor = result;
                resolve(true);
              })
              .catch((reson) => {
                reson.message = 'TYPE ERROR: ';
                reson.message += 'criticalColor';
                reson.message += ' Not in RGB color hex or color code';
                reject(reson);
              });
          }));
      }
      if (colors.errorColor) {
        colorPromises.push(
          new Promise((resolve, reject) => {
            rgbToAnsi(colors.errorColor, this.extendedColor)
              .then((result) => {
                this.errorColor = result;
                resolve(true);
              })
              .catch((reson) => {
                reson.message = 'TYPE ERROR: ';
                reson.message += 'errorColor';
                reson.message += ' Not in RGB color hex or color code';
                reject(reson);
              });
          }));
      }
      if (colors.warningColor) {
        colorPromises.push(
          new Promise((resolve, reject) => {
            rgbToAnsi(colors.warningColor, this.extendedColor)
              .then((result) => {
                this.warningColor = result;
                resolve(true);
              })
              .catch((reson) => {
                reson.message = 'TYPE ERROR: ';
                reson.message += 'warningColor';
                reson.message += ' Not in RGB color hex or color code';
                reject(reson);
              });
          }));
      }
      if (colors.noticeColor) {
        colorPromises.push(
          new Promise((resolve, reject) => {
            rgbToAnsi(colors.noticeColor, this.extendedColor)
              .then((result) => {
                this.noticeColor = result;
                resolve(true);
              })
              .catch((reson) => {
                reson.message = 'TYPE ERROR: ';
                reson.message += 'noticeColor';
                reson.message += ' Not in RGB color hex or color code';
                reject(reson);
              });
          }));
      }
      if (colors.informationalColor) {
        colorPromises.push(
          new Promise((resolve, reject) => {
            rgbToAnsi(colors.informationalColor, this.extendedColor)
              .then((result) => {
                this.informationalColor = result;
                resolve(true);
              })
              .catch((reson) => {
                reson.message = 'TYPE ERROR: ';
                reson.message += 'informationalColor';
                reson.message += ' Not in RGB color hex or color code';
                reject(reson);
              });
          }));
      }
      if (colors.debugColor) {
        colorPromises.push(
          new Promise((resolve, reject) => {
            rgbToAnsi(colors.debugColor, this.extendedColor)
              .then((result) => {
                this.debugColor = result;
                resolve(true);
              })
              .catch((reson) => {
                reson.message = 'TYPE ERROR: ';
                reson.message += 'debugColor';
                reson.message += ' Not in RGB color hex or color code';
                reject(reson);
              });
          }));
      }
      Promise.all(colorPromises)
        .then((results) => {
          resolve(true);
        })
        .catch((reson) => {
          reject(reson);
        });
    });
  }
  /**
   * Building a formatted message.  Returns a promise with a formatted message
   * @public
   * @param {string} msg - The Syslog Message
   * @param {object} [options] - Options object
   * @param {number} [options.severity=7] - An array of structure
   * @param {number} [options.facility=23] - Facility code to use sending this
   *    message
   * @param {string} [options.pid='-'] - The process id of the service sending
   *    this message
   * @param {string[]} [options.structuredData] - An array of structure
   *    data strings conforming to the IETF/IANA defined SD-IDs or IANA
   *    registered SMI Network Management Private Enterprise Code SD-ID
   *    conforming to the format
   *    [name@<private enterprise number> parameter=value]
   * @param {number} [options.colorCode=36] - The ANSI color code to use if
   *    message coloration is selected
   * @returns {Promise} A Syslog formatted string according to the selected RFC
   * @throws {Error} A standard error object
   */
  buildMessage(msg, options) {
    return new Promise((resolve, reject) => {
      options = options || {};
      let severity = typeof options.severity === 'number' ?
        options.severity : 6;
      if (typeof msg !== 'string' || options.severity > 7) {
        let errMsg = 'FORMAT ERROR: Syslog message must be a string';
        errMsg += ' msgSeverity must be a number between 0 and 7';
        reject(new Error(errMsg));
        return;
      }
      let facility = options.facility || 23;
      let pid = options.pid || '-';
      let id = options.id || '-';
      let msgStructuredData = options.msgStructuredData || [];
      let fmtMsg = ''; // Formated Syslog message string var
      const newLine = '\n';
      const newLineRegEx = /(\r|\n|(\r\n))/;
      const escapeCode = '\u001B';
      const resetColor = '\u001B[0m';
      // The PRI is common to both RFC formats
      const pri = (facility * 8) + severity;
      // Remove any newline character
      msg = msg.replace(newLineRegEx, '');
      // Add requested color
      if (this.color) {
        options.msgColor = options.msgColor || 36;
        let colorCode = '[';
        if (this.extendedColor) {
          colorCode += '38;5;'; // Extended 256 Colors ANSI Code
        }
        if (typeof options.msgColor === 'number') {
          colorCode += options.msgColor;
          colorCode += 'm'; // ANSI Color Closer
        } else {
          colorCode = '[39m'; // Use terminal's default color
        }
        msg = escapeCode + colorCode + msg + resetColor;
      }
      // RFC5424 timestamp formating
      let timestamp = '-';
      if (this.timestamp) {
        let timeQuality = '[timeQuality';
        if (this.timestampUTC) {
          timeQuality += ' tzKnown=1';
          if (this.timestampMS) {
            if (this.timestampTZ) {
              timestamp = moment().utc().format('YYYY-MM-DDThh:mm:ss.SSSSSSZ');
            } else {
              timestamp = moment().utc().format('YYYY-MM-DDThh:mm:ss.SSSSSS');
            }
          } else {
            if (this.timestampTZ) {
              timestamp = moment().utc().format('YYYY-MM-DDThh:mm:ssZ');
            } else {
              timestamp = moment().utc().format('YYYY-MM-DDThh:mm:ss');
            }
          }
        } else {
          if (this.timestampTZ) {
            timeQuality += ' tzKnown=1';
            if (this.timestampMS) {
              timeQuality += ' isSynced=1';
              timeQuality += ' syncAccuracy=0';
              timestamp = moment().format('YYYY-MM-DDThh:mm:ss.SSSSSSZ');
            } else {
              timestamp = moment().format('YYYY-MM-DDThh:mm:ssZ');
            }
          } else {
            timeQuality += ' tzKnown=0';
            if (this.timestampMS) {
              timeQuality += ' isSynced=1';
              timeQuality += ' syncAccuracy=0';
              timestamp = moment().format('YYYY-MM-DDThh:mm:ss.SSSSSS');
            } else {
              timestamp = moment().format('YYYY-MM-DDThh:mm:ss');
            }
          }
        }
        timeQuality += ']';
        msgStructuredData.push(timeQuality);
      }
      // Build Structured Data string
      let structuredData = '-';
      const sdElementCount = msgStructuredData.length;
      if (this.encludeStructuredData && sdElementCount > 0) {
        let sdElementNames = [];
        let sdElements = [];
        const sdElementNameRegEx = /(\[)(\S*)(\s|\])/;
        // Loop to drop duplicates of the same SD Element name
        for (let elementIndex = 0;
          elementIndex < sdElementCount;
          elementIndex++) {
          let elementName =
            msgStructuredData[elementIndex]
              .match(sdElementNameRegEx)[2];
          if (!sdElementNames.includes(elementName)) {
            sdElementNames.push(elementName);
            sdElements.push(msgStructuredData[elementIndex]);
          }
        }
        structuredData = sdElements.join('');
      }
      // Build the message
      fmtMsg = '<' + pri + '>';
      fmtMsg += '1'; // Version number
      fmtMsg += ' ' + timestamp;
      fmtMsg += ' ' + this.hostname;
      fmtMsg += ' ' + this.applacationName;
      fmtMsg += ' ' + pid;
      fmtMsg += ' ' + id;
      fmtMsg += ' ' + structuredData;
      if (this.utf8BOM) {
        fmtMsg += ' BOM' + msg;
      } else {
        fmtMsg += ' ' + msg;
      }
      fmtMsg += newLine;
      resolve(fmtMsg);
    });
  }
  /**
   * send a RFC5424 formatted message.  Returns a promise with the formatted
   *    message that was sent.  If no server connection was defined when the
   *    class was created a default Syslog connector will be used.
   *    @see SyslogPro~Syslog
   * @public
   * @param {string} msg - The unformatted Syslog message to send
   * @returns {Promise} A Syslog formatted string according to the selected RFC
   * @throws {Error} A standard error object
   */
  send(msg, options) {
    return new Promise((resolve, reject) => {
      if (!this.server) {
        this.server = new Syslog();
      }
      this.buildMessage(msg, options)
        .then((result) => {
          this.server.send(result)
            .then((sendResult) => {
              resolve(sendResult);
            })
            .catch((error) => {
              reject(error);
            });
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  /**
   * Send a syslog message with a severity level of 0 (Emergency)
   * @public
   * @param {string} msg - The emergency message to send to the Syslog server
   * @returns {Promise} - The formatted syslog message sent to the Syslog server
   * @throws {Error} - Any bubbled-up error
   */
  emergency(msg) {
    return this.send(msg, {
      severity: 0,
      colorCode: this.emergencyColor,
    });
  }
  /**
   * Send a syslog message with a severity level of 0 (Emergency)
   * @public
   * @param {string} msg - The emergency message to send to the Syslog server
   * @returns {Promise} - The formatted syslog message sent to the Syslog server
   * @throws {Error} - Any bubbled-up error
   */
  emer(msg) {
    return this.emergency(msg);
  }
  /**
   * Send a syslog message with a severity level of 1 (Alert)
   * @public
   * @param {string} msg - The alert message to send to the Syslog server
   * @returns {Promise} - The formatted syslog message sent to the Syslog server
   * @throws {Error} - Any bubbled-up error
   */
  alert(msg) {
    return this.send(msg, {
      severity: 1,
      colorCode: this.alertColor,
    });
  }
  /**
   * Send a syslog message with a severity level of 2 (Critical)
   * @public
   * @param {string} msg - The critical message to send to the Syslog server
   * @returns {Promise} - The formatted syslog message sent to the Syslog server
   * @throws {Error} - Any bubbled-up error
   */
  critical(msg) {
    return this.send(msg, {
      severity: 2,
      colorCode: this.criticalColor,
    });
  }
  /**
   * Send a syslog message with a severity level of 2 (Critical)
   * @public
   * @param {string} msg - The critical message to send to the Syslog server
   * @returns {Promise} - The formatted syslog message sent to the Syslog server
   * @throws {Error} - Any bubbled-up error
   */
  crit(msg) {
    return this.critical(msg);
  }
  /**
   * Send a syslog message with a severity level of 3 (Error)
   * @public
   * @param {string} msg - The error message to send to the Syslog server
   * @returns {Promise} - The formatted syslog message sent to the Syslog server
   * @throws {Error} - Any bubbled-up error
   */
  error(msg) {
    return this.send(msg, {
      severity: 3,
      colorCode: this.errorColor,
    });
  }
  /**
   * Send a syslog message with a severity level of 3 (Error)
   * @public
   * @param {string} msg - The error message to send to the Syslog server
   * @returns {Promise} - The formatted syslog message sent to the Syslog server
   * @throws {Error} - Any bubbled-up error
   */
  err(msg) {
    return this.error(msg);
  }
  /**
   * Send a syslog message with a severity level of 4 (Warning)
   * @public
   * @param {string} msg - The warning message to send to the Syslog server
   * @returns {Promise} - The formatted syslog message sent to the Syslog server
   * @throws {Error} - Any bubbled-up error
   */
  warning(msg) {
    return this.send(msg, {
      severity: 4,
      colorCode: this.warningColor,
    });
  }
  /**
   * Send a syslog message with a severity level of 4 (Warning)
   * @public
   * @param {string} msg - The warning message to send to the Syslog server
   * @returns {Promise} - The formatted syslog message sent to the Syslog server
   * @throws {Error} - Any bubbled-up error
   */
  warn(msg) {
    return this.warning(msg);
  }
  /**
   * Send a syslog message with a severity level of 5 (Notice)
   * @public
   * @param {string} msg - The notice message to send to the Syslog server
   * @returns {Promise} - The formatted syslog message sent to the Syslog server
   * @throws {Error} - Any bubbled-up error
   */
  notice(msg) {
    return this.send(msg, {
      severity: 5,
      colorCode: this.noticeColor,
    });
  }
  /**
   * Send a syslog message with a severity level of 5 (Notice)
   * @public
   * @param {string} msg - The notice message to send to the Syslog server
   * @returns {Promise} - The formatted syslog message sent to the Syslog server
   * @throws {Error} - Any bubbled-up error
   */
  note(msg) {
    return this.notice(msg);
  }
  /**
   * Send a syslog message with a severity level of 6 (Informational)
   * @public
   * @param {string} msg - The informational message to send to the Syslog
   *    server
   * @returns {Promise} - The formatted syslog message sent to the Syslog server
   * @throws {Error} - Any bubbled-up error
   */
  informational(msg) {
    return this.send(msg, {
      severity: 6,
      colorCode: this.informationalColor,
    });
  }
  /**
   * Send a syslog message with a severity level of 6 (Informational)
   * @public
   * @param {string} msg - The informational message to send to the Syslog
   *    server
   * @returns {Promise} - The formatted syslog message sent to the Syslog server
   * @throws {Error} - Any bubbled-up error
   */
  info(msg) {
    return this.informational(msg);
  }
  /**
   * Send a syslog message with a severity level of 6 (Informational)
   * @public
   * @param {string} msg - The informational message to send to the Syslog
   *    server
   * @returns {Promise} - The formatted syslog message sent to the Syslog server
   * @throws {Error} - Any bubbled-up error
   */
  log(msg) {
    return this.informational(msg);
  }
  /**
   * Send a syslog message with a severity level of 7 (Debug)
   * @public
   * @param {string} msg - The debug message to send to the Syslog server
   * @returns {Promise} - The formatted syslog message sent to the Syslog server
   * @throws {Error} - Any bubbled-up error
   */
  debug(msg) {
    return this.send(msg, {
      severity: 7,
      colorCode: this.debugColor,
    });
  }
}

/**
 * A class to work with IBM LEEF (Log Event Extended Format) messages this form
 * of system messages are designed to work with security systems.  Messages can
 * be saved to file (Saving to file if not part of this module but a LEEF
 * formatted message produced by this module can be saved externally to it) or
 * sent via Syslog.
 * Most APIs will return a promise. These APIs can be used using
 * `then(...)/catch(...)`
 *
 * A Syslog class with a configured Syslog server target can also be used as
 * the input into the formatting classes so that it may run independently. The
 * LEEF format is designed to send event data to a SIEM system and should not
 * be as a logging stream. This class is meant to be used once per message.
 * @requires moment
 * @version 0.0.0
 * @since 0.0.0
 */
class LEEF {
  /**
   * Construct a new LEEF formatting object with user options
   * @public
   * @param {object} [options] - Options object
   * @param {string} [options.vendor='unknown'] - The vendor of the system that
   *    generated the event being reported
   * @param {string} [options.product='unknown'] - The product name of the
   *    system that genrated the event being reported
   * @param {string} [options.version='unknown'] - The version name of the
   *    system that genrated the event being reported
   * @param {string} [options.eventId='unknown'] - The eventId of the
   *    system that genrated the event being reported
   * @param {object} [options.attributes] - LEEF message attributes which
   *    defaults to all base attributes with null values, new attributes should
   *    be added as new elements to this object
   * @param {boolean} [options.syslogHeader='true'] - Should the LEEF message
   *    include a Syslog header with Timestamp and source
   * @param {Syslog} [options.server=false] - A {@link module:SyslogPro~Syslog|
   *    Syslog server connection} that should be used to send messages directly
   *    from this class. @see SyslogPro~Syslog
   */
  constructor(options) {
    /** @private @type {boolean} */
    this.constructor__ = true;
    options = options || {};
    /** @type {string} */
    this.vendor = options.vendor || 'unknown';
    /** @type {string} */
    this.product = options.product || 'unknown';
    /** @type {string} */
    this.version = options.version || 'unknown';
    /** @type {string} */
    this.eventId = options.eventId || 'unknown';
    /** @type {boolean} */
    this.syslogHeader = typeof options.syslogHeader === 'boolean'
      ? options.syslogHeader : true;
    /** @type {object} */
    this.attributes = options.attributes || {
      cat: null,
      devTime: null,
      devTimeFormat: null,
      proto: null,
      sev: null,
      src: null,
      dst: null,
      srcPort: null,
      dstPort: null,
      srcPreNAT: null,
      dstPreNAT: null,
      srcPostNAT: null,
      dstPostNAT: null,
      usrName: null,
      srcMAC: null,
      dstMAC: null,
      srcPreNATPort: null,
      dstPreNATPort: null,
      srcPostNATPort: null,
      dstPostNATPort: null,
      identSrc: null,
      identHostName: null,
      identNetBios: null,
      identGrpName: null,
      identMAC: null,
      vSrc: null,
      vSrcName: null,
      accountName: null,
      srcBytes: null,
      dstBytes: null,
      srcPackets: null,
      dstPackets: null,
      totalPackets: null,
      role: null,
      realm: null,
      policy: null,
      resource: null,
      url: null,
      groupID: null,
      domain: null,
      isLoginEvent: null,
      isLogoutEvent: null,
      identSecondlp: null,
      calLanguage: null,
      AttributeLimits: null,
      calCountryOrRegion: null,
    };
    if (options.server) {
      if (options.server.constructor__) {
        /** @private @type {Syslog} */
        this.server = options.server;
      } else {
        this.server = new Syslog(options.server);
      }
    }
  }
  /**
   *Build a formatted message
   * @public
   * @return {Promise} - string with formatted message
   */
  buildMessage() {
    return new Promise((resolve, reject) => {
      let fmtMsg = 'LEEF:2.0';
      fmtMsg += '|' + this.vendor;
      fmtMsg += '|' + this.product;
      fmtMsg += '|' + this.version;
      fmtMsg += '|' + this.eventId;
      fmtMsg += '|';

      // Build LEEF Attributes
      const Tab = '\x09';
      const leefAttribs = Object.entries(this.attributes);
      const leefAttribsLen = leefAttribs.length;
      for (let attrib = 0; attrib < leefAttribsLen; attrib++) {
        if (leefAttribs[attrib][1] !== null) {
          fmtMsg += leefAttribs[attrib][0] + '=' + leefAttribs[attrib][1] + Tab;
        }
      }
      resolve(fmtMsg);
    });
  }

  /**
   * @public
   * @param {Syslog} [options=false] - A {@link module:SyslogPro~Syslog|
   *    Syslog server connection} that should be used to send messages directly
   *    from this class. @see SyslogPro~Syslog
   */
  send(options) {
    return new Promise((resolve, reject) => {
      this.buildMessage()
        .then((result) => {
          if (!this.server) {
            this.server = new Syslog(options);
          }
          this.server.send(result)
            .then((sendResult) => {
              resolve(sendResult);
            })
            .catch((reson) => {
              reject(reson);
            });
        });
    });
  }
}

/**
 * A class to work with HP CEF (Common Event Format) messages. This form
 * of system messages are designed to work with security systems.  Messages can
 * be saved to file (Saving to file if not part of this module but a CEF
 * formatted message produced by this module can be saved externally to it) or
 * sent via Syslog.
 * Most APIs will return a promise. These APIs can be used using
 * `then(...)/catch(...)`
 *
 * A Syslog class with a configured Syslog server target can also be used as
 * the input into the formatting classes so that it may run independently. The
 * CEF format is designed to send event data to a SIEM system and should not be
 * as a logging stream. This class is meant to be used once per message.
 * @requires moment
 * @version 0.0.0
 * @since 0.0.0
 */
class CEF {
  /**
   * Construct a new CEF formatting object with user options
   * @public
   * @param {object} [options] - Options object
   * @param {string} [options.deviceVendor='unknown'] - The vendor of the system
   *    that generated the event being reported
   * @param {string} [options.deviceProduct='unknown'] - The product name of the
   *    system that genrated the event being reported
   * @param {string} [options.deviceVersion='unknown'] - The version name of the
   *    system that genrated the event being reported
   * @param {string} [options.deviceEventClassId='unknown'] - The eventId of the
   *    system that genrated the event being reported
   * @param {string} [options.name='unknown'] - Name of the service generating
   *    the notice
   * @param {string} [options.severity='unknown'] - Severity of the notification
   * @param {string} [options.extensions={}] - Any CEF Key=Value extensions
   * @param {Syslog} [options.server=false] - A {@link module:SyslogPro~Syslog|
   *    Syslog server connection} that should be used to send messages directly
   *    from this class. @see SyslogPro~Syslog
   */
  constructor(options) {
    /** @private @type {boolean} */
    this.constructor__ = true;
    options = options || {};
    /** @type {string} */
    this.deviceVendor = options.deviceVendor || 'Unknown';
    /** @type {string} */
    this.deviceProduct = options.deviceProduct || 'Unknown';
    /** @type {string} */
    this.deviceVersion = options.deviceVersion || 'Unknown';
    /** @type {string} */
    this.deviceEventClassId = options.deviceEventClassId || 'Unknown';
    /** @type {string} */
    this.name = options.name || 'Unknown';
    /** @type {string} */
    this.severity = options.severity || 'Unknown';
    /** @type {object} */
    this.extensions = options.extensions || {
      deviceAction: null,
      applicationProtocol: null,
      deviceCustomIPv6Address1: null,
      'deviceCustomIPv6 Address1Label': null,
      deviceCustomIPv6Address3: null,
      'deviceCustomIPv6Address3 Label': null,
      'deviceCustomIPv6 Address4': null,
      'deviceCustomIPv6 Address4Label': null,
      deviceEventCategory: null,
      deviceCustomFloatingPoint1: null,
      'deviceCustom FloatingPoint1Label': null,
      deviceCustomFloatingPoint2: null,
      'deviceCustomFloatingPoint2 Label': null,
      deviceCustomFloatingPoint3: null,
      'deviceCustom FloatingPoint3Label': null,
      deviceCustomFloatingPoint4: null,
      'deviceCustom FloatingPoint4Label': null,
      deviceCustomNumber1: null,
      deviceCustomNumber1Label: null,
      DeviceCustomNumber2: null,
      deviceCustomNumber2Label: null,
      deviceCustomNumber3: null,
      deviceCustomNumber3Label: null,
      baseEventCount: null,
      deviceCustomString1: null,
      deviceCustomString1Label: null,
      deviceCustomString2: null,
      deviceCustomString2Label: null,
      deviceCustomString3: null,
      deviceCustomString3Label: null,
      deviceCustomString4: null,
      deviceCustomString4Label: null,
      deviceCustomString5: null,
      deviceCustomString5Label: null,
      deviceCustomString6: null,
      deviceCustomString6Label: null,
      destinationDnsDomain: null,
      destinationServiceName: null,
      'destinationTranslated Address': null,
      destinationTranslatedPort: null,
      deviceCustomDate1: null,
      deviceCustomDate1Label: null,
      deviceCustomDate2: null,
      deviceCustomDate2Label: null,
      deviceDirection: null,
      deviceDnsDomain: null,
      deviceExternalId: null,
      deviceFacility: null,
      deviceInboundInterface: null,
      deviceNtDomain: null,
      deviceOutboundInterface: null,
      devicePayloadId: null,
      deviceProcessName: null,
      deviceTranslatedAddress: null,
      destinationHostName: null,
      destinationMacAddress: null,
      destinationNtDomain: null,
      destinationProcessId: null,
      destinationUserPrivileges: null,
      destinationProcessName: null,
      destinationPort: null,
      destinationAddress: null,
      deviceTimeZone: null,
      destinationUserId: null,
      destinationUserName: null,
      deviceAddress: null,
      deviceHostName: null,
      deviceMacAddress: null,
      deviceProcessId: null,
      endTime: null,
      externalId: null,
      fileCreateTime: null,
      fileHash: null,
      fileId: null,
      fileModificationTime: null,
      filePath: null,
      filePermission: null,
      fileType: null,
      flexDate1: null,
      flexDate1Label: null,
      flexString1: null,
      flexString1Label: null,
      flexString2: null,
      flexString2Label: null,
      filename: null,
      fileSize: null,
      bytesIn: null,
      message: null,
      oldFileCreateTime: null,
      oldFileHash: null,
      oldFileId: null,
      oldFileModificationTime: null,
      oldFileName: null,
      oldFilePath: null,
      oldFileSize: null,
      oldFileType: null,
      bytesOut: null,
      eventOutcome: null,
      transportProtocol: null,
      Reason: null,
      requestUrl: null,
      requestClientApplication: null,
      requestContext: null,
      requestCookies: null,
      requestMethod: null,
      deviceReceiptTime: null,
      sourceHostName: null,
      sourceMacAddress: null,
      sourceNtDomain: null,
      sourceDnsDomain: null,
      sourceServiceName: null,
      sourceTranslatedAddress: null,
      sourceTranslatedPort: null,
      sourceProcessId: null,
      sourceUserPrivileges: null,
      sourceProcessName: null,
      sourcePort: null,
      sourceAddress: null,
      startTime: null,
      sourceUserId: null,
      sourceUserName: null,
      type: null,
      agentDnsDomain: null,
      agentNtDomain: null,
      agentTranslatedAddress: null,
      'agentTranslatedZone ExternalID': null,
      agentTranslatedZoneURI: null,
      agentZoneExternalID: null,
      agentZoneURI: null,
      agentAddress: null,
      agentHostName: null,
      agentId: null,
      agentMacAddress: null,
      agentReceiptTime: null,
      agentType: null,
      agentTimeZone: null,
      agentVersion: null,
      customerExternalID: null,
      customerURI: null,
      'destinationTranslated ZoneExternalID': null,
      'destinationTranslated ZoneURI': null,
      destinationZoneExternalID: null,
      destinationZoneURI: null,
      'deviceTranslatedZone ExternalID': null,
      deviceTranslatedZoneURI: null,
      deviceZoneExternalID: null,
      deviceZoneURI: null,
      destinationGeoLatitude: null,
      destinationGeoLongitude: null,
      eventId: null,
      rawEvent: null,
      sourceGeoLatitude: null,
      sourceGeoLongitude: null,
      'sourceTranslatedZone ExternalID': null,
      sourceTranslatedZoneURI: null,
      sourceZoneExternalID: null,
      sourceZoneURI: null,
    };
    if (options.server) {
      if (options.server.constructor__) {
        /** @private @type {Syslog} */
        this.server = options.server;
      } else {
        this.server = new Syslog(options.server);
      }
    }
  }
  /**
   * Validate this CEF object
   * @public
   * @return {Promise} - True if validated
   * @throws {Error} - First element to fail validation
   */
  validate() {
    return new Promise((resolve, reject) => {
      const Extensions = {
        deviceAction: {
          key: 'act',
          type: 'String',
          len: 63,
          discription: 'Action taken by the device.',
        },
        applicationProtocol: {
          key: 'app',
          type: 'String',
          len: 31,
          discription: 'Application level protocol, example values are HTTP, ' +
              'HTTPS, SSHv2, Telnet, POP, IMPA, IMAPS, and so on.',
        },
        deviceCustomIPv6Address1: {
          key: 'c6a1',
          type: 'String',
          len: null,
          discription: 'One of four IPv6 address fields available to map ' +
              'fields that do not apply to any other in this dictionary. ' +
              'TIP: See the guidelines under “User-Defined Extensions” for ' +
              'tips on using these fields.',
        },
        'deviceCustomIPv6 Address1Label': {
          key: 'c6a1Label',
          type: 'String',
          len: 1023,
          discription: 'All custom fields have a corresponding label field. ' +
              'Each of these fields is a string and describes the purpose of ' +
              'the custom field.',
        },
        deviceCustomIPv6Address3: {
          key: 'c6a3',
          type: 'String',
          len: null,
          discription: 'One of four IPv6 address fields available to map ' +
              'fields that do not apply to any other in this dictionary. ' +
              'TIP: See the guidelines under “User-Defined Extensions” for ' +
              'tips on using these fields.',
        },
        'deviceCustomIPv6Address3 Label': {
          key: 'c6a3Label',
          type: 'String',
          len: 1023,
          discription: 'All custom fields have a corresponding label field. ' +
              'Each of these fields is a string and describes the purpose of ' +
              'the custom field.',
        },
        'deviceCustomIPv6 Address4': {
          key: 'c6a4',
          type: 'String',
          len: null,
          discription: 'One of four IPv6 address fields available to map ' +
              'fields that do not apply to any other in this dictionary. ' +
              'TIP: See the guidelines under “User-Defined Extensions” for ' +
              'tips on using these fields.',
        },
        'deviceCustomIPv6 Address4Label': {
          key: 'C6a4Label',
          type: 'String',
          len: 1023,
          discription: 'All custom fields have a corresponding label field. ' +
              'Each of these fields is a string and describes the purpose of ' +
              'the custom field.',
        },
        deviceEventCategory: {
          key: 'cat',
          type: 'String',
          len: 1023,
          discription: 'Represents the category assigned by the originating ' +
              'device. Devices often use their own categorization schema to ' +
              'classify event. Example: “/Monitor/Disk/Read”',
        },
        deviceCustomFloatingPoint1: {
          key: 'cfp1',
          type: 'Number',
          len: null,
          discription: 'One of four floating point fields available to map ' +
              'fields that do not apply to any other in this dictionary.',
        },
        'deviceCustom FloatingPoint1Label': {
          key: 'cfp1Label',
          type: 'String',
          len: 1023,
          discription: 'All custom fields have a corresponding label field. ' +
              'Each of these fields is a string and describes the purpose of ' +
              'the custom field.',
        },
        deviceCustomFloatingPoint2: {
          key: 'cfp2',
          type: 'Number',
          len: null,
          discription: 'One of four floating point fields available to map ' +
              'fields that do not apply to any other in this dictionary.',
        },
        'deviceCustomFloatingPoint2 Label': {
          key: 'cfp2Label',
          type: 'String',
          len: 1023,
          discription: 'All custom fields have a corresponding label field. ' +
              'Each of these fields is a string and describes the purpose of ' +
              'the custom field.',
        },
        deviceCustomFloatingPoint3: {
          key: 'cfp3',
          type: 'Number',
          len: null,
          discription: 'One of four floating point fields available to map ' +
              'fields that do not apply to any other in this dictionary.',
        },
        'deviceCustom FloatingPoint3Label': {
          key: 'cfp3Label',
          type: 'String',
          len: 1023,
          discription: 'All custom fields have a corresponding label field. ' +
              'Each of these fields is a string and describes the purpose of ' +
              'the custom field.',
        },
        deviceCustomFloatingPoint4: {
          key: 'cfp4',
          type: 'Number',
          len: null,
          discription: 'One of four floating point fields available to map ' +
              'fields that do not apply to any other in this dictionary.',
        },
        'deviceCustom FloatingPoint4Label': {
          key: 'cfp4Label',
          type: 'String',
          len: 1023,
          discription: 'All custom fields have a corresponding label field. ' +
              'Each of these fields is a string and describes the purpose of ' +
              'the custom field.',
        },
        deviceCustomNumber1: {
          key: 'cn1',
          type: 'Number',
          len: null,
          discription: 'One of three number fields available to map fields ' +
              'that do not apply to any other in this dictionary. Use ' +
              'sparingly and seek a more specific dictionary supplied field ' +
              'when possible.',
        },
        deviceCustomNumber1Label: {
          key: 'cn1Label',
          type: 'String',
          len: 1023,
          discription: 'All custom fields have a corresponding label field. ' +
              'Each of these fields is a string and describes the purpose of ' +
              'the custom field.',
        },
        DeviceCustomNumber2: {
          key: 'cn2',
          type: 'Number',
          len: null,
          discription: 'One of three number fields available to map fields ' +
              'that do not apply to any other in this dictionary. Use ' +
              'sparingly and seek a more specific, dictionary supplied field ' +
              'when possible.',
        },
        deviceCustomNumber2Label: {
          key: 'cn2Label',
          type: 'String',
          len: 1023,
          discription: 'All custom fields have a corresponding label field. ' +
              'Each of these fields is a string and describes the purpose of ' +
              'the custom field.',
        },
        deviceCustomNumber3: {
          key: 'cn3',
          type: 'Number',
          len: null,
          discription: 'One of three number fields available to map fields ' +
              'that do not apply to any other in this dictionary. Use ' +
              'sparingly and seek a more specific, dictionary supplied field ' +
              'when possible.',
        },
        deviceCustomNumber3Label: {
          key: 'cn3Label',
          type: 'String',
          len: 1023,
          discription: 'All custom fields have a corresponding label field. ' +
              'Each of these fields is a string and describes the purpose of ' +
              'the custom field.',
        },
        baseEventCount: {
          key: 'cnt',
          type: 'Number',
          len: null,
          discription: 'A count associated with this event. How many times ' +
              'was this same event observed? Count can be omitted if it is 1.',
        },
        deviceCustomString1: {
          key: 'cs1',
          type: 'String',
          len: 4000,
          discription: 'One of six strings available to map fields that do ' +
              'not apply to any other in this dictionary. Use sparingly and ' +
              'seek a more specific, dictionary supplied field when ' +
              'possible. TIP: See the guidelines under “User-Defined ' +
              'Extensions” for tips on using these fields.',
        },
        deviceCustomString1Label: {
          key: 'cs1Label',
          type: 'String',
          len: 1023,
          discription: 'All custom fields have a corresponding label field. ' +
              'Each of these fields is a string and describes the purpose of ' +
              'the custom field.',
        },
        deviceCustomString2: {
          key: 'cs2',
          type: 'String',
          len: 4000,
          discription: 'One of six strings available to map fields that do ' +
              'not apply to any other in this dictionary. Use sparingly and ' +
              'seek a more specific, dictionary supplied field when ' +
              'possible. TIP: See the guidelines under “User-Defined ' +
              'Extensions” for tips on using these fields.',
        },
        deviceCustomString2Label: {
          key: 'cs2Label',
          type: 'String',
          len: 1023,
          discription: 'All custom fields have a corresponding label field. ' +
              'Each of these fields is a string and describes the purpose of ' +
              'the custom field.',
        },
        deviceCustomString3: {
          key: 'cs3',
          type: 'String',
          len: 4000,
          discription: 'One of six strings available to map fields that do ' +
              'not apply to any other in this dictionary. Use sparingly and ' +
              'seek a more specific, dictionary supplied field when ' +
              'possible. TIP: See the guidelines under “User-Defined ' +
              'Extensions” for tips on using these fields.',
        },
        deviceCustomString3Label: {
          key: 'cs3Label',
          type: 'String',
          len: 1023,
          discription: 'All custom fields have a corresponding label field. ' +
              'Each of these fields is a string and describes the purpose of ' +
              'the custom field.',
        },
        deviceCustomString4: {
          key: 'cs4',
          type: 'String',
          len: 4000,
          discription: 'One of six strings available to map fields that do ' +
              'not apply to any other in this dictionary. Use sparingly and ' +
              'seek a more specific, dictionary supplied field when ' +
              'possible. TIP: See the guidelines under “User-Defined ' +
              'Extensions” for tips on using these fields.',
        },
        deviceCustomString4Label: {
          key: 'cs4Label',
          type: 'String',
          len: 1023,
          discription: 'All custom fields have a corresponding label field. ' +
              'Each of these fields is a string and describes the purpose of ' +
              'the custom field.',
        },
        deviceCustomString5: {
          key: 'cs5',
          type: 'String',
          len: 4000,
          discription: 'One of six strings available to map fields that do ' +
              'not apply to any other in this dictionary. Use sparingly and ' +
              'seek a more specific, dictionary supplied field when ' +
              'possible. TIP: See the guidelines under “User-Defined ' +
              'Extensions” for tips on using these fields.',
        },
        deviceCustomString5Label: {
          key: 'cs5Label',
          type: 'String',
          len: 1023,
          discription: 'All custom fields have a corresponding label field. ' +
              'Each of these fields is a string and describes the purpose of ' +
              'the custom field.',
        },
        deviceCustomString6: {
          key: 'cs6',
          type: 'String',
          len: 4000,
          discription: 'One of six strings available to map fields that do ' +
              'not apply to any other in this dictionary. Use sparingly and ' +
              'seek a more specific, dictionary supplied field when ' +
              'possible. TIP: See the guidelines under “User-Defined ' +
              'Extensions” for tips on using these fields.',
        },
        deviceCustomString6Label: {
          key: 'cs6Label',
          type: 'String',
          len: 1023,
          discription: 'All custom fields have a corresponding label field. ' +
              'Each of these fields is a string and describes the purpose of ' +
              'the custom field.',
        },
        destinationDnsDomain: {
          key: 'destination DnsDomain',
          type: 'String',
          len: 255,
          discription: 'The DNS domain part of the complete fully qualified ' +
              'domain name (FQDN).',
        },
        destinationServiceName: {
          key: 'destination ServiceName',
          type: 'String',
          len: 1023,
          discription: 'The service targeted by this event. Example: “sshd”',
        },
        'destinationTranslated Address': {
          key: 'Destination Translated Address',
          type: 'String',
          len: null,
          discription: 'Identifies the translated destination that the event ' +
              'refers to in an IP network. The format is an IPv4 address. ' +
              'Example: “192.168.10.1”',
        },
        destinationTranslatedPort: {
          key: 'Destination TranslatedPort',
          type: 'Number',
          len: null,
          discription: 'Port after it was translated; for example, a ' +
              'firewall. Valid port numbers are 0 to 65535.',
        },
        deviceCustomDate1: {
          key: 'deviceCustom Date1',
          type: 'String',
          len: null,
          discription: 'One of two timestamp fields available to map fields ' +
              'that do not apply to any other in this dictionary. Use ' +
              'sparingly and seek a more specific, dictionary supplied field ' +
              'when possible. TIP: See the guidelines under “User-Defined ' +
              'Extensions” for tips on using these fields.',
        },
        deviceCustomDate1Label: {
          key: 'deviceCustom Date1Label',
          type: 'String',
          len: 1023,
          discription: 'All custom fields have a corresponding label field. ' +
              'Each of these fields is a string and describes the purpose of ' +
              'the custom field.',
        },
        deviceCustomDate2: {
          key: 'deviceCustom Date2',
          type: 'String',
          len: null,
          discription: 'One of two timestamp fields available to map fields ' +
              'that do not apply to any other in this dictionary. Use ' +
              'sparingly and seek a more specific, dictionary supplied field ' +
              'when possible. TIP: See the guidelines under “User-Defined ' +
              'Extensions” for tips on using these fields.',
        },
        deviceCustomDate2Label: {
          key: 'deviceCustom Date2Label',
          type: 'String',
          len: 1023,
          discription: 'All custom fields have a corresponding label field. ' +
              'Each of these fields is a string and describes the purpose of ' +
              'the custom field.',
        },
        deviceDirection: {
          key: 'deviceDirection',
          type: 'Number',
          len: null,
          discription: 'Any information about what direction the observed ' +
              'communication has taken. The following values are supported: ' +
              '“0” for inbound or “1” for outbound',
        },
        deviceDnsDomain: {
          key: 'deviceDns Domain',
          type: 'String',
          len: 255,
          discription: 'The DNS domain part of the complete fully qualified ' +
              'domain name (FQDN).',
        },
        deviceExternalId: {
          key: 'device ExternalId',
          type: 'String',
          len: 255,
          discription: 'A name that uniquely identifies the device ' +
              'generating this event.',
        },
        deviceFacility: {
          key: 'deviceFacility',
          type: 'String',
          len: 1023,
          discription: 'The facility generating this event. For example, ' +
              'Syslog has an explicit facility associated with every event.',
        },
        deviceInboundInterface: {
          key: 'deviceInbound Interface',
          type: 'String',
          len: 128,
          discription: 'Interface on which the packet or data entered the ' +
              'device.',
        },
        deviceNtDomain: {
          key: 'deviceNt Domain',
          type: 'String',
          len: 255,
          discription: 'The Windows domain name of the device address.',
        },
        deviceOutboundInterface: {
          key: 'Device Outbound Interface',
          type: 'String',
          len: 128,
          discription: 'Interface on which the packet or data left the ' +
              'device.',
        },
        devicePayloadId: {
          key: 'Device PayloadId',
          type: 'String',
          len: 128,
          discription: 'Unique identifier for the payload associated with ' +
              'the event.',
        },
        deviceProcessName: {
          key: 'deviceProcess Name',
          type: 'String',
          len: 1023,
          discription: 'Process name associated with the event. An example ' +
              'might be the process generating the syslog entry in UNIX.',
        },
        deviceTranslatedAddress: {
          key: 'device Translated Address',
          type: 'String',
          len: null,
          discription: 'Identifies the translated device address that the ' +
              'event refers to in an IP network. The format is an IPv4 ' +
              'address. Example: “192.168.10.1”',
        },
        destinationHostName: {
          key: 'dhost',
          type: 'String',
          len: 1023,
          discription: 'Identifies the destination that an event refers to ' +
              'in an IP network. The format should be a fully qualified ' +
              'domain name (FQDN) associated with the destination node, when ' +
              'a node is available. Examples: “host.domain.com” or “host”.',
        },
        destinationMacAddress: {
          key: 'dmac',
          type: 'String',
          len: null,
          discription: 'Six colon-seperated hexadecimal numbers. Example: ' +
              '“00:0D:60:AF:1B:61”',
        },
        destinationNtDomain: {
          key: 'dntdom',
          type: 'String',
          len: 255,
          discription: 'The Windows domain name of the destination address.',
        },
        destinationProcessId: {
          key: 'dpid',
          type: 'Number',
          len: null,
          discription: 'Provides the ID of the destination process ' +
              'associated with the event. For example, if an event contains ' +
              'process ID 105, 105” is the process ID.',
        },
        destinationUserPrivileges: {
          key: 'dpriv',
          type: 'String',
          len: 1023,
          discription: 'The typical values are “Administrator”, “User”, and ' +
              '“Guest”. This identifies the destination user’s privileges. ' +
              'In UNIX, for example, activity executed on the root user ' +
              'would be identified with destinationUser Privileges of ' +
              '“Administrator”.',
        },
        destinationProcessName: {
          key: 'dproc',
          type: 'String',
          len: 1023,
          discription: 'The name of the event’s destination process. ' +
              'Example: “telnetd” or “sshd”.',
        },
        destinationPort: {
          key: 'dpt',
          type: 'Number',
          len: null,
          discription: 'The valid port numbers are between 0 and 65535.',
        },
        destinationAddress: {
          key: 'dst',
          type: 'String',
          len: null,
          discription: 'Identifies the destination address that the event ' +
              'refers to in an IP network. The format is an IPv4 address. ' +
              'Example: “192.168.10.1”',
        },
        deviceTimeZone: {
          key: 'dtz',
          type: 'String',
          len: 255,
          discription: 'The timezone for the device generating the event.',
        },
        destinationUserId: {
          key: 'duid',
          type: 'String',
          len: 1023,
          discription: 'Identifies the destination user by ID. For example, ' +
              'in UNIX, the root user is generally associated with user ' +
              'ID 0.',
        },
        destinationUserName: {
          key: 'duser',
          type: 'String',
          len: 1023,
          discription: 'Identifies the destination user by name. This is the ' +
              'user associated with the event’s destination. Email addresses ' +
              'are often mapped into the UserName fields. The recipient is a ' +
              'candidate to put into this field.',
        },
        deviceAddress: {
          key: 'dvc',
          type: 'String',
          len: null,
          discription: 'Identifies the device address that an event refers ' +
              'to in an IP network. The format is an IPv4 address. Example: ' +
              '“192.168.10.1”.',
        },
        deviceHostName: {
          key: 'dvchost',
          type: 'String',
          len: 100,
          discription: 'The format should be a fully qualified domain name ' +
              '(FQDN) associated with the device node, when a node is ' +
              'available. Example: “host.domain.com” or “host”.',
        },
        deviceMacAddress: {
          key: 'dvcmac',
          type: 'String',
          len: null,
          discription: 'Six colon-separated hexadecimal numbers. Example: ' +
              '“00:0D:60:AF:1B:61”',
        },
        deviceProcessId: {
          key: 'dvcpid',
          type: 'Number',
          len: null,
          discription: 'Provides the ID of the process on the device ' +
              'generating the event.',
        },
        endTime: {
          key: 'end',
          type: 'String',
          len: null,
          discription: 'The time at which the activity related to the event ' +
              'ended. The format is MMM dd yyyy HH:mm:ss or milliseconds ' +
              'since epoch (Jan 1st1970). An example would be reporting the ' +
              'end of a session.',
        },
        externalId: {
          key: 'externalId',
          type: 'String',
          len: 40,
          discription: 'The ID used by an originating device. They are ' +
              'usually increasing numbers, associated with events.',
        },
        fileCreateTime: {
          key: 'fileCreateTime',
          type: 'String',
          len: null,
          discription: 'Time when the file was created.',
        },
        fileHash: {
          key: 'fileHash',
          type: 'String',
          len: 255,
          discription: 'Hash of a file.',
        },
        fileId: {
          key: 'fileId',
          type: 'String',
          len: 1023,
          discription: 'An ID associated with a file could be the inode.',
        },
        fileModificationTime: {
          key: 'fileModification Time',
          type: 'String',
          len: null,
          discription: 'Time when the file was last modified.',
        },
        filePath: {
          key: 'filePath',
          type: 'String',
          len: 1023,
          discription: 'Full path to the file, including file name itself. ' +
              'Example: C:\Program Files \WindowsNT\Accessories\ wordpad.exe ' +
              'or /usr/bin/zip',
        },
        filePermission: {
          key: 'filePermission',
          type: 'String',
          len: 1023,
          discription: 'Permissions of the file.',
        },
        fileType: {
          key: 'fileType',
          type: 'String',
          len: 1023,
          discription: 'Type of file (pipe, socket, etc.)',
        },
        flexDate1: {
          key: 'flexDate1',
          type: 'String',
          len: null,
          discription: 'A timestamp field available to map a timestamp that ' +
              'does not apply to any other defined timestamp field in this ' +
              'dictionary. Use all flex fields sparingly and seek a more ' +
              'specific, dictionary supplied field when possible. These ' +
              'fields are typically reserved for customer use and should not ' +
              'be set by vendors unless necessary.',
        },
        flexDate1Label: {
          key: 'flexDate1Label',
          type: 'String',
          len: 128,
          discription: 'The label field is a string and describes the ' +
              'purpose of the flex field.',
        },
        flexString1: {
          key: 'flexString1',
          type: 'String',
          len: 1023,
          discription: 'One of four floating point fields available to map ' +
              'fields that do not apply to any other in this dictionary. Use ' +
              'sparingly and seek a more specific, dictionary supplied field ' +
              'when possible. These fields are typically reserved for ' +
              'customer use and should not be set by vendors unless ' +
              'necessary.',
        },
        flexString1Label: {
          key: 'flexString1 Label',
          type: 'String',
          len: 128,
          discription: 'The label field is a string and describes the ' +
              'purpose of the flex field.',
        },
        flexString2: {
          key: 'flexString2',
          type: 'String',
          len: 1023,
          discription: 'One of four floating point fields available to map ' +
              'fields that do not apply to any other in this dictionary. Use ' +
              'sparingly and seek a more specific, dictionary supplied field ' +
              'when possible. These fields are typically reserved for ' +
              'customer use and should not be set by vendors unless ' +
              'necessary.',
        },
        flexString2Label: {
          key: 'flex String2Label',
          type: 'String',
          len: 128,
          discription: 'The label field is a string and describes the ' +
              'purpose of the flex field.',
        },
        filename: {
          key: 'fname',
          type: 'String',
          len: 1023,
          discription: 'Name of the file only (without its path).',
        },
        fileSize: {
          key: 'fsize',
          type: 'Number',
          len: null,
          discription: 'Size of the file.',
        },
        bytesIn: {
          key: 'in',
          type: 'Number',
          len: null,
          discription: 'Number of bytes transferred inbound, relative to the ' +
              'source to destination relationship, meaning that data was ' +
              'flowing from source to destination.',
        },
        message: {
          key: 'msg',
          type: 'String',
          len: 1023,
          discription: 'An arbitrary message giving more details about the ' +
              'event. Multi-line entries can be produced by using \n as the ' +
              'new line separator.',
        },
        oldFileCreateTime: {
          key: 'oldFileCreate Time',
          type: 'String',
          len: null,
          discription: 'Time when old file was created.',
        },
        oldFileHash: {
          key: 'oldFileHash',
          type: 'String',
          len: 255,
          discription: 'Hash of the old file.',
        },
        oldFileId: {
          key: 'oldFileId',
          type: 'String',
          len: 1023,
          discription: 'An ID associated with the old file could be the ' +
              'inode.',
        },
        oldFileModificationTime: {
          key: 'oldFile Modification Time',
          type: 'String',
          len: null,
          discription: 'Time when old file was last modified.',
        },
        oldFileName: {
          key: 'oldFileName',
          type: 'String',
          len: 1023,
          discription: 'Name of the old file.',
        },
        oldFilePath: {
          key: 'oldFilePath',
          type: 'String',
          len: 1023,
          discription: 'Full path to the old fiWindowsNT\\Accessories le, ' +
              'including the file name itself. Examples: c:\\Program ' +
              'Files\\wordpad.exe or /usr/bin/zip',
        },
        oldFileSize: {
          key: 'oldFileSize',
          type: 'Number',
          len: null,
          discription: 'Size of the old file.',
        },
        oldFileType: {
          key: 'oldFileType',
          type: 'String',
          len: 1023,
          discription: 'Type of the old file (pipe, socket, etc.)',
        },
        bytesOut: {
          key: 'out',
          type: 'Number',
          len: null,
          discription: 'Number of bytes transferred outbound relative to the ' +
              'source to destination relationship. For example, the byte ' +
              'number of data flowing from the destination to the source.',
        },
        eventOutcome: {
          key: 'outcome',
          type: 'String',
          len: 63,
          discription: 'Displays the outcome, usually as ‘success’ or ' +
              '‘failure’.',
        },
        transportProtocol: {
          key: 'proto',
          type: 'String',
          len: 31,
          discription: 'Identifies the Layer-4 protocol used. The possible ' +
              'values are protocols such as TCP or UDP.',
        },
        Reason: {
          key: 'reason',
          type: 'String',
          len: 1023,
          discription: 'The reason an audit event was generated. For ' +
              'example “badd password” or “unknown user”. This could also be ' +
              'an error or return code. Example: “0x1234”',
        },
        requestUrl: {
          key: 'request',
          type: 'String',
          len: 1023,
          discription: 'In the case of an HTTP request, this field contains ' +
              'the URL accessed. The URL should contain the protocol as ' +
              'well. Example: “http://www/secure.com”',
        },
        requestClientApplication: {
          key: 'requestClient Application',
          type: 'String',
          len: 1023,
          discription: 'The User-Agent associated with the request.',
        },
        requestContext: {
          key: 'requestContext',
          type: 'String',
          len: 2048,
          discription: 'Description of the content from which the request ' +
              'originated (for example, HTTP Referrer)',
        },
        requestCookies: {
          key: 'requestCookies',
          type: 'String',
          len: 1023,
          discription: 'Cookies associated with the request.',
        },
        requestMethod: {
          key: 'requestMethod',
          type: 'String',
          len: 1023,
          discription: 'The method used to access a URL. Possible values: ' +
              '“POST”, “GET”, etc.',
        },
        deviceReceiptTime: {
          key: 'rt',
          type: 'String',
          len: null,
          discription: 'The time at which the event related to the activity ' +
              'was received. The format is MMM dd yyyy HH:mm:ss or ' +
              'milliseconds since epoch (Jan 1st 1970)',
        },
        sourceHostName: {
          key: 'shost',
          type: 'String',
          len: 1023,
          discription: 'Identifies the source that an event refers to in an ' +
              'IP network. The format should be a fully qualified domain ' +
              'name (DQDN) associated with the source node, when a mode is ' +
              'available. Examples: “host” or “host.domain.com”.',
        },
        sourceMacAddress: {
          key: 'smac',
          type: 'String',
          len: null,
          discription: 'Six colon-separated hexadecimal numbers. Example: ' +
              '“00:0D:60:AF:1B:61”',
        },
        sourceNtDomain: {
          key: 'sntdom',
          type: 'String',
          len: 255,
          discription: 'The Windows domain name for the source address.',
        },
        sourceDnsDomain: {
          key: 'sourceDns Domain',
          type: 'String',
          len: 255,
          discription: 'The DNS domain part of the complete fully qualified ' +
              'domain name (FQDN).',
        },
        sourceServiceName: {
          key: 'source ServiceName',
          type: 'String',
          len: 1023,
          discription: 'The service that is responsible for generating this ' +
              'event.',
        },
        sourceTranslatedAddress: {
          key: 'source Translated Address',
          type: 'String',
          len: null,
          discription: 'Identifies the translated source that the event ' +
              'refers to in an IP network. The format is an IPv4 address. ' +
              'Example: “192.168.10.1”.',
        },
        sourceTranslatedPort: {
          key: 'source TranslatedPort',
          type: 'Number',
          len: null,
          discription: 'A port number after being translated by, for ' +
              'example, a firewall. Valid port numbers are 0 to 65535.',
        },
        sourceProcessId: {
          key: 'spid',
          type: 'Number',
          len: null,
          discription: 'The ID of the source process associated with the ' +
              'event.',
        },
        sourceUserPrivileges: {
          key: 'spriv',
          type: 'String',
          len: 1023,
          discription: 'The typical values are “Administrator”, “User”, and ' +
              '“Guest”. It identifies the source user’s privileges. In UNIX, ' +
              'for example, activity executed by the root user would be ' +
              'identified with “Administrator”.',
        },
        sourceProcessName: {
          key: 'sproc',
          type: 'String',
          len: 1023,
          discription: 'The name of the event’s source process.',
        },
        sourcePort: {
          key: 'spt',
          type: 'Number',
          len: null,
          discription: 'The valid port numbers are 0 to 65535.',
        },
        sourceAddress: {
          key: 'src',
          type: 'String',
          len: null,
          discription: 'Identifies the source that an event refers to in an ' +
              'IP network. The format is an IPv4 address. Example: ' +
              '“192.168.10.1”.',
        },
        startTime: {
          key: 'start',
          type: 'String',
          len: null,
          discription: 'The time when the activity the event referred to ' +
              'started. The format is MMM dd yyyy HH:mm:ss or milliseconds ' +
              'since epoch (Jan 1st 1970)',
        },
        sourceUserId: {
          key: 'suid',
          type: 'String',
          len: 1023,
          discription: 'Identifies the source user by ID. This is the user ' +
              'associated with the source of the event. For example, in ' +
              'UNIX, the root user is generally associated with user ID 0.',
        },
        sourceUserName: {
          key: 'suser',
          type: 'String',
          len: 1023,
          discription: 'Identifies the source user by name. Email addresses ' +
              'are also mapped into the UserName fields. The sender is a ' +
              'candidate to put into this field.',
        },
        type: {
          key: 'type',
          type: 'Number',
          len: null,
          discription: '0 means base event, 1 means aggregated, 2 means ' +
              'correlation, and 3 means action. This field can be omitted ' +
              'for base events (type 0).',
        },
        agentDnsDomain: {
          key: 'agentDns Domain',
          type: 'String',
          len: 255,
          discription: 'The DNS domain name of the ArcSight connector that ' +
              'processed the event.',
        },
        agentNtDomain: {
          key: 'agentNtDomain',
          type: 'String',
          len: 255,
          discription: '',
        },
        agentTranslatedAddress: {
          key: 'agentTranslated Address',
          type: 'String',
          len: null,
          discription: '',
        },
        'agentTranslatedZone ExternalID': {
          key: 'agentTranslated ZoneExternalID',
          type: 'String',
          len: 200,
          discription: '',
        },
        agentTranslatedZoneURI: {
          key: 'agentTranslated Zone URI',
          type: 'String',
          len: 2048,
          discription: '',
        },
        agentZoneExternalID: {
          key: 'agentZone ExternalID',
          type: 'String',
          len: 200,
          discription: '',
        },
        agentZoneURI: {
          key: 'agentZoneURI',
          type: 'String',
          len: 2048,
          discription: '',
        },
        agentAddress: {
          key: 'agt',
          type: 'String',
          len: null,
          discription: 'The IP address of the ArcSight connector that ' +
              'processed the event.',
        },
        agentHostName: {
          key: 'ahost',
          type: 'String',
          len: 1023,
          discription: 'The hostname of the ArcSight connector that ' +
              'processed the event.',
        },
        agentId: {
          key: 'aid',
          type: 'String',
          len: 40,
          discription: 'The agent ID of the ArcSight connector that ' +
              'processed the event.',
        },
        agentMacAddress: {
          key: 'amac',
          type: 'String',
          len: null,
          discription: 'The MAC address of the ArcSight connector that ' +
              'processed the event.',
        },
        agentReceiptTime: {
          key: 'art',
          type: 'String',
          len: null,
          discription: 'The time at which information about the event was ' +
              'received by the ArcSight connector.',
        },
        agentType: {
          key: 'at',
          type: 'String',
          len: 63,
          discription: 'The agent type of the ArcSight connector that ' +
              'processed the event',
        },
        agentTimeZone: {
          key: 'atz',
          type: 'String',
          len: 255,
          discription: 'The agent time zone of the ArcSight connector that ' +
              'processed the event.',
        },
        agentVersion: {
          key: 'av',
          type: 'String',
          len: 31,
          discription: 'The version of the ArcSight connector that processed ' +
              'the event.',
        },
        customerExternalID: {
          key: 'customer ExternalID',
          type: 'String',
          len: 200,
          discription: '',
        },
        customerURI: {
          key: 'customerURI',
          type: 'String',
          len: 2048,
          discription: '',
        },
        'destinationTranslated ZoneExternalID': {
          key: 'destination TranslatedZone ExternalID',
          type: 'String',
          len: 200,
          discription: '',
        },
        'destinationTranslated ZoneURI': {
          key: 'destination Translated ZoneURI',
          type: 'String',
          len: 2048,
          discription: 'The URI for the Translated Zone that the destination ' +
              'asset has been assigned to in ArcSight.',
        },
        destinationZoneExternalID: {
          key: 'destinationZone ExternalID',
          type: 'String',
          len: 200,
          discription: '',
        },
        destinationZoneURI: {
          key: 'destinationZone URI',
          type: 'String',
          len: 2048,
          discription: 'The URI for the Zone that the destination asset has ' +
              'been assigned to in ArcSight.',
        },
        'deviceTranslatedZone ExternalID': {
          key: 'device TranslatedZone ExternalID',
          type: 'String',
          len: 200,
          discription: '',
        },
        deviceTranslatedZoneURI: {
          key: 'device TranslatedZone URI',
          type: 'String',
          len: 2048,
          discription: 'The URI for the Translated Zone that the device ' +
              'asset has been assigned to in ArcSight.',
        },
        deviceZoneExternalID: {
          key: 'deviceZone ExternalID',
          type: 'String',
          len: 200,
          discription: '',
        },
        deviceZoneURI: {
          key: 'deviceZoneURI',
          type: 'String',
          len: 2048,
          discription: 'Thee URI for the Zone that the device asset has been ' +
              'assigned to in ArcSight.',
        },
        destinationGeoLatitude: {
          key: 'dlat',
          type: 'Number',
          len: null,
          discription: 'The latitudinal value from which the ' +
              'destination’s IP address belongs.',
        },
        destinationGeoLongitude: {
          key: 'dlong',
          type: 'Number',
          len: null,
          discription: 'The longitudinal value from which the destination’s ' +
              'IP address belongs.',
        },
        eventId: {
          key: 'eventId',
          type: 'Number',
          len: null,
          discription: 'This is a unique ID that ArcSight assigns to each ' +
              'event.',
        },
        rawEvent: {
          key: 'rawEvent',
          type: 'String',
          len: 4000,
          discription: '',
        },
        sourceGeoLatitude: {
          key: 'slat',
          type: 'Number',
          len: null,
          discription: '',
        },
        sourceGeoLongitude: {
          key: 'slong',
          type: 'Number',
          len: null,
          discription: '',
        },
        'sourceTranslatedZone ExternalID': {
          key: 'source TranslatedZone ExternalID',
          type: 'String',
          len: 200,
          discription: '',
        },
        sourceTranslatedZoneURI: {
          key: 'source TranslatedZone URI',
          type: 'String',
          len: 2048,
          discription: 'The URI for the Translated Zone that the destination ' +
              'asset has been assigned to in ArcSight.',
        },
        sourceZoneExternalID: {
          key: 'sourceZone ExternalID',
          type: 'String',
          len: 200,
          discription: '',
        },
        sourceZoneURI: {
          key: 'sourceZoneURI',
          type: 'String',
          len: 2048,
          discription: 'The URI for the Zone that the source asset has been ' +
              'assigned to in ArcSight.' },
      };
      if (typeof this.deviceVendor !== 'string'
          || typeof this.deviceProduct !== 'string'
          || typeof this.deviceVersion !== 'string'
      ) {
        reject(new Error('TYPE ERROR: CEF Device Info must be a string'));
      }
      if (this.severity
          && (
            (
              typeof this.severity === 'string'
              && (
                this.severity !== 'Unknown'
                && this.severity !== 'Low'
                && this.severity !== 'Medium'
                && this.severity !== 'High'
                && this.severity !== 'Very-High'
              )
            )
            || (
              typeof this.severity === 'number'
              && (
                this.severity < 0
                || this.severity > 10
              )
            )
          )
      ) {
        reject(new Error('TYPE ERROR: CEF Severity not set correctly'));
      }
      const cefExts = Object.entries(this.extensions);
      const cefExtsLen = cefExts.length;
      for (let ext = 0; ext < cefExtsLen; ext++) {
        if (cefExts[ext][1] !== null) {
          if (Extensions[cefExts[ext][0]]) {
            if (typeof cefExts[ext][1] === Extensions[cefExts[ext][0]]
              .type
              .toLowerCase()) {
              if (Extensions[cefExts[ext][0]].len > 0
                  && typeof cefExts[ext][1] === 'string'
                  && cefExts[ext][1].length > Extensions[cefExts[ext][0]].len){
                let errMsg = 'FORMAT ERROR:';
                errMsg += ' CEF Extention Key';
                errMsg += ' ' + cefExts[ext][0];
                errMsg += ' value length is to long;';
                errMsg += ' max length is';
                errMsg += ' ' + Extensions[cefExts[ext][0]].len;
                reject(new Error(errMsg));
              }
            } else {
              let errMsg = 'TYPE ERROR:';
              errMsg += ' CEF Key';
              errMsg += ' ' + cefExts[ext][0];
              errMsg += ' value type was expected to be';
              errMsg += ' ' + Extensions[cefExts[ext][0]].type.toLowerCase();
              reject(new Error(errMsg));
            }
          }
        }
      }
      resolve(true);
    });
  }
  /**
   * Build a CEF formated string
   * @public
   * @return {Promise} - String with formated message
   */
  buildMessage() {
    return new Promise((resolve,
      reject) => {
      let fmtMsg = 'CEF:0';
      fmtMsg += '|' + this.deviceVendor;
      fmtMsg += '|' + this.deviceProduct;
      fmtMsg += '|' + this.deviceVersion;
      fmtMsg += '|' + this.deviceEventClassId;
      fmtMsg += '|' + this.name;
      fmtMsg += '|' + this.severity;
      fmtMsg += '|';

      const cefExts = Object.entries(this.extensions);
      const cefExtsLen = cefExts.length;
      for (let ext = 0; ext < cefExtsLen; ext++) {
        if (cefExts[ext][1] !== null) {
          fmtMsg += cefExts[ext][0] + '=' + cefExts[ext][1] + ' ';
        }
      }
      resolve(fmtMsg);
    });
  }
  /**
   * @public
   * @param {Syslog} [options=false] - A {@link module:SyslogPro~Syslog|
   *    Syslog server connection} that should be used to send messages directly
   *    from this class. @see SyslogPro~Syslog
   */
  send(options) {
    return new Promise((resolve,
      reject) => {
      this.buildMessage()
        .then((result) => {
          if (!this.server) {
            this.server = new Syslog(options);
          }
          this.server.send(result)
            .then((sendResult) => {
              resolve(sendResult);
            })
            .catch((reson) => {
              reject(reson);
            });
        });
    });
  }
}

module.exports = {
  RgbToAnsi: rgbToAnsi,
  RFC3164: RFC3164,
  RFC5424: RFC5424,
  LEEF: LEEF,
  CEF: CEF,
  Syslog: Syslog,
};


},{"dgram":undefined,"dns":undefined,"fs":undefined,"moment":1,"net":undefined,"os":undefined,"tls":undefined}],3:[function(require,module,exports){
const SyslogPro = require('syslog-pro');

exports.main = async (options) => {
    const applicationName = options.applicationName;
    delete options.applicationName;
    const message = options.message;
    delete options.message;
    const severity = options.severity;
    delete options.severity;
    let cef = new SyslogPro.RFC5424(options);
    cef.applacationName = applicationName;
    var methodName;
    switch (severity) {
        case 0:
            methodName = 'emergency';
            break;
        case 1:
            methodName = 'alert';
            break;
        case 2:
            methodName = 'critical';
            break;
        case 3:
            methodName = 'error';
            break;
        case 4:
            methodName = 'warning';
            break;
        case 5:
            methodName = 'notice';
            break;
        case 6:
            methodName = 'informational';
            break;
        case 7:
            methodName = 'debug';
            break;
        default:
            throw new Error("unexpected severity");
    }
    await cef[methodName](message);
};
},{"syslog-pro":2}]},{},[3])(3)
});
