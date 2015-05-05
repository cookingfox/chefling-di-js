"use strict";

function HashMap() {

    //--------------------------------------------------------------------------
    // PRIVATE PROPERTIES
    //--------------------------------------------------------------------------

    var _keys = [];
    var _values = [];

    //--------------------------------------------------------------------------
    // PUBLIC METHODS
    //--------------------------------------------------------------------------

    /**
     * @param {*} key
     * @returns {*}
     */
    this.get = function (key) {
        return _values[indexOf(key)];
    };

    /**
     * @param {*} value
     * @returns {Array}
     */
    this.getKeysForValue = function (value) {
        var keys = [];

        for (var i = 0, len = _values.length; i < len; ++i) {
            if (_values[i] === value) {
                keys.push(_keys[i]);
            }
        }

        return keys;
    };

    /**
     * @returns {Array}
     */
    this.getValues = function () {
        return _values;
    };

    /**
     * @param {*} key
     * @returns {Boolean}
     */
    this.has = function (key) {
        return !!_values[indexOf(key)];
    };

    /**
     * @param {*} key
     */
    this.remove = function (key) {
        var index = indexOf(key);
        delete _keys[index];
        delete _values[index];
    };

    /**
     * @param {*} key
     * @param {*} value
     */
    this.set = function (key, value) {
        var index = indexOf(key);

        if (index !== undefined) {
            _keys[index] = key;
            _values[index] = value;
        } else {
            _keys.push(key);
            _values.push(value);
        }
    };

    //--------------------------------------------------------------------------
    // PRIVATE METHODS
    //--------------------------------------------------------------------------

    /**
     * @param {*} key
     * @returns {Number}
     */
    function indexOf(key) {
        for (var i = 0, len = _keys.length; i < len; ++i) {
            if (_keys[i] === key) {
                return i;
            }
        }
    }

}
