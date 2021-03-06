/* global assert, Container, ContainerError, Function */

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
    // TEST CASES: CREATE
    //--------------------------------------------------------------------------

    it('create - should throw if type invalid', function () {
        testInvalidTypes(function (type) {
            _container.create(type);
        });
    });

    it('create - should create an instance of type', function () {
        var result = _container.create(NoParamConstructor);

        assert.instanceOf(result, NoParamConstructor);
    });

    it('create - should resolve one param constructor', function () {
        var result = _container.create(OneParamConstructor);

        assert.instanceOf(result, OneParamConstructor);
        assert.instanceOf(result.param, NoParamConstructor);
    });

    it('create - should throw if factory return value is falsy', function () {
        _container.mapFactory(NoParamConstructor, function () {
            // don't return anything
        });

        throwsContainerError(function () {
            _container.create(NoParamConstructor);
        });
    });

    it('create - should throw if factory returns unexpected value', function () {
        _container.mapFactory(NoParamConstructor, function () {
            return [1, 2, 3];
        });

        throwsContainerError(function () {
            _container.create(NoParamConstructor);
        });
    });

    it('create - should return complex mapped types as expected', function () {
        _container.mapType(D, E);
        _container.mapType(C, D);
        _container.mapType(B, C);
        _container.mapType(A, B);
        var result = _container.create(A);

        assert.instanceOf(result, E);
    });

    it('create - should call lifecycle create for type', function () {
        var result = _container.create(LifeCycleWithCallLog);

        assert.isTrue(result.onCreateCalled);
        assert.isFalse(result.onDestroyCalled);
    });

    it('create - should call lifecycle create for factory', function () {
        _container.mapFactory(LifeCycleWithCallLog, function () {
            return new LifeCycleWithCallLog();
        });
        var result = _container.create(LifeCycleWithCallLog);

        assert.isTrue(result.onCreateCalled);
        assert.isFalse(result.onDestroyCalled);
    });

    it('create - should call lifecycle create for instance', function () {
        var instance = new LifeCycleWithCallLog();
        _container.mapInstance(LifeCycleWithCallLog, instance);
        _container.create(LifeCycleWithCallLog);

        assert.isTrue(instance.onCreateCalled);
        assert.isFalse(instance.onDestroyCalled);
    });

    it('create - should use loader to load type', function () {
        // mock dependency
        var dependency = function () {
        };

        var calledName = null;
        var loader = function (name) {
            calledName = name;
            return dependency;
        };
        _container.setLoader(loader);
        var result = _container.create(OneUndefinedDependency);

        assert.equal(calledName, OneUndefinedDependency.prototype.dependencyName);
        assert.instanceOf(result, OneUndefinedDependency);
        assert.instanceOf(result.dependency, dependency);
    });

    it('create - should throw if loader throws', function () {
        _container.setLoader(function () {
            throw new Error('This is a fake error from the loader');
        });

        throwsContainerError(function () {
            _container.create(OneUndefinedDependency);
        });
    });

    it('create - should be able to resolve container dependency', function () {
        var result = _container.create(DependsOnContainer);

        assert.instanceOf(result, DependsOnContainer);
        assert.strictEqual(result.container, _container);
    });

    //--------------------------------------------------------------------------
    // TEST CASES: GET
    //--------------------------------------------------------------------------

    it('get - should throw if type invalid', function () {
        testInvalidTypes(function (type) {
            _container.get(type);
        });
    });

    it('get - should throw if circular dependency on self', function () {
        throwsContainerError(function () {
            _container.get(CircularSelf);
        });
    });

    it('get - should throw if simple A > B > A circular dependency', function () {
        throwsContainerError(function () {
            _container.get(CircularSimpleA);
        });
    });

    it('get - should throw if complex circular dependency with mappings', function () {
        _container.mapType(CircularComplexBase, CircularComplexB);
        _container.mapFactory(CircularComplexC, function (container) {
            return new CircularComplexC(container.get(CircularComplexA));
        });

        throwsContainerError(function () {
            _container.get(CircularComplexA);
        });
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

    it('get - container should return container', function () {
        var result = _container.get(Container);

        assert.strictEqual(result, _container);
    });

    it('get - should return complex mapped types as expected', function () {
        _container.mapType(D, E);
        _container.mapType(C, D);
        _container.mapType(B, C);
        _container.mapType(A, B);
        var d = _container.get(D);
        var c = _container.get(C);
        var b = _container.get(B);
        var a = _container.get(A);

        assert.strictEqual(d, c);
        assert.strictEqual(c, b);
        assert.strictEqual(b, a);
    });

    it('get - should return expected for different classes with same name', function () {
        var result1 = _container.get(A.Foo);
        var result2 = _container.get(B.Foo);

        assert.notEqual(result2, result1);
        assert.notStrictEqual(result2, result1);
    });

    it('get - should return expected for differently mapped classes with same name', function () {
        var a = new A.Foo();
        var b = new B.Foo();
        _container.mapInstance(A.Foo, a);
        _container.mapInstance(B.Foo, b);
        var result1 = _container.get(A.Foo);
        var result2 = _container.get(B.Foo);

        assert.notEqual(result2, result1);
        assert.notStrictEqual(result2, result1);
    });

    //--------------------------------------------------------------------------
    // TEST CASES: HAS
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
    // TEST CASES: MAP FACTORY
    //--------------------------------------------------------------------------

    it('mapFactory - should throw if type invalid', function () {
        testInvalidTypes(function (type) {
            _container.mapFactory(type, null);
        });
    });

    it('mapFactory - should throw if a mapping for type already exists', function () {
        _container.get(NoParamConstructor);
        var factory = function () {
            return new NoParamConstructor();
        };

        throwsContainerError(function () {
            _container.mapFactory(NoParamConstructor, factory);
        });
    });

    it('mapFactory - should throw if factory not a function', function () {
        throwsContainerError(function () {
            _container.mapFactory(NoParamConstructor, 123);
        });
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
            return new NoParamConstructor();
        };
        _container.mapFactory(NoParamConstructor, factory);
        _container.get(NoParamConstructor);

        assert.strictEqual(c, _container);
    });

    //--------------------------------------------------------------------------
    // TEST CASES: MAP INSTANCE
    //--------------------------------------------------------------------------

    it('mapInstance - should throw if type invalid', function () {
        testInvalidTypes(function (type) {
            _container.mapInstance(type, null);
        });
    });

    it('mapInstance - should throw if value not an object', function () {
        throwsContainerError(function () {
            _container.mapInstance(NoParamConstructor, 123);
        });
    });

    it('mapInstance - should throw if a mapping for type already exists', function () {
        _container.get(NoParamConstructor);

        throwsContainerError(function () {
            _container.mapInstance(NoParamConstructor, new NoParamConstructor());
        });
    });

    it('mapInstance - should throw if not an instance of type', function () {
        throwsContainerError(function () {
            _container.mapInstance(NoParamConstructor, {});
        });
    });

    it('mapInstance - should store specific instance', function () {
        var instance = new NoParamConstructor();
        _container.mapInstance(NoParamConstructor, instance);
        var result = _container.get(NoParamConstructor);

        assert.strictEqual(result, instance);
    });

    it('mapInstance - should accept implementation', function () {
        var instance = new NoParamConstructor();
        _container.mapInstance(Base, instance);
        var result = _container.get(Base);

        assert.strictEqual(result, instance);
    });

    //--------------------------------------------------------------------------
    // TEST CASES: MAP TYPE
    //--------------------------------------------------------------------------

    it('mapType - should throw if type invalid', function () {
        testInvalidTypes(function (type) {
            _container.mapType(type, null);
        });
    });

    it('mapType - should throw if subType not a function', function () {
        throwsContainerError(function () {
            _container.mapType(Base, null);
        });
    });

    it('mapType - should throw if a mapping for type already exists', function () {
        _container.get(Base);

        throwsContainerError(function () {
            _container.mapType(Base, NoParamConstructor);
        });
    });

    it('mapType - should throw if subType does not extend type', function () {
        throwsContainerError(function () {
            _container.mapType(Base, Object);
        });
    });

    it('mapType - should throw if subType same as type', function () {
        throwsContainerError(function () {
            _container.mapType(Base, Base);
        });
    });

    it('mapType - should map type to subType', function () {
        _container.mapType(Base, NoParamConstructor);
        var result = _container.get(Base);

        assert.instanceOf(result, NoParamConstructor);
    });

    it('mapType - should allow mapping to another mapping', function () {
        _container.mapType(NoParamConstructor, ExtendedNoParamConstructor);
        _container.mapType(Base, NoParamConstructor);
        var result1 = _container.get(NoParamConstructor);
        var result2 = _container.get(Base);

        assert.strictEqual(result2, result1);
    });

    //--------------------------------------------------------------------------
    // TEST CASES: REMOVE
    //--------------------------------------------------------------------------

    it('remove - should throw if invalid type', function () {
        testInvalidTypes(function (type) {
            _container.remove(type);
        });
    });

    it('remove - should throw if container', function () {
        throwsContainerError(function () {
            _container.remove(Container);
        });
    });

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

    it('remove - should remove top of complex mapped types when removing top', function () {
        _container.mapType(D, E);
        _container.mapType(C, D);
        _container.mapType(B, C);
        _container.mapType(A, B);

        _container.remove(A);

        assert.isTrue(_container.has(D), 'has D');
        assert.isTrue(_container.has(C), 'has C');
        assert.isTrue(_container.has(B), 'has B');
        assert.isFalse(_container.has(A), 'NOT has A');
    });

    it('remove - should remove all of complex mapped types when removing bottom', function () {
        _container.mapType(D, E);
        _container.mapType(C, D);
        _container.mapType(B, C);
        _container.mapType(A, B);

        _container.remove(D);

        assert.isFalse(_container.has(D), 'NOT has D');
        assert.isFalse(_container.has(C), 'NOT has C');
        assert.isFalse(_container.has(B), 'NOT has B');
        assert.isFalse(_container.has(A), 'NOT has A');
    });

    it('remove - should call lifecycle destroy', function () {
        var result = _container.get(LifeCycleWithCallLog);
        _container.remove(LifeCycleWithCallLog);

        assert.isTrue(result.onCreateCalled);
        assert.isTrue(result.onDestroyCalled);
    });

    //--------------------------------------------------------------------------
    // TEST CASES: RESET
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

    it('reset - should re-initialize container', function () {
        _container.reset();

        var result = _container.get(Container);

        assert.strictEqual(result, _container);
    });

    it('reset - should call lifecycle destroy', function () {
        var result = _container.get(LifeCycleWithCallLog);
        _container.reset();

        assert.isTrue(result.onCreateCalled);
        assert.isTrue(result.onDestroyCalled);
    });

    //--------------------------------------------------------------------------
    // TEST CASES: SET LOADER
    //--------------------------------------------------------------------------

    it('setLoader - should throw if not a valid function', function () {
        throwsContainerError(function () {
            _container.setLoader(null);
        });
        throwsContainerError(function () {
            _container.setLoader('assert');
        });
    });

    it('setLoader - should accept function', function () {
        var loader = function () {
        };

        var test = function () {
            _container.setLoader(loader);
        };

        assert.doesNotThrow(test, ContainerError);
    });

    //--------------------------------------------------------------------------
    // TEST CASES: GET DEFAULT
    //--------------------------------------------------------------------------

    it('getDefault - should return same instance', function () {
        var result1 = Container.getDefault();
        var result2 = Container.getDefault();

        assert.strictEqual(result1, result2);
    });

    //--------------------------------------------------------------------------
    // HELPER VALUES
    //--------------------------------------------------------------------------

    var invalidTypes = [undefined, null, true, 123, 'abc', [], new Object(),
        Function, Error, new Error, ContainerError, Container, new Container];

    //--------------------------------------------------------------------------
    // HELPER METHODS
    //--------------------------------------------------------------------------

    /**
     * @param {Function} subject
     * @param {Boolean} testContainer Should we also test for the Container type?
     */
    function testInvalidTypes(subject, testContainer) {
        for (var i = 0; i < invalidTypes.length; i++) {
            var type = invalidTypes[i];

            if (!testContainer && (type === Container || type instanceof Container)) {
                continue;
            }

            throwsContainerError(function () {
                try {
                    subject(type);
                } catch (e) {
                    assert.match(e.message, /Type \[[\w ]+\] is invalid, because it/i);
                    throw e;
                }
            });
        }
    }

    /**
     * @param {Function} test
     */
    function throwsContainerError(test) {
        assert.throws(test, ContainerError);
    }

});

//------------------------------------------------------------------------------
// FIXTURES
//------------------------------------------------------------------------------

// base class to test subclassing
function Base() {
}
Base.prototype.name = 'Base';

// class with a constructor without parameters
function NoParamConstructor() {
}
NoParamConstructor.prototype = Object.create(Base.prototype);
NoParamConstructor.prototype.name = 'NoParamConstructor';

// extended class to test mapping a type to another mapping
function ExtendedNoParamConstructor() {
}
ExtendedNoParamConstructor.prototype = Object.create(NoParamConstructor.prototype);
ExtendedNoParamConstructor.prototype.name = 'ExtendedNoParamConstructor';

// type that depends on non-existing dependency
function OneUndefinedDependency(UndefinedDependency) {
    this.dependency = UndefinedDependency;
}
OneUndefinedDependency.prototype.dependencyName = 'UndefinedDependency';

// class with a constructor that has one parameter
function OneParamConstructor(NoParamConstructor) {
    this.param = NoParamConstructor;
}

// class with a dependency on the container
function DependsOnContainer(Container) {
    this.container = Container;
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

// extended inheritance tree to test mapping a type to another mapping
function A() {
}
function B() {
}
B.prototype = Object.create(A.prototype);
function C() {
}
C.prototype = Object.create(B.prototype);
function D() {
}
D.prototype = Object.create(C.prototype);
function E() {
}
E.prototype = Object.create(D.prototype);

// classes with same name, but different namespace
A.Foo = function () {
};
B.Foo = function () {
};

// lifecycle with log
function LifeCycleWithCallLog() {
    var _self = this;
    this.onCreateCalled = false;
    this.onDestroyCalled = false;

    this.onCreate = function () {
        _self.onCreateCalled = true;
    };

    this.onDestroy = function () {
        _self.onDestroyCalled = true;
    };
}
