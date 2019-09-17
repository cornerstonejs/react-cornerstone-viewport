import React, { Component } from 'react';
import './initCornerstone';
import CornerstoneViewport from 'react-cornerstone-viewport';
import cornerstone from 'cornerstone-core';
import cornerstoneTools from 'cornerstone-tools';

export default class App extends Component {
  render () {
    const exampleData = {
      stack: {
        currentImageIdIndex: 0,
        imageIds: [
          "dicomweb://s3.amazonaws.com/lury/PTCTStudy/1.3.6.1.4.1.25403.52237031786.3872.20100510032220.11.dcm",
          "dicomweb://s3.amazonaws.com/lury/PTCTStudy/1.3.6.1.4.1.25403.52237031786.3872.20100510032220.12.dcm"
        ],
      }
    }

    const style = {
      'height': '512px'
    };

    return (
      <div className="container">
      <div className="row">
        <h2>Cornerstone React Viewport Component</h2>
      </div>
        <div className="row">
          <div className='col-xs-12 col-lg-6'>
            <h4>What is this?</h4>
            <p>This is a re-usable component for displaying medical images with <a href="https://cornerstonejs.org/" target="_blank" rel="noopener noreferrer">Cornerstone.js.</a>
            </p>
          </div>
          <div className='col-xs-12 col-lg-6' style={style}>
            <CornerstoneViewport
              viewportData={exampleData}
              cornerstone={cornerstone} 
              cornerstoneTools={cornerstoneTools}
              />
          </div>
        </div>
      </div>
    )
  }
}
