import React, { Component } from 'react';
import CornerstoneViewport from '@cornerstone-viewport';
import PropTypes from 'prop-types';

// https://github.com/conorhastings/react-syntax-highlighter
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

class CustomOverlay extends Component {
  static propTypes = {
    scale: PropTypes.number.isRequired,
    windowWidth: PropTypes.number.isRequired,
    windowCenter: PropTypes.number.isRequired,
    imageId: PropTypes.string.isRequired,
    imageIndex: PropTypes.number.isRequired,
    stackSize: PropTypes.number.isRequired,
  };

  render() {
    return (
      <div
        style={{
          position: 'absolute',
          top: '15px',
          left: '15px',
          width: '100%',
          height: '100%',
          color: 'white',
        }}
      >
        🎉🎉🎉
        {Object.keys(this.props).map(key => {
          const val = this.props[key];
          return (
            <p key={key}>
              <b>{key}</b>: <span style={{ color: 'dodgerblue' }}>{val}</span>
            </p>
          );
        })}
        🎉🎉🎉
      </div>
    );
  }
}

class CustomLoader extends Component {
  render() {
    return (
      <div
        className="lds-ripple"
        style={{
          position: 'absolute',
          top: '47%',
          left: '47%',
          width: '100%',
          height: '100%',
          color: 'white',
        }}
      >
        <div />
        <div />
      </div>
    );
  }
}
class ExamplePageCustomOverlay extends Component {
  render() {
    return (
      <div>
        <h2>Custom Overlay</h2>
        <p>
          The most important thing to note here are the props received by the
          Custom Overlay component.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          <CornerstoneViewport
            tools={[
              {
                name: 'Wwwc',
                mode: 'active',
                modeOptions: { mouseButtonMask: 1 },
              },
            ]}
            imageIds={[
              'dicomweb://s3.amazonaws.com/lury/PTCTStudy/1.3.6.1.4.1.25403.52237031786.3872.20100510032220.11.dcm',
              'dicomweb://s3.amazonaws.com/lury/PTCTStudy/1.3.6.1.4.1.25403.52237031786.3872.20100510032220.12.dcm',
            ]}
            viewportOverlayComponent={CustomOverlay}
            loadingIndicatorComponent={CustomLoader}
            style={{ minWidth: '100%', height: '512px', flex: '1' }}
          />
        </div>

        <h2>Source / Usage</h2>
        <div style={{ marginTop: '35px' }}>
          <SyntaxHighlighter
            language="jsx"
            showLineNumbers={true}
            style={atomDark}
          >
            {`class CustomOverlay extends Component {
  static propTypes = {
    scale: PropTypes.number.isRequired,
    windowWidth: PropTypes.number.isRequired,
    windowCenter: PropTypes.number.isRequired,
    imageId: PropTypes.string.isRequired,
    imageIndex: PropTypes.number.isRequired,
    stackSize: PropTypes.number.isRequired,
  };

  render() {
    return (
      <div
        style={{
          position: 'absolute',
          top: '15px',
          left: '15px',
          width: '100%',
          height: '100%',
          color: 'white',
        }}
      >
        🎉🎉🎉
        {Object.keys(this.props).map(key => {
          const val = this.props[key];
          return (
            <p key={key}>
              <b>{key}</b>: <span style={{ color: 'dodgerblue' }}>{val}</span>
            </p>
          );
        })}
        🎉🎉🎉
      </div>
    );
  }
}

class CustomLoader extends Component {
  render() {
    return (
      <div
        className="lds-ripple"
        style={{
          position: 'absolute',
          top: '47%',
          left: '47%',
          width: '100%',
          height: '100%',
          color: 'white',
        }}
      >
        <div></div>
        <div></div>
      </div>
    );
  }
}


{/* RENDER */}
<CornerstoneViewport
tools={[
  {
    name: 'Wwwc',
    mode: 'active',
    modeOptions: { mouseButtonMask: 1 },
  },
]}
imageIds={[
  'dicomweb://s3.amazonaws.com/lury/PTCTStudy/1.3.6.1.4.1.25403.52237031786.3872.20100510032220.11.dcm',
  'dicomweb://s3.amazonaws.com/lury/PTCTStudy/1.3.6.1.4.1.25403.52237031786.3872.20100510032220.12.dcm',
]}
viewportOverlayComponent={CustomOverlay}
loadingIndicatorComponent={CustomLoader}
style={{ minWidth: '100%', height: '512px', flex: '1' }}
/>`}
          </SyntaxHighlighter>
        </div>
      </div>
    );
  }
}

export default ExamplePageCustomOverlay;
