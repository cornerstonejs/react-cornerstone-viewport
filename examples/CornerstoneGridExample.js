import React, { Component } from 'react';
import CornerstoneViewport from '@cornerstone-viewport';

// https://github.com/conorhastings/react-syntax-highlighter
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

class CornerstoneGridExample extends Component {
  state = {
    activeViewportIndex: 0,
    viewports: [0, 1, 2, 3],
    tools: [
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
    ],
    imageIds: [
      'dicomweb://s3.amazonaws.com/lury/PTCTStudy/1.3.6.1.4.1.25403.52237031786.3872.20100510032220.11.dcm',
      'dicomweb://s3.amazonaws.com/lury/PTCTStudy/1.3.6.1.4.1.25403.52237031786.3872.20100510032220.12.dcm',
    ],
  };

  componentDidMount() {}

  render() {
    return (
      <div>
        <h2>TODO:</h2>
        <ul>
          <li>How to set active viewport (fn)</li>
          <li>Synchronization / Reference Lines?</li>
          <li>Dynamic width/height</li>
        </ul>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {this.state.viewports.map(vp => (
            <CornerstoneViewport
              key={vp}
              style={{ minWidth: '50%', height: '256px', flex: '1' }}
              tools={this.state.tools}
              imageIds={this.state.imageIds}
            />
          ))}
        </div>
      </div>
    );
  }
}

export default CornerstoneGridExample;
