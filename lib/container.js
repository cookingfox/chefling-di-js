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

    //--------------------------------------------------------------------------
    // PUBLIC METHODS
    //--------------------------------------------------------------------------

    this.create = function (type) {
        var mapping = _mappings[type];

        if (mapping instanceof type) {
            return mapping;
        } else if (mapping instanceof Function) {
            if (mapping.prototype instanceof type) {
                // mapping is subclass
                return _self.create(mapping);
            } else {
                // mapping is factory
                return mapping(this);
            }
        }

        return createInstance(type);
    };

    this.get = function (type) {
        var instance = _instances[type];

        if (instance instanceof type) {
            return instance;
        }

        if (_currentlyResolving[type]) {
            throw new ContainerError('Circular dependency detected: ' + type.name);
        } else {
            _currentlyResolving[type] = true;
        }

        try {
            _instances[type] = instance = _self.create(type);
        } finally {
            delete _currentlyResolving[type];
        }

        return instance;
    };

    this.has = function (type) {
        return !!_instances[type] || !!_mappings[type];
    };

    this.mapFactory = function (type, factory) {
        if (!(factory instanceof Function)) {
            throw new ContainerError('Factory is not a function');
        }

        addMapping(type, factory);
    };

    this.mapInstance = function (type, instance) {
        if (!(instance instanceof type)) {
            throw new ContainerError('Value is not an instance of `type`');
        }

        addMapping(type, instance);
    };

    this.mapType = function (type, subType) {
        if (!(subType.prototype instanceof type)) {
            throw new ContainerError('`subType` does not extend `type`');
        }

        addMapping(type, subType);
    };

    this.remove = function (type) {
        delete _instances[type];
        delete _mappings[type];
    };

    this.reset = function () {
        _instances = _mappings = {};
    };

    //--------------------------------------------------------------------------
    // PRIVATE METHODS
    //--------------------------------------------------------------------------

    function addMapping(type, value) {
        if (_self.has(type)) {
            throw new ContainerError('A mapping for `type` already exists');
        }

        _mappings[type] = value;
    }

    function createInstance(type) {
        if (type.length === 0) {
            return new type;
        }

        var params = type.toString() // convert constructor to string
                .match(FN_ARGS)[1] // get the first function arguments string
                .replace(STRIP_COMMENTS, '') // strip comments
                .replace(STRIP_WHITESPACE, '') // strip whitespace
                .split(','); // extract the individual arguments

        var args = [],
                instance, p, param;

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

    function asFunction(value) {
        if (value instanceof Function) {
            return value;
        }

        if (window[value] instanceof Function) {
            return window[value];
        }

        throw new ContainerError('Value \'' + value + '\' (' + typeof value + ') is not a function');
    }

}

Container.getDefault = function () {
    if (!Container.prototype._defaultInstance) {
        Container.prototype._defaultInstance = new Container();
    }

    return Container.prototype._defaultInstance;
};

function ContainerError(message) {

    this.message = message;

    if (Error.captureStackTrace) {
        Error.captureStackTrace(this, ContainerError);
    } else {
        this.stack = (new Error).stack || '';
    }

}

ContainerError.prototype = Error.prototype;
ContainerError.prototype.name = 'ContainerError';
