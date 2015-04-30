/* global Function */

Container = function Container() {

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
                return mapping();
            }
        }

        return createInstance(type);
    };

    this.get = function (type) {
        if (_instances.hasOwnProperty(type)) {
            return _instances[type];
        }

        return _instances[type] = _self.create(type);
    };

    this.has = function (type) {
        return !!_instances[type] || !!_mappings[type];
    };

    this.mapFactory = function (type, factory) {
        _mappings[type] = factory;
    };

    this.mapInstance = function (type, instance) {
        _mappings[type] = instance;
    };

    this.mapType = function (type, subType) {
        _mappings[type] = subType;
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

        return factory(type, args);
    }

    /**
     * http://stackoverflow.com/a/1608546
     *
     * @param {Function} constructor
     * @param {Array} args
     * @returns {Object}
     */
    function factory(constructor, args) {
        function F() {
            return constructor.apply(this, args);
        }
        F.prototype = constructor.prototype;

        return new F();
    }

    function asFunction(value) {
        if (value instanceof Function) {
            return value;
        }

        if (window[value] instanceof Function) {
            return window[value];
        }

        // @todo: replace with custom exception
        throw new Error('Value \'' + value + '\' (' + typeof value + ') is not a function');
    }

};
