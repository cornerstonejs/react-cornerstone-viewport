import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';

import CornerstoneViewport from '../index.js';

storiesOf('CornerstoneViewport', module).add('Basic Usage', () => {
  const exampleData = {
    stack: {
      currentImageIdIndex: 0,
      imageIds: [
        'dicomweb://s3.amazonaws.com/lury/PTCTStudy/1.3.6.1.4.1.25403.52237031786.3872.20100510032220.11.dcm',
        'dicomweb://s3.amazonaws.com/lury/PTCTStudy/1.3.6.1.4.1.25403.52237031786.3872.20100510032220.12.dcm'
      ]
    }
  };

  return (
    <div style={{ height: '512px' }}>
      <CornerstoneViewport viewportData={exampleData} />
    </div>
  );
});
