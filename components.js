'use strict';

/* See http://atasteofsandwich.wordpress.com/2014/02/03/client-side-csv-download-with-angularjs/
 */
bsApp.directive('downloadBrs', function ($parse, bsClick, bsBlob, $log, $timeout, loadFile) {
    return {
        compile: function ($element, attr) {

            var type = attr.downloadBrs;

            return function (scope, element, attr) {

                element.on('click', function (event) {

                    var filename = "";
                    if (type === "remote") {
                        filename = "autorun-remote-template.brs";
                    } else {
                        filename = "autorun-manifest-template.brs";
                    }
                    var myPromise = loadFile.getData(filename);
                    myPromise.then(function (ret) {
                        var content = ret.data;
                        if (type === "remote") {
                            content = content.replace(/{{remoteUrl}}/, scope.remoteUrl);
                        } else {
                            var myUrlPrefixIndex = scope.localUrl.lastIndexOf('/') + 1;
                            var myUrl = scope.localUrl.substring(0, myUrlPrefixIndex);
                            var myManifest = scope.localUrl.substring(myUrlPrefixIndex, scope.localUrl.length);
                            content = content.replace(/{{myUrl}}/, myUrl);
                            content = content.replace(/{{myManifest}}/, myManifest);
                        }

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
                });
            };
        }
    };
});
