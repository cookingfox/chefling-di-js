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

    it('has - should return false if no value', function () {
        var result = container.has(NoParameterConstructor);

        assert.isFalse(result);
    });

    it('has - should return false if no value', function () {
        container.get(NoParameterConstructor);
        var result = container.has(NoParameterConstructor);

        assert.isTrue(result);
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

    //--------------------------------------------------------------------------
    // RESET
    //--------------------------------------------------------------------------

    it('reset - should remove all stored values', function () {
        container.get(NoParameterConstructor);
        container.reset();

        var result = container.has(NoParameterConstructor);

        assert.isFalse(result);
    });

});

//------------------------------------------------------------------------------
// FIXTURES
//------------------------------------------------------------------------------

function NoParameterConstructor() {
}
