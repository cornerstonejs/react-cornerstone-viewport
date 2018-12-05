import React, { Component } from 'react'

import CornerstoneViewport from 'react-cornerstone-viewport'

export default class App extends Component {
  render () {
    const exampleData = {
      stack: {
        currentImageIdIndex: 0,
        imageIds: [
          "dicomweb://rawgit.com/chafey/byozfwv/master/sampleData/1.2.840.113619.2.5.1762583153.215519.978957063.80.dcm",
          "dicomweb://rawgit.com/chafey/byozfwv/master/sampleData/1.2.840.113619.2.5.1762583153.215519.978957063.81.dcm"
        ],
      }
    }

    return (
      <div>
        <CornerstoneViewport viewportData={exampleData} />
      </div>
    )
  }
}
