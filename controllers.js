bsApp.controller('bsController', function ($scope) {

    $scope.generateBrs = function (type) {
        var brs = "";
        if (type === "remote") {
            brs = "Sub Main()\n" +
            "	rect=CreateObject(\"roRectangle\", 0, 0, 1920, 1080)\n" +
            "	htmlWidget = CreateObject(\"roHtmlWidget\", rect)\n" +
            "	htmlWidget.EnableSecurity(false)\n" +
            "	htmlWidget.SetUrl(\"" + $scope.remoteUrl + "\")\n" +
            "	htmlWidget.EnableJavascript(true)\n" +
            "	htmlWidget.Show()\n" +
            "	while true\n" +
            "		' Do nothing\n" +
            "	end while\n" +
            "End Sub\n";
        }
        else {
            var myUrlPrefixIndex = $scope.localUrl.lastIndexOf('/')+1;
            var myUrl = $scope.localUrl.substring(0, myUrlPrefixIndex);
            var myManifest = $scope.localUrl.substring(myUrlPrefixIndex, $scope.localUrl.length);
            brs = "Sub Main()\n"+
            "\n"+
            "	' Start generated variables\n"+
            "	urlPrefix = \""+myUrl+"\"\n"+
            "	manifest = \""+myManifest+"\"\n"+
            "	filePath$ = \"index.html\"\n"+
            "	' End generated variables\n"+
            "	\n"+
            "	u=CreateObject(\"roUrlTransfer\")\n"+
            "	u.SetUrl(urlPrefix+manifest)\n"+
            "	u.GetToFile(\"manifest.mf\")\n"+
            "	manifest = ReadAsciiFile(\"manifest.mf\")\n"+
            "	print manifest\n"+
            "	r = CreateObject( \"roRegex\", \"$\", \"m\" )\n"+
            "	files = r.Split( manifest )\n"+
            "\n"+
            "	spec = BeginSpec()\n"+
            "\n"+
            "	for each file in files\n"+
            "	    f = file.Trim()\n"+
            "	    if len(f)>1\n"+
            "		    ignore = left(f,5)=\"CACHE\" or left(f,1)=\"#\" or left(f,7)=\"NETWORK\"\n"+
            "	   		if not(ignore)\n"+
            "				print \"<\";f;\">\"\n"+
            "				AddFile(spec, f, urlPrefix+f)\n"+
            "			endif\n"+
            "		endif\n"+
            "	next\n"+
            "\n"+
            "	EndSpec(spec)\n"+
            "\n"+
            "	assetObjects = DownloadAssets(spec, {})\n"+
            "\n"+
            "	rect=CreateObject(\"roRectangle\", 0, 0, 1920, 1080)\n"+
            "	htmlWidget = CreateObject(\"roHtmlWidget\", rect)\n"+
            "	htmlWidget.EnableSecurity(false)\n"+
            "	htmlWidget.EnableJavascript(true)\n"+
            "	prefix$ = \"\"\n"+
            "	htmlWidget.MapFilesFromAssetPool(assetObjects.pool, assetObjects.assetCollection, prefix$, \"/\")\n"+
            "	url$ = \"file:///\" + filePath$\n"+
            "	htmlWidget.SetUrl(url$)\n"+
            "	htmlWidget.Show()\n"+
            "\n"+
            "	while true\n"+
            "		' Do nothing\n"+
            "	end while\n"+
            "\n"+
            "End Sub\n"+
            "'''''''''''''''''''''''''''\n"+
            "Sub AddFile(spec as Object, name as String, link as String)\n"+
            "	spec.s = spec.s + \"  <download>\" + chr(13) + chr(10)\n"+
            "	spec.s = spec.s + \"   <name>\" + name + \"</name>\" + chr(13) + chr(10)\n"+
            "	spec.s = spec.s + \"   <link>\" + link.GetEntityEncode() + \"</link>\" + chr(13) + chr(10)\n"+
            "	spec.s = spec.s + \"  </download>\" + chr(13) + chr(10)\n"+
            "	spec.file_count = spec.file_count + 1\n"+
            "End Sub\n"+
            "'''''''''''''''''''''''''''\n"+
            "Function BeginSpec()\n"+
            "	s = \"\"\n"+
            "	s = s + \"<?xml version=\" + chr(34) + \"1.0\" + chr(34) + \" encoding=\" + chr(34) + \"UTF-8\" + chr(34) + \"?>\" + Chr(13) + Chr(10)\n"+
            "	s = s + \"<sync name=\" + chr(34) + \"Friendly name\" + chr(34) + \" version=\" + chr(34) + \"1.0\" + chr(34) + \">\" + chr(13) + chr(10)\n"+
            "	s = s + \" <files>\" + chr(13) + chr(10)\n"+
            "\n"+
            "	spec = {}\n"+
            "	spec.s = s\n"+
            "	spec.file_count = 0\n"+
            "	return spec\n"+
            "End Function\n"+
            "'''''''''''''''''''''''''''\n"+
            "Sub EndSpec(spec as Object)\n"+
            "	spec.s = spec.s + \" </files>\" + chr(13) + chr(10)\n"+
            "	spec.s = spec.s + \"</sync>\" + chr(13) + chr(10)\n"+
            "End Sub\n"+
            "'''''''''''''''''''''''''''\n"+
            "Function DownloadAssets(spec as Object, config as Object)\n"+
            "    POOL_EVENT_FILE_DOWNLOADED = 1\n"+
            "    POOL_EVENT_FILE_FAILED = -1\n"+
            "    POOL_EVENT_ALL_DOWNLOADED = 2\n"+
            "    POOL_EVENT_ALL_FAILED = -2\n"+
            "    \n"+
            "    sync_spec = CreateObject(\"roSyncSpec\")\n"+
            "    if not sync_spec.ReadFromString(spec.s) then\n"+
            "	stop\n"+
            "    end if\n"+
            "\n"+
            "    assetCollection = sync_spec.GetAssets(\"download\")\n"+
            "\n"+
            "    if not DeleteDirectory(\"pool\") then \n"+
            "	stop\n"+
            "    end if\n"+
            "\n"+
            "    if not CreateDirectory(\"pool\") then\n"+
            "	stop\n"+
            "    end if\n"+
            "\n"+
            "    pool = CreateObject(\"roAssetPool\", \"pool\")\n"+
            "    if type(pool) <> \"roAssetPool\" then\n"+
            "	stop\n"+
            "    end if\n"+
            "\n"+
            "    print \"Creating roAssetFetcher\"\n"+
            "    fetcher = CreateObject(\"roAssetFetcher\", pool)\n"+
            "    print \"Created roAssetFetcher \"; fetcher\n"+
            "    if type(fetcher) <> \"roAssetFetcher\" then\n"+
            "	stop\n"+
            "    end if\n"+
            "\n"+
            "    pool.ReserveMegabytes(1)\n"+
            "    fetcher.SetFileRetryCount(2)\n"+
            "    if not fetcher.SetFileProgressIntervalSeconds(1) then\n"+
            "	stop\n"+
            "    end if\n"+
            "\n"+
            "    if config.relative_link_prefix <> invalid then\n"+
            "	fetcher.SetRelativeLinkPrefix(config.relative_link_prefix)\n"+
            "    end if\n"+
            "\n"+
            "    if config.max_pool_size <> invalid then\n"+
            "	if not pool.SetMaximumPoolSizeMegabytes(config.max_pool_size) then\n"+
            "	    print pool.GetFailureReason()\n"+
            "	    stop\n"+
            "	end if\n"+
            "    end if\n"+
            "    \n"+
            "    mp = CreateObject(\"roMessagePort\")\n"+
            "    fetcher.SetPort(mp)\n"+
            "    \n"+
            "    files_downloaded = 0\n"+
            "    complete = false\n"+
            "\n"+
            "   	if not fetcher.AsyncDownload(assetCollection) then\n"+
            "	    print \"AsyncDownload failed: \"; pool.GetFailureReason()\n"+
            "	    stop\n"+
            "	end if\n"+
            "\n"+
            "    while not complete\n"+
            "	ev = wait(0, mp)\n"+
            "	if type(ev) = \"roAssetFetcherEvent\" then\n"+
            "	    if ev.GetEvent() = POOL_EVENT_FILE_DOWNLOADED then\n"+
            "			print \"File: \"; ev.GetName(); \" downloaded \"; ev.GetResponseCode()\n"+
            "			files_downloaded = files_downloaded + 1\n"+
            "	    else if ev.GetEvent() = POOL_EVENT_FILE_FAILED then\n"+
            "	        if not config[\"expect_fail_\" + ev.GetName()] <> invalid then\n"+
            "		    	print \"File: \"; ev.GetName(); \" failed \"; ev.GetResponseCode(); \" \"; ev.GetFailureReason()\n"+
            "		    	stop\n"+
            "			end if\n"+
            "	    else if ev.GetEvent() = POOL_EVENT_ALL_DOWNLOADED then\n"+
            "	        print \"Pool download reported complete\"\n"+
            "			complete = true\n"+
            "	    else if ev.GetEvent() = POOL_EVENT_ALL_FAILED then\n"+
            "		    print \"Pool download failed\"\n"+
            "		    stop\n"+
            "	    else\n"+
            "	        print \"Unknown event code\"\n"+
            "			stop\n"+
            "	    end if\n"+
            "	else if type(ev) = \"roAssetFetcherProgressEvent\" then\n"+
            "	    print \"Progress: \"; ev.GetFileIndex()+1; \"/\"; ev.GetFileCount(); \" \"; ev.GetFileName()\n"+
            "	else\n"+
            "	    print \"Unknown event: \"; type(ev)\n"+
            "	    stop\n"+
            "	end if\n"+
            "    endwhile\n"+
            "\n"+
            "    if config.download_count <> invalid then\n"+
            "		expected_download_count = config.download_count\n"+
            "    else\n"+
            "        expected_download_count = spec.file_count\n"+
            "    end if\n"+
            "	\n"+
            "    if files_downloaded <> expected_download_count then \n"+
            "		print files_downloaded\n"+
            "		print expected_download_count\n"+
            "	stop\n"+
            "    end if\n"+
            "	\n"+
            "    ret = CreateObject(\"roAssociativeArray\")\n"+
            "	ret.pool = pool\n"+
            "	ret.assetCollection = assetCollection \n"+
            "	return ret\n"+
            "\n"+
            "End Function";
        }
        return brs;
    }
});
