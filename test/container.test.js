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
        var result = container.create(NoParamConstructor);

        assert.instanceOf(result, NoParamConstructor);
    });

    it('create - should resolve one param constructor', function () {
        var result = container.create(OneParamConstructor);

        assert.instanceOf(result, OneParamConstructor);
        assert.instanceOf(result.param, NoParamConstructor);
    });

    //--------------------------------------------------------------------------
    // GET
    //--------------------------------------------------------------------------

    it('get - should create an instance of type', function () {
        var result = container.get(NoParamConstructor);

        assert.instanceOf(result, NoParamConstructor);
    });

    it('get - should return same instance', function () {
        var result1 = container.get(NoParamConstructor);
        var result2 = container.get(NoParamConstructor);

        assert.strictEqual(result2, result1);
    });

    //--------------------------------------------------------------------------
    // HAS
    //--------------------------------------------------------------------------

    it('has - should return false if no stored value', function () {
        var result = container.has(NoParamConstructor);

        assert.isFalse(result);
    });

    it('has - should return true if stored instance', function () {
        container.get(NoParamConstructor);
        var result = container.has(NoParamConstructor);

        assert.isTrue(result);
    });

    it('has - should return true if stored mapping', function () {
        container.mapInstance(NoParamConstructor, new NoParamConstructor());
        var result = container.has(NoParamConstructor);

        assert.isTrue(result);
    });

    //--------------------------------------------------------------------------
    // MAP FACTORY
    //--------------------------------------------------------------------------

    it('mapFactory - should throw if a mapping for type already exists', function () {
        container.get(NoParamConstructor);
        var factory = function () {
            return new NoParamConstructor();
        };
        var test = function () {
            container.mapFactory(NoParamConstructor, factory);
        };

        // @todo Use custom error
        assert.throws(test, Error);
    });

    it('mapFactory - should throw if factory not a function', function () {
        var test = function () {
            container.mapFactory(NoParamConstructor, 123);
        };

        // @todo Use custom error
        assert.throws(test, Error);
    });

    it('mapFactory - should use factory to create instance', function () {
        var called = false;
        var factory = function () {
            called = true;
            return new NoParamConstructor();
        };
        container.mapFactory(NoParamConstructor, factory);
        var result = container.get(NoParamConstructor);

        assert.isTrue(called);
        assert.instanceOf(result, NoParamConstructor);
    });

    //--------------------------------------------------------------------------
    // MAP INSTANCE
    //--------------------------------------------------------------------------

    it('mapInstance - should throw if a mapping for type already exists', function () {
        container.get(NoParamConstructor);
        var test = function () {
            container.mapInstance(NoParamConstructor, new NoParamConstructor());
        };

        // @todo Use custom error
        assert.throws(test, Error);
    });

    it('mapInstance - should throw if not an instance of type', function () {
        var test = function () {
            container.mapInstance(NoParamConstructor, {});
        };

        // @todo Use custom error
        assert.throws(test, Error);
    });

    it('mapInstance - should store specific instance', function () {
        var instance = new NoParamConstructor();
        container.mapInstance(NoParamConstructor, instance);
        var result = container.get(NoParamConstructor);

        assert.strictEqual(result, instance);
    });

    //--------------------------------------------------------------------------
    // MAP TYPE
    //--------------------------------------------------------------------------

    it('mapType - should throw if a mapping for type already exists', function () {
        container.get(Base);
        var test = function () {
            container.mapType(Base, NoParamConstructor);
        };

        // @todo Use custom error
        assert.throws(test, Error);
    });

    it('mapType - should throw if subType does not extend type', function () {
        var test = function () {
            container.mapType(Base, Object);
        };

        // @todo Use custom error
        assert.throws(test, Error);
    });

    it('mapType - should map type to subType', function () {
        container.mapType(Base, NoParamConstructor);
        var result = container.get(Base);

        assert.instanceOf(result, NoParamConstructor);
    });

    //--------------------------------------------------------------------------
    // REMOVE
    //--------------------------------------------------------------------------

    it('remove - should remove the stored instance', function () {
        container.get(NoParamConstructor);
        container.remove(NoParamConstructor);
        var result = container.has(NoParamConstructor);

        assert.isFalse(result);
    });

    it('remove - should remove the stored mapping', function () {
        container.mapInstance(NoParamConstructor, new NoParamConstructor());
        container.remove(NoParamConstructor);
        var result = container.has(NoParamConstructor);

        assert.isFalse(result);
    });

    //--------------------------------------------------------------------------
    // RESET
    //--------------------------------------------------------------------------

    it('reset - should remove all stored values', function () {
        container.get(NoParamConstructor);
        container.mapType(Base, NoParamConstructor);
        container.reset();

        var result1 = container.has(NoParamConstructor);
        var result2 = container.has(Base);

        assert.isFalse(result1);
        assert.isFalse(result2);
    });

});

//------------------------------------------------------------------------------
// FIXTURES
//------------------------------------------------------------------------------

// base class to test subclassing
function Base() {
}

// class with a constructor without parameters
function NoParamConstructor() {
}
NoParamConstructor.prototype = Object.create(Base.prototype);
NoParamConstructor.prototype.constructor = NoParamConstructor;

// class with a constructor that has one parameter
function OneParamConstructor(NoParamConstructor) {
    this.param = NoParamConstructor;
}
