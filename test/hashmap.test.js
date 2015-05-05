/* global assert, HashMap */

"use strict";

describe('hashmap', function () {

    //--------------------------------------------------------------------------
    // SUITE
    //--------------------------------------------------------------------------

    var _hashMap = null;

    beforeEach(function () {
        _hashMap = new HashMap();
    });

    afterEach(function () {
        _hashMap = null;
    });

    it('suite - should initialize HashMap', function () {
        assert.instanceOf(_hashMap, HashMap);
    });

    //--------------------------------------------------------------------------
    // TEST CASES: GET
    //--------------------------------------------------------------------------

    it('get - should return empty if no value', function () {
        var result = _hashMap.get({});

        assert.notOk(result);
    });

    it('get - should return value if set', function () {
        var key = {};
        var value = {};
        _hashMap.set(key, value);
        var result = _hashMap.get(key);

        assert.strictEqual(result, value);
    });

    //--------------------------------------------------------------------------
    // TEST CASES: GET KEYS FOR VALUE
    //--------------------------------------------------------------------------

    it('getKeysForValue - should return empty if no value', function () {
        var result = _hashMap.getKeysForValue({});

        assert.deepEqual(result, []);
    });

    it('getKeysForValue - should return empty if other values', function () {
        _hashMap.set({}, {});
        _hashMap.set({}, {});
        var result = _hashMap.getKeysForValue({});

        assert.deepEqual(result, []);
    });

    it('getKeysForValue - should return keys for value', function () {
        var value = {};
        var key1 = {};
        var key2 = {};
        _hashMap.set(key1, value);
        _hashMap.set(key2, value);
        var result = _hashMap.getKeysForValue(value);

        assert.deepEqual(result, [key1, key2]);
    });

    //--------------------------------------------------------------------------
    // TEST CASES: HAS
    //--------------------------------------------------------------------------

    it('has - should not throw if no value', function () {
        assert.doesNotThrow(function () {
            _hashMap.has({});
        });
    });

    it('has - should return true if value', function () {
        var key = {};
        _hashMap.set(key, {});
        var result = _hashMap.has(key);

        assert.isTrue(result);
    });

    //--------------------------------------------------------------------------
    // TEST CASES: REMOVE
    //--------------------------------------------------------------------------

    it('remove - should not throw if no value', function () {
        assert.doesNotThrow(function () {
            _hashMap.remove({});
        });
    });

    it('remove - should remove stored value', function () {
        var key = {};
        _hashMap.set(key, {});
        _hashMap.remove(key);
        var result = _hashMap.get(key);

        assert.notOk(result);
    });

    //--------------------------------------------------------------------------
    // TEST CASES: SET
    //--------------------------------------------------------------------------

    it('set - should store value', function () {
        var key = {};
        var value = {};
        _hashMap.set(key, value);
        var result = _hashMap.get(key);

        assert.strictEqual(result, value);
    });

    it('set - should overwrite value', function () {
        var key = {};
        var value1 = {};
        var value2 = {};
        _hashMap.set(key, value1);
        _hashMap.set(key, value2);
        var result = _hashMap.get(key);

        assert.strictEqual(result, value2);
    });

});
