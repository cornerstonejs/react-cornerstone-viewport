import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
// Routes
import ExamplePageBasic from './ExamplePageBasic.js';
import ExamplePageGrid from './ExamplePageGrid.js';
import ExamplePageCustomOverlay from './ExamplePageCustomOverlay.js';
import ExamplePageEscapeHatch from './ExamplePageEscapeHatch.js';

/**
 *
 *
 * @param {*} { href, text }
 * @returns
 */
function LinkOut({ href, text }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {text}
    </a>
  );
}

/**
 *
 *
 * @param {*} { title, url, text, screenshotUrl }
 * @returns
 */
function ExampleEntry({ title, url, text, screenshotUrl }) {
  return (
    <div>
      <h5>
        <Link to={url}>{title}</Link>
      </h5>
      <p>{text}</p>
      <hr />
    </div>
  );
}

function Index() {
  const style = {
    minHeight: '512px',
  };

  const examples = [
    {
      title: 'Props Documentation',
      url: '/props',
      text: 'COMING SOON',
    },
    {
      title: 'Basic Usage',
      url: '/basic',
      text:
        'How to render an array of DICOM images and setup common built-in tools.',
    },
    {
      title: 'Grid Layout',
      url: '/grid',
      text: 'How to render multiple viewports and track the "active viewport".',
    },
    {
      title: 'Custom Overlay and Loader Component',
      url: '/custom-overlay',
      text:
        'Provide an alternative React Component to use in place of the built in overlay-text and loading indicator components.',
    },
    {
      title: 'Escape Hatch',
      url: '/escape-hatch',
      text:
        'How to access the created enabledElement so you can leverage cornerstone and cornerstone-tools APIs directly.',
    },
    // MOST COMPLEX: (mini viewer)
    // - (mini viewer) Dynamic Grid + Global Tool Sync + Changing Tools
    // Misc. Other Props: (just list them all, prop-types, basic comments for docs)
    // - onElementEnabled (escape hatch)
    // - eventListeners
    // - isStackPrefetchEnabled
    // - react-resize-observer
  ];

  const exampleComponents = examples.map(e => {
    return <ExampleEntry key={e.title} {...e} />;
  });

  return (
    <div className="container">
      <div className="row">
        <h1>Cornerstone Viewport</h1>
      </div>
      <div className="row">
        <div className="col-xs-12 col-lg-6">
          <p>
            This is a set of re-usable components for displaying data with{' '}
            <LinkOut
              href={'https://github.com/cornerstonejs/cornerstone'}
              text={'cornerstone.js'}
            />
            .
          </p>
        </div>

        <div className="col-xs-12 col-lg-12" style={style}>
          <h3>Examples</h3>
          {exampleComponents}
        </div>

        <div className="col-xs-12 col-lg-12">
          <h3>Configuring Cornerstone</h3>
          <p>
            All of these examples assume that the cornerstone family of
            libraries have been imported and configured prior to use. Here is
            brief example of what that may look like in ES6:
          </p>
          <SyntaxHighlighter
            language="jsx"
            showLineNumbers={true}
            style={atomDark}
          >
            {`import dicomParser from 'dicom-parser';
import cornerstone from 'cornerstone-core';
import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import cornerstoneMath from 'cornerstone-math';
import cornerstoneTools from 'cornerstone-tools';
import Hammer from 'hammerjs';

export default function initCornerstone() {

  // Cornerstone Tools
  cornerstoneTools.external.cornerstone = cornerstone;
  cornerstoneTools.external.Hammer = Hammer;
  cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
  cornerstoneTools.init();

  // Image Loader
  cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
  cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
  cornerstoneWADOImageLoader.webWorkerManager.initialize({
    maxWebWorkers: navigator.hardwareConcurrency || 1,
    startWebWorkersOnDemand: true,
    taskConfiguration: {
      decodeTask: {
        initializeCodecsOnStartup: false,
        usePDFJS: false,
        strict: false,
      },
    },
  });
}`}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
}

/**
 *
 *
 * @param {*} props
 * @returns
 */
function Example(props) {
  return (
    <div className="container">
      <h5>
        <Link to="/">Back to Examples</Link>
      </h5>
      {props.children}
    </div>
  );
}

function AppRouter() {
  const basic = () => Example({ children: <ExamplePageBasic /> });
  const grid = () => Example({ children: <ExamplePageGrid /> });
  const customOverlay = () =>
    Example({ children: <ExamplePageCustomOverlay /> });
  const escapeHatch = () => Example({ children: <ExamplePageEscapeHatch /> });

  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Index} />
        <Route exact path="/basic/" render={basic} />
        <Route exact path="/grid/" render={grid} />
        <Route exact path="/custom-overlay" render={customOverlay} />
        <Route exact path="/escape-hatch" render={escapeHatch} />
        <Route exact component={Index} />
      </Switch>
    </Router>
  );
}

export default class App extends Component {
  render() {
    return <AppRouter />;
  }
}
