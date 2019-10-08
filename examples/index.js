import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';
import App from './App';
import initCornerstone from './initCornerstone.js';

//
initCornerstone();
ReactDOM.render(<App />, document.getElementById('root'));
