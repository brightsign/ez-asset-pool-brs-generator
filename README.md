ez-asset-pool-brs-generator
===========================

This project is intended to provide the easiest way possible for a customer who has a website and a BrightSign player,
and wants to get their website displayed on the player, without learning BrightAuthor or BrightScript, and without
requiring an account on BSN.

This project generates two different types of custom autorun applications: 

One flavour simply pulls the content on
demand from the website. This means that if the network connection goes down, the sign will stop playing. However, it
is the easiest possible deployment option.

The second flavour requires the presence of a manifest file on the server, which is a flat file that lists all assets
on the site, one asset per line. The entries can be relative or absolute urls. The generated autorun will parse the 
manifest, create a sync spec, create an asset pool, and download the files to the asset pool. It will then fire up the
web page. It also updates the content every 24 hours.

Each autorun is in its own template file. The javascript uses (moustache / ember / handlebars / angularjs) style curly 
braces to do substitution of the parameters entered by the user in the template.

The site is styled using bootstrap css.

Note: this is a demo. It is not very robust if the network connection goes down when assets are being downloaded.
Note: we do not support all features of the w3c manifest. Here is an example of what is supported:
 
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

