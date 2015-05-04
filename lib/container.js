/* global Error, Function */

"use strict";

function Container() {

    //--------------------------------------------------------------------------
    // PRIVATE CONSTANTS
    //--------------------------------------------------------------------------

    // stolen from Angular injector
    var FN_ARGS = /^function[^\(]*\(([^\)]*)\)/m;
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    var STRIP_WHITESPACE = /\s/mg;

    //--------------------------------------------------------------------------
    // CONSTRUCTOR
    //--------------------------------------------------------------------------

    var _self = this;
    var _currentlyResolving = {};
    var _instances = {};
    var _mappings = {};

    initialize();

    //--------------------------------------------------------------------------
    // PUBLIC METHODS
    //--------------------------------------------------------------------------

    /**
     * @param {Function} type
     * @returns {Object}
     * @throws {ContainerError}
     */
    this.create = function (type) {
        isValidType(type);

        var mapping = _mappings[type.name];

        if (mapping instanceof type) {
            // mapping is instance
            return mapping;
        } else if (isFunction(mapping)) {
            if (isSubType(type, mapping)) {
                // mapping is subclass
                return _self.create(mapping);
            } else {
                // mapping is factory
                return mapping(this);
            }
        }

        return createInstance(type);
    };

    /**
     * @param {Function} type
     * @returns {Object}
     * @throws {ContainerError}
     */
    this.get = function (type) {
        var instance = _instances[type];

        if (instance) {
            return instance;
        }

        isValidType(type);

        var mapping = _mappings[type.name];

        if (isSubType(type, mapping)) {
            return _self.get(mapping);
        }

        if (_currentlyResolving[type]) {
            throw new ContainerError('Circular dependency detected: ' + type.name);
        } else {
            _currentlyResolving[type] = true;
        }

        try {
            instance = _self.create(type);
        } finally {
            delete _currentlyResolving[type];
        }

        _instances[type] = instance;

        return instance;
    };

    /**
     * @param {Function} type
     * @returns {Boolean}
     */
    this.has = function (type) {
        return !!_instances[type] || !!_mappings[type.name];
    };

    /**
     * @param {Function} type
     * @param {Function} factory
     * @throws {ContainerError}
     */
    this.mapFactory = function (type, factory) {
        isValidType(type);

        if (!isFunction(factory)) {
            throw new ContainerError('Factory is not a function');
        }

        addMapping(type, factory);
    };

    /**
     * @param {Function} type
     * @param {Object} instance
     * @throws {ContainerError}
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
     * @param {Function} type
     * @param {Function} subType
     * @throws {ContainerError}
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
     * @param {Function} type
     */
    this.remove = function (type) {
        isValidType(type);

        if (type === Container) {
            throw new ContainerError('Container instance can not be removed');
        }

        delete _instances[type];
        delete _mappings[type.name];

        for (var t in _mappings) {
            if (_mappings[t] === type) {
                _self.remove(asFunction(t));
            }
        }
    };

    this.reset = function () {
        _instances = _mappings = {};

        initialize();
    };

    //--------------------------------------------------------------------------
    // PRIVATE METHODS
    //--------------------------------------------------------------------------

    function initialize() {
        _instances[Container] = _self;
    }

    /**
     * @param {Function} type
     * @param {Function|Object} value
     */
    function addMapping(type, value) {
        if (_self.has(type)) {
            throw new ContainerError('A mapping for `type` already exists');
        }

        _mappings[type.name] = value;
    }

    /**
     * @param {Function} type
     * @returns {Object}
     */
    function createInstance(type) {
        if (type.length === 0) {
            return new type;
        }

        var params = type.toString() // convert constructor to string
                .match(FN_ARGS)[1] // get the first function arguments string
                .replace(STRIP_COMMENTS, '') // strip comments
                .replace(STRIP_WHITESPACE, '') // strip whitespace
                .split(','); // extract the individual arguments

        var args = [];
        var instance, p, param;

        for (var p in params) {
            param = asFunction(params[p]);
            instance = _self.get(param);
            args.push(instance);
        }

        return newInstance(type, args);
    }

    /**
     * http://stackoverflow.com/a/14378462
     *
     * @param {Function} constructor
     * @param {Array} argArray
     * @returns {Object} Instance of `constructor`
     */
    function newInstance(constructor, argArray) {
        var args = [null].concat(argArray);
        var factoryFunction = constructor.bind.apply(constructor, args);

        return new factoryFunction();
    }

    /**
     * @param {*} value
     * @returns {Function}
     */
    function asFunction(value) {
        if (isFunction(value)) {
            return value;
        }

        if (isFunction(window[value])) {
            return window[value];
        }

        throw new ContainerError('Value \'' + value + '\' (' + typeof value +
                ') is not a function');
    }

    /**
     * @param {*} value
     * @returns {Boolean}
     */
    function isFunction(value) {
        return value && typeof value === 'function';
    }

    /**
     * @param {Function} type
     * @param {Function} subType
     * @returns {Boolean}
     */
    function isSubType(type, subType) {
        return type && subType && subType.prototype instanceof type;
    }

    function isTypeOrInstance(type, value) {
        return value === type ||
                isSubType(type, value) ||
                value instanceof type;
    }

    /**
     * @param {*} value
     * @throws {ContainerError} If the type is invalid
     */
    function isValidType(value) {
        var error = null;
        var valueType = typeof value;

        if (!value) {
            error = 'empty';
        } else if (!isFunction(value)) {
            error = 'not a function';
        } else if (value === Function) {
            error = 'the base Function type';
        } else if (isTypeOrInstance(Error, value)) {
            error = 'an Error type';
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
                    valueName = capitalize(valueType);
                }
            }

            throw new ContainerError('Type [' + valueName +
                    '] is invalid, because it is ' + error);
        }
    }

    /**
     * @param {String} value
     * @returns {String}
     */
    function capitalize(value) {
        return value.charAt(0).toUpperCase() + value.slice(1);
    }

}

/**
 * @returns {Container}
 */
Container.getDefault = function () {
    if (!Container.prototype._defaultInstance) {
        Container.prototype._defaultInstance = new Container();
    }

    return Container.prototype._defaultInstance;
};

/**
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

ContainerError.prototype = Object.create(Error.prototype);
ContainerError.prototype.name = 'ContainerError';
