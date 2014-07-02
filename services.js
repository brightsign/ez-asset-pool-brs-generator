'use strict';

bsApp.factory('bsBlob', function () {
    return {
        toUrl: function (content) {
            var blob;
            blob = new Blob([content], {type: 'text/plain'});
            return (window.URL || window.webkitURL).createObjectURL(blob);
        },
        revoke: function (url) {
            return (window.URL || window.webkitURL).revokeObjectURL(url);
        }
    };
});

bsApp.factory('bsClick', function () {
    return {
        on: function (element) {
            var e = document.createEvent("MouseEvent");
            e.initMouseEvent("click", false, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            element.dispatchEvent(e);
        }
    };
});
bsApp.service('loadFile',
    function ($http) {
        this.getData = function (filename) {
            return $http({
                method: 'GET',
                url: filename
            })
        }
    }
);

