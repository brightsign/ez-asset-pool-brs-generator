Sub Main()

	' Start custom variables
	urlPrefix$ = "http://10.1.0.141:1337/assets/"
	manifest$ = "manifest.mf"
	htmlFile$ = "index.html"
	updateIntervalInSeconds = 30
	' End custom variables
	
	htmlWidget = DownloadAssetsAndCreateHtmlWidget(urlPrefix$, manifest$, htmlFile$)

    mp = CreateObject("roMessagePort")
    timer = CreateObject("roTimer")
    timer.SetPort(mp)
    timer.SetElapsed(updateIntervalInSeconds, 0)
    print "Start at "; UpTime(0)
    timer.Start()

	while true
	  	ev = mp.WaitMessage(0)
      		if type(ev) = "roTimerEvent" then
          		print "Timer event received at "; UpTime(0)
	  		htmlWidget = DownloadAssetsAndCreateHtmlWidget(urlPrefix$, manifest$, htmlFile$)
          		timer.Start()
      		end if
	end while

End Sub
'''''''''''''''''''''''''''
Sub AddFile(spec as Object, name as String, link as String)
	spec.s = spec.s + "  <download>" + chr(13) + chr(10)
	spec.s = spec.s + "   <name>" + name + "</name>" + chr(13) + chr(10)
	spec.s = spec.s + "   <link>" + link.GetEntityEncode() + "</link>" + chr(13) + chr(10)
	spec.s = spec.s + "   <change_hint>" + Str(UpTime(0)) + "</change_hint>" + chr(13) + chr(10)
	spec.s = spec.s + "  </download>" + chr(13) + chr(10)
	spec.file_count = spec.file_count + 1
End Sub
'''''''''''''''''''''''''''
Function BeginSpec()
	s = ""
	s = s + "<?xml version=" + chr(34) + "1.0" + chr(34) + " encoding=" + chr(34) + "UTF-8" + chr(34) + "?>" + Chr(13) + Chr(10)
	s = s + "<sync name=" + chr(34) + "Friendly name" + chr(34) + " version=" + chr(34) + "1.0" + chr(34) + ">" + chr(13) + chr(10)
	s = s + " <files>" + chr(13) + chr(10)

	spec = {}
	spec.s = s
	spec.file_count = 0
	return spec
End Function
'''''''''''''''''''''''''''
Sub EndSpec(spec as Object)
	spec.s = spec.s + " </files>" + chr(13) + chr(10)
	spec.s = spec.s + "</sync>" + chr(13) + chr(10)
	WriteAsciiFile("syncspec.xml", spec.s)
End Sub
'''''''''''''''''''''''''''
Function DownloadAssets(spec as Object, config as Object)
    POOL_EVENT_FILE_DOWNLOADED = 1
    POOL_EVENT_FILE_FAILED = -1
    POOL_EVENT_ALL_DOWNLOADED = 2
    POOL_EVENT_ALL_FAILED = -2
    
    sync_spec = CreateObject("roSyncSpec")
    if not sync_spec.ReadFromString(spec.s) then
	stop
    end if

    assetCollection = sync_spec.GetAssets("download")

    CreateDirectory("pool")

    pool = CreateObject("roAssetPool", "pool")
    if type(pool) <> "roAssetPool" then
	stop
    end if

    fetcher = CreateObject("roAssetFetcher", pool)
    if type(fetcher) <> "roAssetFetcher" then
	stop
    end if

    pool.ReserveMegabytes(1)
    fetcher.SetFileRetryCount(2)
    if not fetcher.SetFileProgressIntervalSeconds(1) then
	stop
    end if

    if config.relative_link_prefix <> invalid then
	fetcher.SetRelativeLinkPrefix(config.relative_link_prefix)
    end if

    if config.max_pool_size <> invalid then
	if not pool.SetMaximumPoolSizeMegabytes(config.max_pool_size) then
	    print pool.GetFailureReason()
	    stop
	end if
    end if
    
    mp = CreateObject("roMessagePort")
    fetcher.SetPort(mp)
    
    files_downloaded = 0
    complete = false

   	if not fetcher.AsyncDownload(assetCollection) then
	    print "AsyncDownload failed: "; pool.GetFailureReason()
	    stop
	end if

    while not complete
	ev = wait(0, mp)
	if type(ev) = "roAssetFetcherEvent" then
	    if ev.GetEvent() = POOL_EVENT_FILE_DOWNLOADED then
			print "File: "; ev.GetName(); " downloaded "; ev.GetResponseCode()
			files_downloaded = files_downloaded + 1
	    else if ev.GetEvent() = POOL_EVENT_FILE_FAILED then
	        if not config["expect_fail_" + ev.GetName()] <> invalid then
		    	print "File: "; ev.GetName(); " failed "; ev.GetResponseCode(); " "; ev.GetFailureReason()
		    	stop
			end if
	    else if ev.GetEvent() = POOL_EVENT_ALL_DOWNLOADED then
	        print "Pool download reported complete"
			complete = true
	    else if ev.GetEvent() = POOL_EVENT_ALL_FAILED then
		    print "Pool download failed"
		    stop
	    else
	        print "Unknown event code"
			stop
	    end if
	else if type(ev) = "roAssetFetcherProgressEvent" then
	    print "Progress: "; ev.GetFileIndex()+1; "/"; ev.GetFileCount(); " "; ev.GetFileName()
	else
	    print "Unknown event: "; type(ev)
	    stop
	end if
    endwhile

    if config.download_count <> invalid then
		expected_download_count = config.download_count
    else
        expected_download_count = spec.file_count
    end if
	
    if files_downloaded <> expected_download_count then 
		print files_downloaded
		print expected_download_count
	stop
    end if
	
    ret = CreateObject("roAssociativeArray")
    ret.pool = pool
    ret.assetCollection = assetCollection 
    return ret

End Function
'''''''''''''''''''''''''''
Function CreateHtmlWidget(assetObjects as Object, htmlFile$ as String)

	rect=CreateObject("roRectangle", 0, 0, 1920, 1080)
	htmlWidget = CreateObject("roHtmlWidget", rect)
	htmlWidget.EnableSecurity(false)
	htmlWidget.EnableJavascript(true)
	prefix$ = ""
	htmlWidget.MapFilesFromAssetPool(assetObjects.pool, assetObjects.assetCollection, prefix$, "/")
	url$ = "file:///" + htmlFile$
	htmlWidget.SetUrl(url$)
	return htmlWidget

End Function
'''''''''''''''''''''''''''
Function CreateSpecAndDownloadAssets(urlPrefix$ as String, manifest$ as String, htmlFile$ as String)

	DeleteFile("manifest.mf")

	u=CreateObject("roUrlTransfer")

	u.SetUrl(urlPrefix$+manifest$)
	result = u.GetToFile("manifest.mf")
	if result <> 200 then
		assetObjects = GetAssetsFromDisk()
		return assetObjects 
	endif

	manifestFileAsString$ = ReadAsciiFile("manifest.mf")

	r = CreateObject( "roRegex", "$", "m" )
	files = r.Split( manifestFileAsString$ )

	spec = BeginSpec()

	for each file in files
	    f = file.Trim()
	    if len(f)>1
		    ignore = left(f,5)="CACHE" or left(f,1)="#" or left(f,7)="NETWORK"
	   		if not(ignore)
				AddFile(spec, f, urlPrefix$+f)
			endif
		endif
	next

	EndSpec(spec)

	assetObjects = DownloadAssets(spec, {})
	return assetObjects

End Function
'''''''''''''''''''''''''''
Function GetAssetsFromDisk()
	' Couldn't get manifest; see if the sync spec is on disk
	sync_spec = CreateObject("roSyncSpec")
	if not sync_spec.ReadFromFile("syncspec.xml") then
		print "Network error; no sync spec on disk"
		return invalid
	end if
	assetCollection = sync_spec.GetAssets("download")
	pool = CreateObject("roAssetPool", "pool")
	if type(pool) <> "roAssetPool" then
		print "Network error; no sync spec on disk"
		return invalid
	end if
	ret = CreateObject("roAssociativeArray")
	ret.pool = pool
	ret.assetCollection = assetCollection 
	print "Network error; found sync spec on disk"
	return ret
End Function
'''''''''''''''''''''''''''
Function DownloadAssetsAndCreateHtmlWidget(urlPrefix$ as String, manifest$ as String, htmlFile$ as String)

	assetObjects = CreateSpecAndDownloadAssets(urlPrefix$, manifest$, htmlFile$)
	if (assetObjects <> invalid)
		htmlWidget = CreateHtmlWidget(assetObjects, htmlFile$)
		htmlWidget.Show()
		return htmlWidget
	else
		print "Couldn't retrieve assets from network or disk. Please repair network connection and try again."
		return invalid
	endif

End Function
