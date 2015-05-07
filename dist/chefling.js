(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module unless amdModuleId is set
    define([], function () {
      return (root['chefling'] = factory());
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    root['chefling'] = factory();
  }
}(this, function () {

"use strict";

/**
 * A key - value map implementation. This, in contrast to Object, allows the key
 * to be any value, such as objects.
 *
 * @version 0.2.0
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

/* global Error, Function, window */

"use strict";

/**
 * A dependency injection container that maps types (functions) to instances
 * (objects). It resolves a type's full dependency tree using constructor
 * injection.
 *
 * @version 0.2.0
 */
function Container() {

    //--------------------------------------------------------------------------
    // PRIVATE CONSTANTS
    //--------------------------------------------------------------------------

    /**
     * Regular expressions for extracting function parameters. Inspired by
     * Angular.
     */
    var FN_ARGS = /^function[^\(]*\(([^\)]*)\)/m;
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    var STRIP_WHITESPACE = /\s/mg;

    //--------------------------------------------------------------------------
    // PRIVATE PROPERTIES
    //--------------------------------------------------------------------------

    /**
     * Reference to the current instance, to prevent scoping issues.
     *
     * @type Container
     */
    var _self = this;

    /**
     * Temporary 'log' of the types that are in the process of being resolved.
     * After the type is successfully resolved, the entry is removed. This is
     * used to detect circular dependencies.
     *
     * @type Array
     */
    var _currentlyResolving;

    /**
     * Stores created instances, where the key is the type (Function) and the
     * value is the instance (Object). This instance is returned the next time
     * the type is requested.
     *
     * @type HashMap
     */
    var _instances;

    /**
     * Stores type mappings, where the key is the type and the value is the
     * mapping provided by the `map...` methods.
     *
     * @type HashMap
     */
    var _mappings;

    //--------------------------------------------------------------------------
    // CONSTRUCTOR
    //--------------------------------------------------------------------------

    initialize();

    //--------------------------------------------------------------------------
    // PUBLIC METHODS
    //--------------------------------------------------------------------------

    /**
     * Creates a new instance of `type`, attempting to resolve its full
     * dependency tree. The instance is not stored (that's what `get()` is for),
     * so only use this method directly when you need a NEW instance. It uses
     * the type mappings (from the `map...` methods) to create the instance. If
     * no mapping is available, it attempts to resolve the dependencies by
     * inspecting the constructor parameters. If the type has an `onCreate()`
     * method, the Container will call this method after creation.
     *
     * @param {Function} type The type to instantiate.
     * @returns {Object} The created instance.
     * @throws {ContainerError} When the type can not be instantiated, for
     * example when its constructor arguments are not resolvable by the
     * Container.
     */
    this.create = function (type) {
        isValidType(type);

        var instance;
        var mapping = _mappings.get(type);

        if (!mapping) {
            // no mapping for type: create an instance of it
            instance = createInstance(type);
        } else if (mapping instanceof type) {
            // mapping is the instance
            instance = mapping;
        } else if (isFunction(mapping)) {
            if (isSubType(type, mapping)) {
                // mapping is sub type, use that type to create the instance
                instance = _self.create(mapping);
            } else {
                // mapping is factory, use it to create the instance
                instance = resolveUsingFactory(type, mapping);
            }
        }

        if (!instance) {
            throw new ContainerError('Could not create an instance for type ' +
                    type.name);
        } else if (isFunction(instance.onCreate)) {
            // instance has an onCreate method: call it
            instance.onCreate();
        }

        return instance;
    };

    /**
     * Returns an instance of `type`. If a previously stored instance exists, it
     * will always return that same instance. If there is no stored instance, it
     * will create a new one using `create()`, and store and return that.
     *
     * @param {Function} type The type to retrieve.
     * @returns {Object} Stored instance of `type`.
     * @throws {ContainerError} When the instance can not be created, a
     * circular dependency is detected or `type` is invalid.
     */
    this.get = function (type) {
        var instance = _instances.get(type);

        if (instance) {
            // previously created instance: return it
            return instance;
        }

        isValidType(type);

        var mapping = _mappings.get(type);

        if (isSubType(type, mapping)) {
            // mapping is sub type: use that type to retrieve the instance
            return _self.get(mapping);
        }

        // if type is in the process of being resolved, it indicates a circular
        // dependency
        if (_currentlyResolving.indexOf(type) >= 0) {
            throw new ContainerError('Circular dependency detected: ' +
                    type.name);
        } else {
            // add type to currently resolving list
            _currentlyResolving.push(type);
        }

        try {
            // create a new instance of type
            instance = _self.create(type);
        } finally {
            // type is resolved: remove it from currently resolving list
            _currentlyResolving.splice(_currentlyResolving.indexOf(type), 1);
        }

        // store created instance
        _instances.set(type, instance);

        return instance;
    };

    /**
     * Returns whether a stored instance or mapping (from the `map...` methods)
     * exists for `type`.
     *
     * @param {Function} type The type to check.
     * @returns {Boolean} Whether a stored instance or mapping exists for
     * `type`.
     */
    this.has = function (type) {
        return _instances.has(type) || _mappings.has(type);
    };

    /**
     * Map `type` to a factory (e.g. an anonymous function), which will create
     * an instance of `type` when it is requested (by `create()`). Which
     * specific instance will be created by the factory is up to the developer.
     * The return value is validated by the Container: if `null` or another
     * unexpected value is returned, an exception will be thrown. If a mapping
     * for `type` already exists when this method is called, an exception will
     * be thrown.
     *
     * @param {Function} type The type that will be created by the factory.
     * @param {Function} factory The function that will create the instance.
     * @throws {ContainerError} When `factory` is not a Function, or `type` is
     * invalid.
     */
    this.mapFactory = function (type, factory) {
        isValidType(type);

        if (!isFunction(factory)) {
            throw new ContainerError('Factory is not a function');
        }

        addMapping(type, factory);
    };

    /**
     * Map `type` to a specific instance, which will be returned when `type` is
     * requested. This is useful when `type` has dependencies (constructor
     * parameters) that are not resolvable by the Container (e.g. a string or
     * boolean value). This instance will be processed by `create()`, to make
     * sure the object is properly initialized. If a mapping for `type` already
     * exists when this method is called, an exception will be thrown.
     *
     * @param {Function} type The type you want to store the instance of.
     * @param {Object} instance The instance you want to store.
     * @throws {ContainerError} When the value for `instance` is not an actual
     * instance of `type`, or `type` is invalid.
     */
    this.mapInstance = function (type, instance) {
        isValidType(type);

        if (!instance || typeof instance !== 'object') {
            throw new ContainerError('`instance` is not an object');
        } else if (!(instance instanceof type)) {
            throw new ContainerError('Value is not an instance of `type`');
        }

        addMapping(type, instance);
    };

    /**
     * Map `type` to a `subType`. This makes it possible to set a specific
     * implementation of `type` (a function that extends it). When `type` is
     * requested an instance of `subType` will be created. If a mapping for
     * `type` already exists when this method is called, an exception will be
     * thrown.
     *
     * @param {Function} type The base type that is used when requesting an
     * instance.
     * @param {Function} subType The type that extends the base type, which is
     * actually created.
     * @throws {ContainerError} When `subType` does not extend `type`, or one of
     * the values is invalid.
     */
    this.mapType = function (type, subType) {
        isValidType(type);

        if (!isFunction(subType)) {
            throw new ContainerError('`subType` is not a function');
        } else if (!isSubType(type, subType)) {
            throw new ContainerError('`subType` does not extend `type`');
        }

        addMapping(type, subType);
    };

    /**
     * Removes a stored instance and/or mapping for `type`. If an instance
     * exists and it has an `onDestroy` method, it will be called by the
     * Container.
     *
     * @param {Function} type The type to remove the instance / mapping for.
     * @throws {ContainerError} When it is not allowed to remove the instance /
     * mapping for `type`.
     */
    this.remove = function (type) {
        isValidType(type);

        if (type === Container) {
            throw new ContainerError('Container instance can not be removed');
        }

        // call life cycle destroy method
        lifeCycleDestroy(_instances.get(type));

        _instances.remove(type);
        _mappings.remove(type);

        // other mappings can have this type as a value (through `mapType()`)
        var toRemove = _mappings.getKeysForValue(type);

        // call `remove()` for other mappings
        for (var i = 0, len = toRemove.length; i < len; ++i) {
            _self.remove(toRemove[i]);
        }
    };

    /**
     * Removes all stored instances and mappings. Use this method to clean up
     * the Container in your application's destroy procedure. For every instance
     * that has a `onDestroy` method, the Container will call that method.
     */
    this.reset = function () {
        var instances = _instances.getValues();

        // call life cycle destroy for existing instances
        for (var i = 0, len = instances.length; i < len; ++i) {
            lifeCycleDestroy(instances[i]);
        }

        // clear existing lists
        _currentlyResolving = _instances = _mappings = null;

        initialize();
    };

    //--------------------------------------------------------------------------
    // PRIVATE METHODS
    //--------------------------------------------------------------------------

    /**
     * Initialize the Container.
     */
    function initialize() {
        // create storage maps
        _currentlyResolving = new Array();
        _instances = new HashMap();
        _mappings = new HashMap();

        // set pre-defined, 'protected' instances
        _instances.set(Container, _self);
    }

    /**
     * Add a mapping for `type`.
     *
     * @param {Function} type
     * @param {Function|Object} value
     * @throws {Container} When a mapping for `type` already exists.
     */
    function addMapping(type, value) {
        if (_self.has(type)) {
            throw new ContainerError('A mapping for `type` already exists');
        }

        _mappings.set(type, value);
    }

    /**
     * Create an instance of `type`, resolving its constructor parameters.
     *
     * @param {Function} type
     * @returns {Object}
     */
    function createInstance(type) {
        // no constructor parameters? create the instance directly.
        if (type.length === 0) {
            return new type;
        }

        var factory, i, instance, len, param;
        var args = [null];

        // extract the constructor parameters (array of strings)
        var params = type.toString() // convert constructor to string
                .match(FN_ARGS)[1] // get the first function arguments string
                .replace(STRIP_COMMENTS, '') // strip comments
                .replace(STRIP_WHITESPACE, '') // strip whitespace
                .split(','); // extract the individual arguments

        // gather all values to pass to the constructor
        for (i = 0, len = params.length; i < len; ++i) {
            param = asFunction(params[i]);
            instance = _self.get(param);
            args.push(instance);
        }

        // a factory method that will create the instance
        factory = type.bind.apply(type, args);

        return new factory();
    }

    /**
     * Use a factory function to create the instance.
     *
     * @param {Function} type
     * @param {Function} factory
     * @returns {Object}
     * @throws {ContainerError} When the value returned by the factory is not an
     * instance of `type`.
     */
    function resolveUsingFactory(type, factory) {
        var instance = factory(_self);

        if (!instance) {
            throw new ContainerError('Factory returned an empty value');
        } else if (!(instance instanceof type)) {
            throw new ContainerError('Factory returned an unexpected value');
        }

        return instance;
    }

    /**
     * If the object has an `onDestroy` method, call it.
     *
     * @param {Object} instance
     */
    function lifeCycleDestroy(instance) {
        if (instance && instance.onDestroy) {
            instance.onDestroy();
        }
    }

    /**
     * If `value` is the name (String) of an existing Function, return the
     * Function.
     *
     * @param {Function|String} value
     * @returns {Function}
     * @throws {ContainerError} When `value` is not a Function object or name of
     * a Function.
     */
    function asFunction(value) {
        if (isFunction(value)) {
            return value;
        }

        // is `value` the name of a function? return the function
        if (isFunction(window[value])) {
            return window[value];
        }

        throw new ContainerError('Value \'' + value + '\' (' + typeof value +
                ') is not a function');
    }

    /**
     * Returns whether `value` is a Function object.
     *
     * @param {*} value
     * @returns {Boolean}
     */
    function isFunction(value) {
        return value && typeof value === 'function';
    }

    /**
     * Returns whether `subType` is a Function that extends `type`.
     *
     * @param {Function} type
     * @param {Function} subType
     * @returns {Boolean}
     */
    function isSubType(type, subType) {
        return type && subType && subType.prototype instanceof type;
    }

    /**
     * Returns whether `value` extends `type` or is an instance of it.
     *
     * @param {Function} type
     * @param {Function|Object} value
     * @returns {Boolean}
     */
    function isTypeOrInstance(type, value) {
        return value === type ||
                isSubType(type, value) ||
                value instanceof type;
    }

    /**
     * Returns whether `value` is a Function that is allowed to be used.
     *
     * @param {*} value
     * @throws {ContainerError} When the type is invalid.
     */
    function isValidType(value) {
        var error = null;
        var type = typeof value;

        if (!value) {
            error = 'empty';
        } else if (!isFunction(value)) {
            error = 'not a function';
        } else if (value === Function) {
            error = 'the base Function type';
        } else if (isTypeOrInstance(Error, value)) {
            error = 'an Error type';
        } else if (isTypeOrInstance(Container, value)) {
            error = 'a Container type';
        }

        if (error) {
            var valueName = value;

            if (value) {
                if (Array.isArray(value)) {
                    valueName = 'Array';
                } else if (value.name) {
                    // value is an object
                    valueName = value.name;
                } else {
                    // use the type of the value as its name
                    valueName = type.charAt(0).toUpperCase() + type.slice(1);
                }
            }

            throw new ContainerError('Type [' + valueName +
                    '] is invalid, because it is ' + error);
        }
    }

}

/**
 * Convenience singleton access to Container. If you use this method in one
 * place, you need to use it everywhere, otherwise you will still get different
 * Container instances.
 *
 * @returns {Container}
 */
Container.getDefault = function () {
    if (!Container.prototype._defaultInstance) {
        Container.prototype._defaultInstance = new Container();
    }

    return Container.prototype._defaultInstance;
};

/**
 * A concrete Error implementation that is used by the Container.
 *
 * @param {String} message
 */
function ContainerError(message) {

    this.message = message;

    if (Error.captureStackTrace) {
        Error.captureStackTrace(this, ContainerError);
    } else {
        this.stack = (new Error).stack || '';
    }

}

// extend the default Error function
ContainerError.prototype = Object.create(Error.prototype);
ContainerError.prototype.name = 'ContainerError';

/**
 * Creates a default instance, so it can be returned.
 *
 * @version 0.2.0
 */
var chefling = Container.getDefault();

return chefling;

}));
