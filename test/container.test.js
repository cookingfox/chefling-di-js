/* global assert, Container */

describe('container', function () {

    //--------------------------------------------------------------------------
    // TEST SUITE
    //--------------------------------------------------------------------------

    var container = null;

    beforeEach(function () {
        container = new Container();
    });

    afterEach(function () {
        container = null;
    });

    it('should create a Container instance', function () {
        assert.instanceOf(container, Container);
    });

});
