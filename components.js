'use strict';

/* See http://atasteofsandwich.wordpress.com/2014/02/03/client-side-csv-download-with-angularjs/
 */
bsApp.directive('downloadBrs', function ($parse, bsClick, bsBlob, $log, $timeout) {
    return {
        compile: function ($element, attr) {

            var generateBrsFn = $parse(attr.downloadBrs);

            return function (scope, element, attr) {

                element.on('click', function (event) {
                    var content = generateBrsFn(scope);
                    var title = "autorun.brs";

                    if (!(content != null)) {
                        $log.warn("Invalid content in download-brs : ", content);
                        return;
                    }

                    var url = bsBlob.toUrl(content);

                    element.append("<a download=\"" + title + "\" href=\"" + url + "\"></a>");
                    var a_href = element.find('a')[0];

                    bsClick.on(a_href);
                    $timeout(function () {
                        bsBlob.revoke(url);
                    });

                    element[0].removeChild(a_href);
                });
            };
        }
    };
});
