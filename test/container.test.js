/* global assert, Container, ContainerError */

"use strict";

describe('container', function () {

    //--------------------------------------------------------------------------
    // SUITE
    //--------------------------------------------------------------------------

    var _container = null;

    beforeEach(function () {
        _container = new Container();
    });

    afterEach(function () {
        _container = null;
    });

    it('suite - should initialize the container', function () {
        assert.instanceOf(_container, Container);
    });

    //--------------------------------------------------------------------------
    // CREATE
    //--------------------------------------------------------------------------

    it('create - should create an instance of type', function () {
        var result = _container.create(NoParamConstructor);

        assert.instanceOf(result, NoParamConstructor);
    });

    it('create - should resolve one param constructor', function () {
        var result = _container.create(OneParamConstructor);

        assert.instanceOf(result, OneParamConstructor);
        assert.instanceOf(result.param, NoParamConstructor);
    });

    //--------------------------------------------------------------------------
    // GET
    //--------------------------------------------------------------------------

    it('get - should throw if circular dependency on self', function () {
        var test = function () {
            _container.get(CircularSelf);
        };

        assert.throws(test, ContainerError);
    });

    it('get - should throw if simple A > B > A circular dependency', function () {
        var test = function () {
            _container.get(CircularSimpleA);
        };

        assert.throws(test, ContainerError);
    });

    it('get - should throw if complex circular dependency with mappings', function () {
        _container.mapType(CircularComplexBase, CircularComplexB);
        _container.mapFactory(CircularComplexC, function (container) {
            return new CircularComplexC(container.get(CircularComplexA));
        });
        var test = function () {
            _container.get(CircularComplexA);
        };

        assert.throws(test, ContainerError);
    });

    it('get - should create an instance of type', function () {
        var result = _container.get(NoParamConstructor);

        assert.instanceOf(result, NoParamConstructor);
    });

    it('get - should return same instance', function () {
        var result1 = _container.get(NoParamConstructor);
        var result2 = _container.get(NoParamConstructor);

        assert.strictEqual(result2, result1);
    });

    //--------------------------------------------------------------------------
    // HAS
    //--------------------------------------------------------------------------

    it('has - should return false if no stored value', function () {
        var result = _container.has(NoParamConstructor);

        assert.isFalse(result);
    });

    it('has - should return true if stored instance', function () {
        _container.get(NoParamConstructor);
        var result = _container.has(NoParamConstructor);

        assert.isTrue(result);
    });

    it('has - should return true if stored mapping', function () {
        _container.mapInstance(NoParamConstructor, new NoParamConstructor());
        var result = _container.has(NoParamConstructor);

        assert.isTrue(result);
    });

    //--------------------------------------------------------------------------
    // MAP FACTORY
    //--------------------------------------------------------------------------

    it('mapFactory - should throw if a mapping for type already exists', function () {
        _container.get(NoParamConstructor);
        var factory = function () {
            return new NoParamConstructor();
        };
        var test = function () {
            _container.mapFactory(NoParamConstructor, factory);
        };

        assert.throws(test, ContainerError);
    });

    it('mapFactory - should throw if factory not a function', function () {
        var test = function () {
            _container.mapFactory(NoParamConstructor, 123);
        };

        assert.throws(test, ContainerError);
    });

    it('mapFactory - should use factory to create instance', function () {
        var called = false;
        var factory = function () {
            called = true;
            return new NoParamConstructor();
        };
        _container.mapFactory(NoParamConstructor, factory);
        var result = _container.get(NoParamConstructor);

        assert.isTrue(called);
        assert.instanceOf(result, NoParamConstructor);
    });

    it('mapFactory - should receive Container instance', function () {
        var c = null;
        var factory = function (container) {
            c = container;
        };
        _container.mapFactory(NoParamConstructor, factory);
        _container.get(NoParamConstructor);

        assert.strictEqual(c, _container);
    });

    //--------------------------------------------------------------------------
    // MAP INSTANCE
    //--------------------------------------------------------------------------

    it('mapInstance - should throw if a mapping for type already exists', function () {
        _container.get(NoParamConstructor);
        var test = function () {
            _container.mapInstance(NoParamConstructor, new NoParamConstructor());
        };

        assert.throws(test, ContainerError);
    });

    it('mapInstance - should throw if not an instance of type', function () {
        var test = function () {
            _container.mapInstance(NoParamConstructor, {});
        };

        assert.throws(test, ContainerError);
    });

    it('mapInstance - should store specific instance', function () {
        var instance = new NoParamConstructor();
        _container.mapInstance(NoParamConstructor, instance);
        var result = _container.get(NoParamConstructor);

        assert.strictEqual(result, instance);
    });

    //--------------------------------------------------------------------------
    // MAP TYPE
    //--------------------------------------------------------------------------

    it('mapType - should throw if a mapping for type already exists', function () {
        _container.get(Base);
        var test = function () {
            _container.mapType(Base, NoParamConstructor);
        };

        assert.throws(test, ContainerError);
    });

    it('mapType - should throw if subType does not extend type', function () {
        var test = function () {
            _container.mapType(Base, Object);
        };

        assert.throws(test, ContainerError);
    });

    it('mapType - should map type to subType', function () {
        _container.mapType(Base, NoParamConstructor);
        var result = _container.get(Base);

        assert.instanceOf(result, NoParamConstructor);
    });

    //--------------------------------------------------------------------------
    // REMOVE
    //--------------------------------------------------------------------------

    it('remove - should remove the stored instance', function () {
        _container.get(NoParamConstructor);
        _container.remove(NoParamConstructor);
        var result = _container.has(NoParamConstructor);

        assert.isFalse(result);
    });

    it('remove - should remove the stored mapping', function () {
        _container.mapInstance(NoParamConstructor, new NoParamConstructor());
        _container.remove(NoParamConstructor);
        var result = _container.has(NoParamConstructor);

        assert.isFalse(result);
    });

    //--------------------------------------------------------------------------
    // RESET
    //--------------------------------------------------------------------------

    it('reset - should remove all stored values', function () {
        _container.get(NoParamConstructor);
        _container.mapType(Base, NoParamConstructor);
        _container.reset();

        var result1 = _container.has(NoParamConstructor);
        var result2 = _container.has(Base);

        assert.isFalse(result1);
        assert.isFalse(result2);
    });

    //--------------------------------------------------------------------------
    // GET DEFAULT
    //--------------------------------------------------------------------------

    it('getDefault - should return same instance', function () {
        var result1 = Container.getDefault();
        var result2 = Container.getDefault();

        assert.strictEqual(result1, result2);
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

// class with a circular dependency on itself
function CircularSelf(CircularSelf) {
}

// classes that have a circular dependency on each other
function CircularSimpleA(CircularSimpleB) {
}
function CircularSimpleB(CircularSimpleA) {
}

// classes that have a more complex circular dependency
function CircularComplexBase() {
}
function CircularComplexA(CircularComplexBase) {
}
function CircularComplexB(CircularComplexC) {
}
CircularComplexB.prototype = Object.create(CircularComplexBase.prototype);
function CircularComplexC(CircularComplexA) {
}
