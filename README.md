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

      grunt build-browser-lib

This will generate the correct browser(ified) version of the source in the lib folder



Usage with webpack
------------------

  just require / import the library (correctly points to ctm-parser.js)