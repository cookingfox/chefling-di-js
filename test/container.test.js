/* global assert, Container */

describe('container', function () {

    //--------------------------------------------------------------------------
    // SUITE
    //--------------------------------------------------------------------------

    var container = null;

    beforeEach(function () {
        container = new Container();
    });

    afterEach(function () {
        container = null;
    });

    it('suite - should initialize the container', function () {
        assert.instanceOf(container, Container);
    });

    //--------------------------------------------------------------------------
    // CREATE
    //--------------------------------------------------------------------------

    it('create - should create an instance of type', function () {
        var result = container.create(NoParameterConstructor);

        assert.instanceOf(result, NoParameterConstructor);
    });

    //--------------------------------------------------------------------------
    // GET
    //--------------------------------------------------------------------------

    it('get - should create an instance of type', function () {
        var result = container.get(NoParameterConstructor);

        assert.instanceOf(result, NoParameterConstructor);
    });

    it('get - should return same instance', function () {
        var result1 = container.get(NoParameterConstructor);
        var result2 = container.get(NoParameterConstructor);

        assert.strictEqual(result2, result1);
    });

    //--------------------------------------------------------------------------
    // HAS
    //--------------------------------------------------------------------------

    it('has - should return false if no stored value', function () {
        var result = container.has(NoParameterConstructor);

        assert.isFalse(result);
    });

    it('has - should return true if stored instance', function () {
        container.get(NoParameterConstructor);
        var result = container.has(NoParameterConstructor);

        assert.isTrue(result);
    });

    it('has - should return true if stored mapping', function () {
        container.mapInstance(NoParameterConstructor, new NoParameterConstructor());
        var result = container.has(NoParameterConstructor);

        assert.isTrue(result);
    });

    //--------------------------------------------------------------------------
    // MAP FACTORY
    //--------------------------------------------------------------------------

    it('mapFactory - should use factory to create instance', function () {
        var called = false;
        var factory = function () {
            called = true;
            return new NoParameterConstructor();
        };
        container.mapFactory(NoParameterConstructor, factory);
        var result = container.get(NoParameterConstructor);

        assert.isTrue(called);
        assert.instanceOf(result, NoParameterConstructor);
    });

    //--------------------------------------------------------------------------
    // MAP INSTANCE
    //--------------------------------------------------------------------------

    it('mapInstance - should store specific instance', function () {
        var instance = new NoParameterConstructor();
        container.mapInstance(NoParameterConstructor, instance);
        var result = container.get(NoParameterConstructor);

        assert.strictEqual(result, instance);
    });

    //--------------------------------------------------------------------------
    // MAP TYPE
    //--------------------------------------------------------------------------

    it('mapType - should map type to subType', function () {
        container.mapType(Base, NoParameterConstructor);
        var result = container.get(Base);

        assert.instanceOf(result, NoParameterConstructor);
    });

    //--------------------------------------------------------------------------
    // REMOVE
    //--------------------------------------------------------------------------

    it('remove - should remove the stored instance', function () {
        container.get(NoParameterConstructor);
        container.remove(NoParameterConstructor);
        var result = container.has(NoParameterConstructor);

        assert.isFalse(result);
    });

    it('remove - should remove the stored mapping', function () {
        container.mapInstance(NoParameterConstructor, new NoParameterConstructor());
        container.remove(NoParameterConstructor);
        var result = container.has(NoParameterConstructor);

        assert.isFalse(result);
    });

    //--------------------------------------------------------------------------
    // RESET
    //--------------------------------------------------------------------------

    it('reset - should remove all stored values', function () {
        container.get(NoParameterConstructor);
        container.mapType(Base, NoParameterConstructor);
        container.reset();

        var result1 = container.has(NoParameterConstructor);
        var result2 = container.has(Base);

        assert.isFalse(result1);
        assert.isFalse(result2);
    });

});

//------------------------------------------------------------------------------
// FIXTURES
//------------------------------------------------------------------------------

function Base() {
}

function NoParameterConstructor() {
}
NoParameterConstructor.prototype = Object.create(Base.prototype);
NoParameterConstructor.prototype.constructor = NoParameterConstructor;
