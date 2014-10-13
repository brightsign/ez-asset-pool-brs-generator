ez-asset-pool-brs-generator
===========================

This project is intended to provide the easiest way possible for a customer who has a website and a BrightSign player,
and wants to get their website displayed on the player, without learning BrightAuthor or BrightScript, and without
requiring an account on BSN.

This solution requires the presence of a manifest file on the server, which is a flat file that lists all assets
on the site, one asset per line. The entries can be relative or absolute urls. The generated autorun will parse the 
manifest, create a sync spec, create an asset pool, and download the files to the asset pool. It will then fire up the
web page. It also updates the content every 24 hours.

Note: we do not support all features of the w3c manifest. Here is an example of what is supported:

``` 
CACHE MANIFEST
#Version 1.0.8

CACHE:
angular.min.js
app.js
components.js
controllers.js
services.js
index.html
analog-clock.html
clock.jpg
```
