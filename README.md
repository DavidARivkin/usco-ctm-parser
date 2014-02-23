ctm format parser for USCO project, based on THREE.js CTM parser

General information
-------------------
This repository contains both the:
- node.js version:
ctm-parser.js at the root of the project
- polymer.js/browser version which is a combo of
lib/ctm-parser.js (browserified version of the above)
ctm-parser.html


How to generate browser/polymer.js version (with require support):
------------------------------------------------------------------
Type: 

    browserify ctm-parser.js -r ./ctm-parser.js:ctm-parser -o lib/ctm-parser.js -x composite-detect -x three -x q -t workerify

then replace (manually for now) all following entries in the generated file:

  "composite-detect":"awZPbp","three":"Wor+Zu"

with the correct module names, ie:

   "composite-detect":"composite-detect","three":"three"
