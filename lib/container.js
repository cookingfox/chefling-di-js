Container = function Container() {

    var _self = this;
    var _instances = {};

    this.create = function (type) {
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

    this.remove = function (type) {
        delete _instances[type];
    };

    this.reset = function () {
        _instances = {};
    };

};
