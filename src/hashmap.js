"use strict";

/**
 * A key - value map implementation. This, in contrast to Object, allows the key
 * to be any value, such as objects.
 *
 * @version 0.1.1
 */
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
     * Returns the stored value for `key`.
     *
     * @param {*} key
     * @returns {*}
     */
    this.get = function (key) {
        return _values[indexOf(key)];
    };

    /**
     * Returns all the keys for `value`.
     *
     * @param {*} value
     * @returns {Array}
     */
    this.getKeysForValue = function (value) {
        var i, len, keys = [];

        for (i = 0, len = _values.length; i < len; ++i) {
            if (_values[i] === value) {
                keys.push(_keys[i]);
            }
        }

        return keys;
    };

    /**
     * Returns all values.
     *
     * @returns {Array}
     */
    this.getValues = function () {
        return _values;
    };

    /**
     * Returns whether a value for this key exists.
     *
     * @param {*} key
     * @returns {Boolean}
     */
    this.has = function (key) {
        return !!_values[indexOf(key)];
    };

    /**
     * Removes the key and value for this key.
     *
     * @param {*} key
     */
    this.remove = function (key) {
        var index = indexOf(key);
        delete _keys[index];
        delete _values[index];
    };

    /**
     * Stores the value for this key. If a value for key already exists, it will
     * be overwritten.
     *
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
     * Returns the array index for this key.
     *
     * @param {*} key
     * @returns {Number}
     */
    function indexOf(key) {
        var i, len;

        for (i = 0, len = _keys.length; i < len; ++i) {
            if (_keys[i] === key) {
                return i;
            }
        }
    }

}
