import assert from 'assert'
import fs from 'fs'

//these two are needed by the parser
import Rx from 'rx'
import assign from 'fast.js/object/assign'


import parse,  {outputs} from '../src/index'

describe("CTM parser tests", () => {
  
  it("can parse ctm files", function(done){
    this.timeout(5000)
    let data = fs.readFileSync("specs/data/hand.ctm")//single file

    let obs = parse(data) //we get an observable back

    obs
      .filter( data => (!data.hasOwnProperty("progress")) ) //filter out progress information
      .forEach(function(parsedGeometry){

        assert.equal( parsedGeometry.indices.length, 47565)
        assert.equal( parsedGeometry.positions.length, 27852)
        assert.equal( parsedGeometry.normals.length , 27852)//23991
        
        done()
    })
  })
  
})
