import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';
// Routes
import CornerstoneBasicExample from './CornerstoneBasicExample';

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
    height: '512px',
  };

  const examples = [
    {
      title: 'Basic Usage',
      url: '/basic',
      text:
        'How to render an array of DICOM images and setup common built-in tools.',
    },
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
          <h4>What is this?</h4>
          <p>
            This is a set of re-usable components for displaying data with{' '}
            <LinkOut
              href={'https://github.com/Kitware/vtk-js'}
              text={'VTK.js'}
            />
            .
          </p>
          <h4>Why does it exist?</h4>
          <p>
            To provide a simple starting point for developers that wish to build
            applications on top of VTK.js.
          </p>
        </div>

        <div className="col-xs-12 col-lg-12" style={style}>
          <h3>Examples</h3>
          {exampleComponents}
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
  const basic = () => Example({ children: <CornerstoneBasicExample /> });

  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Index} />
        <Route exact path="/basic/" render={basic} />
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

// export default class App extends Component {
//   render() {
//     const style = {
//       height: '512px',
//     };

//         <div className="row">
//           <div className="col-xs-12 col-lg-6">
//             <SyntaxHighlighter
//               language="jsx"
//               showLineNumbers={true}
//               style={atomDark}
//             >
//               {`import React from "react";
// import CornerstoneViewport from 'react-cornerstone-viewport';

// class App extends React.Component {
//   render() {
//     return (
//       <CornerstoneViewport
//       tools={[
//         // Mouse
//         {
//           name: 'Wwwc',
//           mode: 'active',
//           modeOptions: { mouseButtonMask: 1 },
//         },
//         {
//           name: 'Zoom',
//           mode: 'active',
//           modeOptions: { mouseButtonMask: 2 },
//         },
//         {
//           name: 'Pan',
//           mode: 'active',
//           modeOptions: { mouseButtonMask: 4 },
//         },
//         // Scroll
//         { name: 'StackScrollMouseWheel', mode: 'active' },
//         // Touch
//         { name: 'PanMultiTouch', mode: 'active' },
//         { name: 'ZoomTouchPinch', mode: 'active' },
//         { name: 'StackScrollMultiTouch', mode: 'active' },
//       ]}
//       imageIds={[
//         'dicomweb://s3.amazonaws.com/lury/PTCTStudy/1.3.6.1.4.1.25403.52237031786.3872.20100510032220.11.dcm',
//         'dicomweb://s3.amazonaws.com/lury/PTCTStudy/1.3.6.1.4.1.25403.52237031786.3872.20100510032220.12.dcm',
//       ]}
//     />
//     );
//   }
// }

// export default App;

//   `}
//             </SyntaxHighlighter>
//           </div>
//           <div className="col-xs-12 col-lg-6" style={style}></div>
//         </div>
//       </div>
//   }
// }
