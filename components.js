'use strict';

/* See http://atasteofsandwich.wordpress.com/2014/02/03/client-side-csv-download-with-angularjs/
 */
bsApp.directive('downloadBrs', function ($parse, bsClick, bsBlob, $log, $timeout, $q, loadFile, $http) {
    return {
        compile: function ($element, attr) {


            return function (scope, element, attr) {

                element.on('click', function (event) {

                    if (typeof scope.localUrl == "undefined") {
                        return;
                    }
                    validateManifestAndWriteAutorun(scope, element);
                });
            };
        }
    };
    function validateManifestAndWriteAutorun(scope, element) {

        scope.hasValidationError = false;
        var manifestUrl = scope.localUrl;
        var myUrlPrefixIndex = manifestUrl.lastIndexOf('/') + 1;
        var myUrl = manifestUrl.substring(0, myUrlPrefixIndex);
        scope.validationError = undefined;
        $http.get(manifestUrl).then(function (response) {
            processFiles(response, element);
        }, function (err) {
            scope.validationError = "Could not retrieve " + manifestUrl + ". Please check your manifest.";
            scope.hasValidationError = true;
        });

        function processFiles(response, element) {
            var data = response.data;
            var manifestContents = data.split('\n');
            var index = 0;
            createFilePromise(manifestContents, myUrl, index, element);
        }

        function createFilePromise(manifestContents, urlPrefix, index, element) {
            var manifestItem = manifestContents[index];
            if (manifestItem.indexOf("CACHE") == 0 || manifestItem.indexOf("NETWORK") == 0 || manifestItem.length == 0) {
                console.log("Skipping " + manifestItem);
                index = index + 1;
                if (index <= manifestContents.length - 1) {
                    createFilePromise(manifestContents, urlPrefix, index, element);
                }
                else {
                    writeAutorun(element);
                }
                return;
            }
            var url = urlPrefix + manifestItem;
            $http.get(url).then(function (response) {
                console.log("Successfully retrieved " + manifestItem);
                index = index + 1;
                if (index <= manifestContents.length - 1) {
                    createFilePromise(manifestContents, urlPrefix, index, element);
                }
                else {
                    writeAutorun(element);
                }
            }, function (err) {
                scope.validationError = "Could not retrieve " + url + ". Please check your manifest.";
                scope.hasValidationError = true;
            });
        }

        function writeAutorun(element) {

            console.log("Start writeAutorun ");

            var myUrlPrefixIndex = scope.localUrl.lastIndexOf('/') + 1;
            var myUrl = scope.localUrl.substring(0, myUrlPrefixIndex);
            var myManifest = scope.localUrl.substring(myUrlPrefixIndex, scope.localUrl.length);
            var filename = "autorun-manifest-template.brs";
            var loadPromise = loadFile.getData(filename);
            loadPromise.then(function (ret) {
                var content = ret.data;
                content = content.replace(/{{myUrl}}/, myUrl);
                content = content.replace(/{{myManifest}}/, myManifest);

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
        }
    }

});
