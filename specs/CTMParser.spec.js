THREE = require("three");
CTMParser = require("../CTMParser");
fs = require("fs");

describe("CTM parser tests", function() {
  var parser = new CTMParser();
  console.log("Parser outputs", parser.outputs);
  
  it("can ctm files", function() {
    data = fs.readFileSync("specs/data/hand.ctm") // ,'binary'
    parsedCTM = parser.parse(data);
    expect(parsedCTM instanceof THREE.Geometry).toBe(true);
    expect(parsedCTM.vertices.length).toEqual(864);
  });
  
});
