import CTM from './ctm'
import { createModelBuffers, unIndexGeometryData } from './parseHelpers'

self.onmessage = function (event) {
  let files = []

  for (var i = 0; i < event.data.offsets.length; i++) {
    let stream = new CTM.Stream(event.data.data)
    stream.offset = event.data.offsets[ i ]

    let geometry = unIndexGeometryData(createModelBuffers(new CTM.File(stream)))
    files[ i ] = geometry
  }

  self.postMessage(files)
  self.close()
}
