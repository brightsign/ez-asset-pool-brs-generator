Sub Main()

    vm=CreateObject("roVideoMode")
    width=vm.GetResX()
    height=vm.GetResY()
    rect=CreateObject("roRectangle", 0, 0, width, height)
    htmlWidget = CreateObject("roHtmlWidget", rect)
    htmlWidget.EnableSecurity(false)
    htmlWidget.SetUrl("{{remoteUrl}}")
    htmlWidget.EnableJavascript(true)
    jsClasses = CreateObject("roAssociativeArray")
    jsClasses["*"] = [ "*" ]
    htmlWidget.AllowJavaScriptUrls(jsClasses)
    htmlWidget.Show()
    while true
        ' Do nothing
    end while

End Sub
