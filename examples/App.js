import React, { Component } from 'react';
import './initCornerstone';
import CornerstoneViewport from '@cornerstone-viewport';

// https://github.com/conorhastings/react-syntax-highlighter
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default class App extends Component {
  render() {
    const imageIds = [
      'dicomweb://s3.amazonaws.com/lury/PTCTStudy/1.3.6.1.4.1.25403.52237031786.3872.20100510032220.11.dcm',
      'dicomweb://s3.amazonaws.com/lury/PTCTStudy/1.3.6.1.4.1.25403.52237031786.3872.20100510032220.12.dcm',
    ];

    const style = {
      height: '512px',
    };

    return (
      <div className="container">
        <div className="row">
          <h1>Cornerstone React Viewport Component</h1>
          <p>
            This is a re-usable component for displaying medical images with
            <a
              href="https://cornerstonejs.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Cornerstone.js.
            </a>
          </p>
        </div>

        {/* SIMPLE EXAMPLE */}
        <div className="row">
          <div className="col-xs-12 col-lg-6">
            <SyntaxHighlighter
              language="jsx"
              showLineNumbers={true}
              style={atomDark}
            >
              {`import React from "react";
import CornerstoneViewport from 'react-cornerstone-viewport';

class App extends React.Component {
  render() {
    return (
      <CornerstoneViewport
      tools={[
        // Mouse
        {
          name: 'Wwwc',
          mode: 'active',
          modeOptions: { mouseButtonMask: 1 },
        },
        {
          name: 'Zoom',
          mode: 'active',
          modeOptions: { mouseButtonMask: 2 },
        },
        {
          name: 'Pan',
          mode: 'active',
          modeOptions: { mouseButtonMask: 4 },
        },
        // Scroll
        { name: 'StackScrollMouseWheel', mode: 'active' },
        // Touch
        { name: 'PanMultiTouch', mode: 'active' },
        { name: 'ZoomTouchPinch', mode: 'active' },
        { name: 'StackScrollMultiTouch', mode: 'active' },
      ]}
      imageIds={[
        'dicomweb://s3.amazonaws.com/lury/PTCTStudy/1.3.6.1.4.1.25403.52237031786.3872.20100510032220.11.dcm',
        'dicomweb://s3.amazonaws.com/lury/PTCTStudy/1.3.6.1.4.1.25403.52237031786.3872.20100510032220.12.dcm',
      ]}
    />
    );
  }
}

export default App;

  `}
            </SyntaxHighlighter>
          </div>
          <div className="col-xs-12 col-lg-6" style={style}>
            <CornerstoneViewport
              tools={[
                // Mouse
                {
                  name: 'Wwwc',
                  mode: 'active',
                  modeOptions: { mouseButtonMask: 1 },
                },
                {
                  name: 'Zoom',
                  mode: 'active',
                  modeOptions: { mouseButtonMask: 2 },
                },
                {
                  name: 'Pan',
                  mode: 'active',
                  modeOptions: { mouseButtonMask: 4 },
                },
                // Scroll
                { name: 'StackScrollMouseWheel', mode: 'active' },
                // Touch
                { name: 'PanMultiTouch', mode: 'active' },
                { name: 'ZoomTouchPinch', mode: 'active' },
                { name: 'StackScrollMultiTouch', mode: 'active' },
              ]}
              imageIds={imageIds}
            />
          </div>
        </div>
      </div>
    );
  }
}
