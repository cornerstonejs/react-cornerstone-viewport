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
          "dicomweb://rawgit.com/chafey/byozfwv/master/sampleData/1.2.840.113619.2.5.1762583153.215519.978957063.80.dcm",
          "dicomweb://rawgit.com/chafey/byozfwv/master/sampleData/1.2.840.113619.2.5.1762583153.215519.978957063.81.dcm"
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
