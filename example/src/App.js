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
      <div className="container">
        <div className="row">
          <div className='col-xs-12 col-md-6'>
            <h2>Cornerstone React Viewport Component</h2>
            <h4>What is this?</h4>
            <p>This is a re-usable component for displaying medical images with <a href="https://cornerstonejs.org/" target="_blank" rel="noopener noreferrer">Cornerstone.js.</a>
            </p>
          </div>
          <div className='col-xs-12 col-lg-6'>
            <CornerstoneViewport viewportData={exampleData} />
          </div>
        </div>
      </div>
    )
  }
}
