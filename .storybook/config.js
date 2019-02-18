import { configure } from '@storybook/react';
import './configDeps.js';

function loadStories() {
  require('../src/stories');
}

configure(loadStories, module);
