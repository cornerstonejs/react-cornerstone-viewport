import React, { Component } from 'react';
import CornerstoneViewport from '@cornerstone-viewport';

// https://github.com/conorhastings/react-syntax-highlighter
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const stack1 = [
  'dicomweb://s3.amazonaws.com/lury/PTCTStudy/1.3.6.1.4.1.25403.52237031786.3872.20100510032220.7.dcm',
  'dicomweb://s3.amazonaws.com/lury/PTCTStudy/1.3.6.1.4.1.25403.52237031786.3872.20100510032220.8.dcm',
  'dicomweb://s3.amazonaws.com/lury/PTCTStudy/1.3.6.1.4.1.25403.52237031786.3872.20100510032220.9.dcm',
  'dicomweb://s3.amazonaws.com/lury/PTCTStudy/1.3.6.1.4.1.25403.52237031786.3872.20100510032220.10.dcm',
  'dicomweb://s3.amazonaws.com/lury/PTCTStudy/1.3.6.1.4.1.25403.52237031786.3872.20100510032220.11.dcm',
  'dicomweb://s3.amazonaws.com/lury/PTCTStudy/1.3.6.1.4.1.25403.52237031786.3872.20100510032220.12.dcm',
];

const stack2 = [
  'dicomweb://s3.amazonaws.com/lury/PTCTStudy/1.3.6.1.4.1.25403.52237031786.3872.20100510032220.9.dcm',
  'dicomweb://s3.amazonaws.com/lury/PTCTStudy/1.3.6.1.4.1.25403.52237031786.3872.20100510032220.10.dcm',
  'dicomweb://s3.amazonaws.com/lury/PTCTStudy/1.3.6.1.4.1.25403.52237031786.3872.20100510032220.11.dcm',
];

class ExamplePageGrid extends Component {
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
      'Length',
      'Angle',
      'Bidirectional',
      'FreehandRoi',
      'Eraser',
      // Scroll
      { name: 'StackScrollMouseWheel', mode: 'active' },
      // Touch
      { name: 'PanMultiTouch', mode: 'active' },
      { name: 'ZoomTouchPinch', mode: 'active' },
      { name: 'StackScrollMultiTouch', mode: 'active' },
    ],
    imageIds: stack1,
    // FORM
    activeTool: 'Wwwc',
    imageIdIndex: 0,
    isPlaying: false,
    frameRate: 22,
  };

  componentDidMount() {}

  render() {
    return (
      <div>
        <h2>Grid Demo</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {this.state.viewports.map(vp => (
            <CornerstoneViewport
              key={vp}
              style={{ minWidth: '50%', height: '256px', flex: '1' }}
              tools={this.state.tools}
              imageIds={this.state.imageIds}
              imageIdIndex={this.state.imageIdIndex}
              isPlaying={this.state.isPlaying}
              frameRate={this.state.frameRate}
              className={this.state.activeViewportIndex === vp ? 'active' : ''}
              activeTool={this.state.activeTool}
              setViewportActive={() => {
                this.setState({
                  activeViewportIndex: vp,
                });
              }}
            />
          ))}
        </div>

        {/* FORM */}
        <h2>Misc. Props</h2>
        <p>
          Note, when we change the active stack, we also need to update the
          imageIdIndex prop to a value that falls within the new stack's range
          of possible indexes.
        </p>
        <div style={{ marginTop: '35px' }}>
          <form className="row">
            {/* FIRST COLUMN */}
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="active-tool">Active Tool:</label>
                <select
                  value={this.state.activeTool}
                  onChange={evt =>
                    this.setState({ activeTool: evt.target.value })
                  }
                  className="form-control"
                  id="active-tool"
                >
                  <option value="Wwwc">Wwwc</option>
                  <option value="Zoom">Zoom</option>
                  <option value="Pan">Pan</option>
                  <option value="Length">Length</option>
                  <option value="Angle">Angle</option>
                  <option value="Bidirectional">Bidirectional</option>
                  <option value="FreehandRoi">Freehand</option>
                  <option value="Eraser">Eraser</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="image-id-index">Image ID Index:</label>
                <input
                  type="range"
                  min="0"
                  max={this.state.imageIds.length - 1}
                  value={this.state.imageIdIndex}
                  onChange={evt =>
                    this.setState({ imageIdIndex: parseInt(evt.target.value) })
                  }
                  className="form-control"
                  id="image-id-index"
                ></input>
              </div>
              <div className="form-group">
                <label htmlFor="image-id-stack">Image ID Stack:</label>
                <select
                  defaultValue={1}
                  onChange={evt => {
                    const selectedStack =
                      parseInt(evt.target.value) === 1 ? stack1 : stack2;

                    this.setState({
                      imageIds: selectedStack,
                      imageIdIndex: 0,
                    });
                  }}
                  className="form-control"
                  id="image-id-stack"
                >
                  <option value="1">Stack 1</option>
                  <option value="2">Stack 2</option>
                </select>
              </div>
            </div>
            {/* SECOND COLUMN */}
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="active-viewport-index">
                  Active Viewport Index:
                </label>
                <input
                  type="text"
                  readOnly={true}
                  value={this.state.activeViewportIndex}
                  className="form-control"
                  id="active-viewport-index"
                ></input>
              </div>
              <div className="input-group">
                <span className="input-group-btn">
                  <button
                    className="btn btn-default"
                    type="button"
                    onClick={() => {
                      this.setState({
                        isPlaying: !this.state.isPlaying,
                      });
                    }}
                  >
                    {this.state.isPlaying ? 'Stop' : 'Start'}
                  </button>
                </span>
                <input
                  type="number"
                  className="form-control"
                  value={this.state.frameRate}
                  onChange={evt => {
                    const frameRateInput = parseInt(evt.target.value);
                    const frameRate = Math.max(Math.min(frameRateInput, 90), 1);

                    this.setState({ frameRate });
                  }}
                />
              </div>
            </div>
          </form>
        </div>

        {/* CODE SNIPPET */}
        <h2>Source / Usage</h2>
        <div style={{ marginTop: '35px' }}>
          <SyntaxHighlighter
            language="jsx"
            showLineNumbers={true}
            style={atomDark}
          >
            {`state = {
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
    'Length',
    'Angle',
    'Bidirectional',
    'FreehandRoi',
    'Eraser',
    // Scroll
    { name: 'StackScrollMouseWheel', mode: 'active' },
    // Touch
    { name: 'PanMultiTouch', mode: 'active' },
    { name: 'ZoomTouchPinch', mode: 'active' },
    { name: 'StackScrollMultiTouch', mode: 'active' },
  ],
  imageIds: [
    'dicomweb://s3.amazonaws.com/lury/PTCTStudy/1.3.6.1.4.1.25403.52237031786.3872.20100510032220.9.dcm',
    'dicomweb://s3.amazonaws.com/lury/PTCTStudy/1.3.6.1.4.1.25403.52237031786.3872.20100510032220.10.dcm',
    'dicomweb://s3.amazonaws.com/lury/PTCTStudy/1.3.6.1.4.1.25403.52237031786.3872.20100510032220.11.dcm',
  ],
  // FORM
  activeTool: 'Wwwc',
  imageIdIndex: 0,
  isPlaying: false,
  frameRate: 22,
};

{/* RENDER */}
<div style={{ display: 'flex', flexWrap: 'wrap' }}>
  {this.state.viewports.map(viewportIndex => (
    <CornerstoneViewport
      key={viewportIndex}
      style={{ minWidth: '50%', height: '256px', flex: '1' }}
      tools={this.state.tools}
      imageIds={this.state.imageIds}
      imageIdIndex={this.state.imageIdIndex}
      isPlaying={this.state.isPlaying}
      frameRate={this.state.frameRate}
      className={this.state.activeViewportIndex === viewportIndex ? 'active' : ''}
      activeTool={this.state.activeTool}
      setViewportActive={() => {
        this.setState({
          activeViewportIndex: viewportIndex,
        });
      }}
    />
  ))}
</div>`}
          </SyntaxHighlighter>
        </div>
      </div>
    );
  }
}

export default ExamplePageGrid;
