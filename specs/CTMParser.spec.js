THREE = require("three");
CTMParser = require("../ctm-parser");
fs = require("fs");

describe("CTM parser tests", function() {
  var parser = new CTMParser();
  console.log("Parser outputs", parser.outputs);
  
  it("can parse ctm files", function(done) {
    data = fs.readFileSync("specs/data/hand.ctm")
    parsedCTMPromise = parser.parse(data);

    parsedCTMPromise.done(function(parsedCTM){
      expect(parsedCTM instanceof THREE.Geometry).toBe(true);
      expect(parsedCTM.vertices.length).toEqual(9284);
      done();
    });
    
  });

  it("can parse ctm files (to buffer geometry)", function(done) {
    data = fs.readFileSync("specs/data/hand.ctm") // ,'binary'
    parsedCTMPromise = parser.parse(data, {useBuffers:true});

    parsedCTMPromise.done(function(parsedCTM){
      expect(parsedCTM instanceof THREE.BufferGeometry).toBe(true);
      expect(parsedCTM.attributes.index.numItems).toEqual(47565);
      expect(parsedCTM.attributes.position.numItems).toEqual(23991);
      expect(parsedCTM.attributes.normal.numItems).toEqual(23991);
      done();
    });
  });
  
});
