Container = function Container() {

    var _self = this;
    var _instances = {};
    var _mappings = {};

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

        return new type;
    };

    this.get = function (type) {
        if (_instances.hasOwnProperty(type)) {
            return _instances[type];
        }

        return _instances[type] = _self.create(type);
    };

    this.has = function (type) {
        return _instances.hasOwnProperty(type);
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
    };

    this.reset = function () {
        _instances = {};
    };

};
