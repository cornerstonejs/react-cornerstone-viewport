import React, { Component } from 'react';
import CornerstoneViewport from '@cornerstone-viewport';
import cornerstone from 'cornerstone-core';

// https://github.com/conorhastings/react-syntax-highlighter
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

class ExamplePageEscapeHatch extends Component {
  state = {
    cornerstoneElement: undefined,
  };

  render() {
    return (
      <div>
        <h2>Escape Hatch</h2>
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
            onElementEnabled={elementEnabledEvt => {
              const cornerstoneElement = elementEnabledEvt.detail.element;

              // Save this for later
              this.setState({
                cornerstoneElement,
              });

              // Wait for image to render, then invert it
              cornerstoneElement.addEventListener(
                'cornerstoneimagerendered',
                imageRenderedEvent => {
                  const viewport = imageRenderedEvent.detail.viewport;
                  const invertedViewport = Object.assign({}, viewport, {
                    invert: true,
                  });

                  cornerstone.setViewport(cornerstoneElement, invertedViewport);
                }
              );
            }}
            style={{ minWidth: '100%', height: '512px', flex: '1' }}
          />
        </div>

        <h2>Source / Usage</h2>
        <p>
          The onElementEnabled event allows us to capture the point in time our
          element is enabled, and a reference to the element that was enabled.
          The bulk of the Cornerstone and CornerstoneTools APIs use the element
          as an identifier in API calls -- having access to it opens the door
          for more advanced/custom usage.
        </p>
        <p>
          Most notably, you can forego using the "tools" and "activeTool" props
          and instead manage things by hand. This can be particularly useful if
          you are leveraging Cornerstone Tool's{' '}
          <a href="https://github.com/cornerstonejs/cornerstoneTools/blob/master/src/store/modules/globalConfigurationModule.js#L4">
            globalToolSyncEnabled
          </a>{' '}
          configuration property to manage and synchronize viewport tool
          modes/bindings.
        </p>

        <div style={{ marginTop: '35px' }}>
          <SyntaxHighlighter
            language="jsx"
            showLineNumbers={true}
            style={atomDark}
          >
            {`<CornerstoneViewport
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
  onElementEnabled={elementEnabledEvt => {
    const cornerstoneElement = elementEnabledEvt.detail.element;

    // Save this for later
    this.setState({
      cornerstoneElement,
    });

    // Wait for image to render, then invert it
    cornerstoneElement.addEventListener(
      'cornerstoneimagerendered',
      imageRenderedEvent => {
        const viewport = imageRenderedEvent.detail.viewport;
        const invertedViewport = Object.assign({}, viewport, {
          invert: true,
        });

        cornerstone.setViewport(cornerstoneElement, invertedViewport);
      }
    );
  }}
  style={{ minWidth: '100%', height: '512px', flex: '1' }}
/>`}
          </SyntaxHighlighter>
        </div>
      </div>
    );
  }
}

export default ExamplePageEscapeHatch;
