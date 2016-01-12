## Usco-ctm-parser

[![GitHub version](https://badge.fury.io/gh/usco%2Fusco-ctm-parser.svg)](https://badge.fury.io/gh/usco%2Fusco-ctm-parser)

ctm format parser for USCO project

originally based on THREE.js CTM parser, but rather extensively modified.
(not dependenant, or using three.js anymore)

Optimized for speed in the browser (webworkers etc)



## General information

  - returns raw buffer data wrapped in an RxJs observable (soon to be most.js)
  - useable both on Node.js & client side 


## Usage 

  
          import parse,  {outputs} from '../lib/ctm-parser'

          let data = fs.readFileSync("mesh.ctm",'binary')

          let ctmObs = parse(data) //we get an observable back

          ctmObs.forEach(function(parsedGeometry){
            //DO what you want with the data wich is something like {vertices,normals,etc}
            console.log(parsedGeometry) 
          })



## LICENSE

[The MIT License (MIT)](https://github.com/usco/usco-ctm-parser/blob/master/LICENSE)

- - -

[![Build Status](https://travis-ci.org/usco/usco-ctm-parser.svg?branch=master)](https://travis-ci.org/usco/usco-ctm-parser)
[![Dependency Status](https://david-dm.org/usco/usco-ctm-parser.svg)](https://david-dm.org/usco/usco-ctm-parser)
[![devDependency Status](https://david-dm.org/usco/usco-ctm-parser/dev-status.svg)](https://david-dm.org/usco/usco-ctm-parser#info=devDependencies)
