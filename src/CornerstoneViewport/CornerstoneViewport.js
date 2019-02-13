import React, { Component } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash.debounce';
import ReactResizeDetector from 'react-resize-detector';
import ImageScrollbar from '../ImageScrollbar/ImageScrollbar.js';
import ViewportOverlay from '../ViewportOverlay/ViewportOverlay.js';
import LoadingIndicator from '../LoadingIndicator/LoadingIndicator.js';
import ViewportOrientationMarkers from '../ViewportOrientationMarkers/ViewportOrientationMarkers.js';
import cornerstone from 'cornerstone-core';
import cornerstoneTools from 'cornerstone-tools';

import './CornerstoneViewport.css';

const EVENT_RESIZE = 'resize';

const scrollToIndex = cornerstoneTools.import('util/scrollToIndex');

function setToolsPassive(cornerstoneTools, tools) {
  tools.forEach(tool => {
    cornerstoneTools.setToolPassive(tool);
  });
}

function initializeTools(cornerstoneTools, tools, element) {
  Array.from(tools).forEach(tool => {
    const apiTool = cornerstoneTools[`${tool.name}Tool`] || tool.apiTool;
    if (apiTool) {
      cornerstoneTools.addToolForElement(element, apiTool, tool.configuration);
    } else {
      throw new Error(`Tool not found: ${tool.name}Tool`);
    }
  });
}

class CornerstoneViewport extends Component {
  static defaultProps = {
    activeTool: 'Wwwc',
    viewportData: {
      stack: {
        imageIds: [],
        currentImageIdIndex: 0
      }
    },
    isActive: false,
    cornerstoneOptions: {},
    enableStackPrefetch: true,
    cineToolData: {
      isPlaying: false,
      cineFrameRate: 24
    },
    availableTools: [
      { name: 'Pan', mouseButtonMasks: [1, 4] },
      {
        name: 'Zoom',
        configuration: {
          minScale: 0.3,
          maxScale: 25,
          preventZoomOutsideImage: true
        },
        mouseButtonMasks: [1, 2]
      },
      { name: 'Wwwc', mouseButtonMasks: [1] },
      { name: 'Bidirectional', mouseButtonMasks: [1] },
      { name: 'Length', mouseButtonMasks: [1] },
      { name: 'Angle', mouseButtonMasks: [1] },
      { name: 'StackScroll', mouseButtonMasks: [1] },
      { name: 'Brush', mouseButtonMasks: [1] },
      { name: 'PanMultiTouch' },
      { name: 'ZoomTouchPinch' },
      { name: 'StackScrollMouseWheel' },
      { name: 'StackScrollMultiTouch' }
    ],
    viewportOverlayComponent: ViewportOverlay
  };

  static propTypes = {
    activeTool: PropTypes.string.isRequired,
    viewportData: PropTypes.object.isRequired,
    cornerstoneOptions: PropTypes.object.isRequired,
    enableStackPrefetch: PropTypes.bool.isRequired,
    cineToolData: PropTypes.object.isRequired,
    availableTools: PropTypes.array.isRequired,
    onMeasurementsChanged: PropTypes.func,
    isActive: PropTypes.bool.isRequired,
    layout: PropTypes.object,
    children: PropTypes.node,
    onDoubleClick: PropTypes.func,
    onRightClick: PropTypes.func,
    onTouchPress: PropTypes.func,
    setViewportActive: PropTypes.func,
    setViewportSpecificData: PropTypes.func,
    clearViewportSpecificData: PropTypes.func,
    viewportOverlayComponent: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.func
    ])
  };

  static loadIndicatorDelay = 45;

  constructor(props) {
    super(props);

    // TODO: Allow viewport as a prop
    const { stack } = props.viewportData;
    this.state = {
      stack,
      displaySetInstanceUid: props.viewportData.displaySetInstanceUid,
      imageId: stack.imageIds[0],
      viewportHeight: '100%',
      isLoading: false,
      numImagesLoaded: 0,
      error: null,
      viewport: cornerstone.getDefaultViewport(null, undefined)
    };

    const { loadHandlerManager } = cornerstoneTools;
    loadHandlerManager.setStartLoadHandler(this.startLoadingHandler);
    loadHandlerManager.setEndLoadHandler(this.doneLoadingHandler);

    this.debouncedResize = debounce(() => {
      try {
        cornerstone.getEnabledElement(this.element);
      } catch (error) {
        console.error(error);
        return;
      }

      cornerstone.resize(this.element, true);

      this.setState({
        viewportHeight: `${this.element.clientHeight - 20}px`
      });
    }, 300);
  }

  render() {
    const isLoading = this.state.isLoading;
    // TODO: Check this later
    // || this.state.numImagesLoaded < 1;

    const displayLoadingIndicator = isLoading || this.state.error;

    let className = 'CornerstoneViewport';
    if (this.props.isActive) {
      className += ' active';
    }

    const getOverlay = () => {
      const Component = this.props.viewportOverlayComponent;

      return (
        <Component
          stack={this.state.stack}
          viewport={this.state.viewport}
          imageId={this.state.imageId}
        />
      );
    };

    return (
      <div className={className}>
        <ReactResizeDetector
          handleWidth
          handleHeight
          onResize={this.onWindowResize}
        />
        <div
          className="viewport-element"
          onContextMenu={this.onContextMenu}
          data-viewport-index={this.props.viewportIndex}
          ref={input => {
            this.element = input;
          }}
        >
          {displayLoadingIndicator && (
            <LoadingIndicator error={this.state.error} />
          )}
          <canvas className="cornerstone-canvas" />
          {getOverlay()}
          <ViewportOrientationMarkers
            imageId={this.state.imageId}
            viewport={this.state.viewport}
          />
        </div>
        <ImageScrollbar
          onInputCallback={this.imageSliderOnInputCallback}
          max={this.state.stack.imageIds.length - 1}
          value={this.state.stack.currentImageIdIndex}
          height={this.state.viewportHeight}
        />
        {this.props.children}
      </div>
    );
  }

  /**
   * Preventing the default behaviour for right-click is essential to
   * allow right-click tools to work.
   *
   * @param event
   */
  onContextMenu = event => {
    event.preventDefault();
  };

  onWindowResize = () => {
    this.debouncedResize();
  };

  onImageRendered = event => {
    this.setState({
      viewport: Object.assign({}, event.detail.viewport)
    });
  };

  onNewImage = event => {
    this.setState({
      imageId: event.detail.image.imageId
    });
  };

  componentDidMount() {
    const element = this.element;
    this.eventHandlerData = [
      {
        eventTarget: element,
        eventType: cornerstone.EVENTS.IMAGE_RENDERED,
        handler: this.onImageRendered
      },
      {
        eventTarget: element,
        eventType: cornerstone.EVENTS.NEW_IMAGE,
        handler: this.onNewImage
      },
      {
        eventTarget: element,
        eventType: cornerstoneTools.EVENTS.STACK_SCROLL,
        handler: this.onStackScroll
      },
      {
        eventTarget: element,
        eventType: cornerstoneTools.EVENTS.MEASUREMENT_ADDED,
        handler: this.onMeasurementAdded
      },
      {
        eventTarget: element,
        eventType: cornerstoneTools.EVENTS.MEASUREMENT_MODIFIED,
        handler: this.onMeasurementModified
      },
      {
        eventTarget: element,
        eventType: cornerstoneTools.EVENTS.MEASUREMENT_REMOVED,
        handler: this.onMeasurementRemoved
      },
      {
        eventTarget: element,
        eventType: cornerstoneTools.EVENTS.MEASUREMENT_MODIFIED,
        handler: this.onMeasurementModified
      },
      {
        eventTarget: element,
        eventType: cornerstoneTools.EVENTS.MOUSE_CLICK,
        handler: this.onMouseClick
      },
      {
        eventTarget: element,
        eventType: cornerstoneTools.EVENTS.MOUSE_DOWN,
        handler: this.onMouseClick
      },
      {
        eventTarget: element,
        eventType: cornerstoneTools.EVENTS.TOUCH_PRESS,
        handler: this.onTouchPress
      },
      {
        eventTarget: element,
        eventType: cornerstoneTools.EVENTS.TOUCH_START,
        handler: this.onTouchStart
      },
      {
        eventTarget: element,
        eventType: cornerstoneTools.EVENTS.DOUBLE_CLICK,
        handler: this.onDoubleClick
      },
      {
        eventTarget: element,
        eventType: cornerstoneTools.EVENTS.DOUBLE_TAP,
        handler: this.onDoubleClick
      },
      {
        eventTarget: window,
        eventType: EVENT_RESIZE,
        handler: this.onWindowResize
      },
      {
        eventTarget: cornerstone.events,
        eventType: cornerstone.EVENTS.IMAGE_LOADED,
        handler: this.onImageLoaded
      }
    ];

    // Enable the DOM Element for use with Cornerstone
    cornerstone.enable(element, this.props.cornerstoneOptions);

    // Handle the case where the imageId isn't loaded correctly and the
    // imagePromise returns undefined
    // To test, uncomment the next line
    //let imageId = 'AfileThatDoesntWork'; // For testing only!

    const { imageId } = this.state;
    let imagePromise;
    try {
      imagePromise = cornerstone.loadAndCacheImage(imageId);
    } catch (error) {
      console.error(error);
      if (!imagePromise) {
        this.setState({ error });
        return;
      }
    }

    // Load the first image in the stack
    imagePromise.then(
      image => {
        try {
          cornerstone.getEnabledElement(element);
        } catch (error) {
          // Handle cases where the user ends the session before the image is displayed.
          console.error(error);
          return;
        }

        // Set Soft Tissue preset for all images by default
        const viewport = cornerstone.getDefaultViewportForImage(element, image);

        // Display the first image
        cornerstone.displayImage(element, image, viewport);

        // Clear any previous tool state
        cornerstoneTools.clearToolState(this.element, 'stack');

        /* Add the stack tool state to the enabled element, and
           add stack state managers for the stack tool, CINE tool, and reference lines
        */
        const stack = this.state.stack;
        cornerstoneTools.addStackStateManager(element, [
          'stack',
          'playClip',
          'referenceLines'
        ]);
        cornerstoneTools.addToolState(element, 'stack', stack);

        if (this.props.enableStackPrefetch) {
          cornerstoneTools.stackPrefetch.enable(this.element);
        }
        initializeTools(cornerstoneTools, this.props.availableTools, element);

        this.setActiveTool(this.props.activeTool);

        /* For touch devices, by default we activate:
          - Pinch to zoom
          - Two-finger Pan
          - Three (or more) finger Stack Scroll
        */
        cornerstoneTools.setToolActive('PanMultiTouch', {
          mouseButtonMask: 0,
          isTouchActive: true
        });
        cornerstoneTools.setToolActive('ZoomTouchPinch', {
          mouseButtonMask: 0,
          isTouchActive: true
        });

        cornerstoneTools.setToolActive('StackScrollMultiTouch', {
          mouseButtonMask: 0,
          isTouchActive: true
        });

        // TODO: We should probably configure this somewhere else
        cornerstoneTools.stackPrefetch.setConfiguration({
          maxImagesToPrefetch: Infinity,
          preserveExistingPool: false,
          maxSimultaneousRequests: 6
        });

        /* For mouse devices, by default we turn on:
        - Stack scrolling by mouse wheel
        - Stack scrolling by keyboard up / down arrow keys
        - Pan with middle click
        - Zoom with right click
        */
        cornerstoneTools.setToolActive('StackScrollMouseWheel', {
          mouseButtonMask: 0,
          isTouchActive: true
        });

        this.eventHandlerData.forEach(data => {
          const { eventTarget, eventType, handler } = data;

          eventTarget.addEventListener(eventType, handler);
        });

        this.setState({
          viewportHeight: `${this.element.clientHeight - 20}px`
        });
      },
      error => {
        console.error(error);

        this.setState({
          error
        });
      }
    );
  }

  onDoubleClick = event => {
    if (this.props.onDoubleClick) {
      this.props.onDoubleClick(event);
    }
  };

  componentWillUnmount() {
    this.eventHandlerData.forEach(data => {
      const { eventTarget, eventType, handler } = data;

      eventTarget.removeEventListener(eventType, handler);
    });

    const element = this.element;

    // Clear the stack prefetch data
    // TODO[cornerstoneTools]: Make this happen internally
    cornerstoneTools.clearToolState(element, 'stackPrefetch');

    // Disable the viewport element with Cornerstone
    // This also triggers the removal of the element from all available
    // synchronizers, such as the one used for reference lines.
    cornerstone.disable(element);

    // Try to stop any currently playing clips
    // Otherwise the interval will continuously throw errors
    // TODO[cornerstoneTools]: Make this happen internally
    try {
      const enabledElement = cornerstone.getEnabledElement(element);
      if (enabledElement) {
        cornerstoneTools.stopClip(element);
      }
    } catch (error) {
      //console.warn(error);
    }

    if (this.props.clearViewportSpecificData) {
      this.props.clearViewportSpecificData();
    }
  }

  componentDidUpdate(prevProps) {
    // TODO: Add a real object shallow comparison here?

    if (
      this.state.displaySetInstanceUid !==
      this.props.viewportData.displaySetInstanceUid
    ) {
      const {
        displaySetInstanceUid,
        studyInstanceUid
      } = this.props.viewportData;

      const currentImageIdIndex = this.props.viewportData.stack
        .currentImageIdIndex;

      const stack = this.props.viewportData.stack;
      const stackData = cornerstoneTools.getToolState(this.element, 'stack');
      let currentStack = stackData && stackData.data[0];

      if (!currentStack) {
        currentStack = {
          currentImageIdIndex,
          imageIds: stack.imageIds
        };

        cornerstoneTools.addStackStateManager(this.element, ['stack']);
        cornerstoneTools.addToolState(this.element, 'stack', currentStack);
      } else {
        // TODO: we should make something like setToolState by an ID
        currentStack.currentImageIdIndex = currentImageIdIndex;
        currentStack.imageIds = stack.imageIds;
      }

      const imageId = currentStack.imageIds[currentImageIdIndex];

      const viewportSpecificData = {
        displaySetInstanceUid,
        studyInstanceUid,
        stack,
        imageId
      };

      this.setState(viewportSpecificData);

      /*
      Temporarily removed because it didn't seem to be performing well
      if (this.props.setViewportSpecificData) {
        this.props.setViewportSpecificData(viewportSpecificData);
      }*/

      cornerstoneTools.stackPrefetch.disable(this.element);
      cornerstone.loadAndCacheImage(imageId).then(image => {
        try {
          cornerstone.getEnabledElement(this.element);
        } catch (error) {
          // Handle cases where the user ends the session before the image is displayed.
          console.error(error);
          return;
        }

        const viewport = cornerstone.getDefaultViewportForImage(
          this.element,
          image
        );

        // Workaround for Cornerstone issue #304
        viewport.displayedArea.brhc = {
          x: image.width,
          y: image.height
        };

        cornerstone.displayImage(this.element, image, viewport);

        cornerstoneTools.stackPrefetch.enable(this.element);
      });
    }

    if (this.props.activeTool !== prevProps.activeTool) {
      this.setActiveTool(this.props.activeTool);

      // TODO: Why do we need to do this in v3?
      cornerstoneTools.setToolActive('StackScrollMouseWheel', {
        mouseButtonMask: 0,
        isTouchActive: true
      });
    }

    if (this.props.layout !== prevProps.layout) {
      this.debouncedResize();
    }

    if (
      this.props.enableStackPrefetch !== prevProps.enableStackPrefetch &&
      this.props.enableStackPrefetch === true
    ) {
      cornerstoneTools.stackPrefetch.enable(this.element);
    } else if (
      this.props.enableStackPrefetch !== prevProps.enableStackPrefetch &&
      this.props.enableStackPrefetch === false
    ) {
      cornerstoneTools.stackPrefetch.disable(this.element);
    }

    if (
      this.props.cineToolData.isPlaying !== prevProps.cineToolData.isPlaying
    ) {
      if (this.props.cineToolData.isPlaying) {
        cornerstoneTools.playClip(this.element);
      } else {
        cornerstoneTools.stopClip(this.element);

        const stackData = cornerstoneTools.getToolState(this.element, 'stack');
        const stack = stackData.data[0];

        if (this.props.setViewportSpecificData) {
          this.props.setViewportSpecificData({ stack });
        }
      }
    }

    if (
      this.props.cineToolData.cineFrameRate !==
      prevProps.cineToolData.cineFrameRate
    ) {
      if (this.props.cineToolData.isPlaying) {
        cornerstoneTools.playClip(
          this.element,
          this.props.cineToolData.cineFrameRate
        );
      } else {
        cornerstoneTools.stopClip(
          this.element,
          this.props.cineToolData.cineFrameRate
        );
      }
    }
  }

  setActiveTool = activeTool => {
    // TODO: cache these, update it on componentDidUpdate
    const leftMouseToolNames = this.props.availableTools
      .filter(tool => {
        if (!tool.mouseButtonMasks) {
          return;
        }

        return tool.mouseButtonMasks.includes(1);
      })
      .map(tool => tool.name);

    const leftMouseToolsWithAnotherButtonMask = this.props.availableTools.filter(
      tool => {
        if (!tool.mouseButtonMasks) {
          return;
        }

        return (
          tool.mouseButtonMasks.includes(1) && tool.mouseButtonMasks.length > 1
        );
      }
    );

    try {
      setToolsPassive(cornerstoneTools, leftMouseToolNames);
    } catch (error) {
      // TODO: Looks like the Brush tool is calling updateImage, which is
      // failing because the image is not available yet in the enabledElement?
      // (Although I would have expected it to be there after displayImage is
      // called...)
      console.warn(error);
    }

    // This turns e.g. the Zoom and Pan tools back to active, if they
    // were bound to e.g. [1,2] or [1,4]
    leftMouseToolsWithAnotherButtonMask.forEach(tool => {
      const mouseButtonMask = tool.mouseButtonMasks.filter(mask => mask !== 1);
      cornerstoneTools.setToolActive(tool.name, {
        mouseButtonMask
      });
    });

    cornerstoneTools.setToolActive(activeTool, {
      mouseButtonMask: 1,
      isTouchActive: true
    });
  };

  onStackScroll = event => {
    this.setViewportActive();

    const element = event.currentTarget;
    const stackData = cornerstoneTools.getToolState(element, 'stack');
    const stack = stackData.data[0];

    this.setState({
      stack
    });

    /*
    TODO: call this, but debounce it

    Temporarily removed because it didn't seem to be performing well
    if (this.props.setViewportSpecificData) {
      this.props.setViewportSpecificData({ stack });
    }*/
  };

  onImageLoaded = () => {
    this.setState({
      numImagesLoaded: this.state.numImagesLoaded + 1
    });
  };

  startLoadingHandler = () => {
    clearTimeout(this.loadHandlerTimeout);
    this.loadHandlerTimeout = setTimeout(() => {
      this.setState({
        isLoading: true
      });
    }, CornerstoneViewport.loadIndicatorDelay);
  };

  doneLoadingHandler = () => {
    clearTimeout(this.loadHandlerTimeout);

    this.setState({
      isLoading: false
    });
  };

  onMeasurementAdded = event => {
    if (this.props.onMeasurementsChanged) {
      this.props.onMeasurementsChanged(event, 'added');
    }
  };

  onMeasurementRemoved = event => {
    if (this.props.onMeasurementsChanged) {
      this.props.onMeasurementsChanged(event, 'removed');
    }
  };

  onMeasurementModified = event => {
    if (this.props.onMeasurementsChanged) {
      this.props.onMeasurementsChanged(event, 'modified');
    }
  };

  setViewportActive = () => {
    if (!this.props.isActive && this.props.setViewportActive) {
      this.props.setViewportActive();
    }
  };

  onMouseClick = event => {
    this.setViewportActive();

    if (event.detail.event.which === 3) {
      if (this.props.onRightClick) {
        this.props.onRightClick(event);
      }
    }
  };

  onTouchPress = event => {
    this.setViewportActive();

    if (this.props.onTouchPress) {
      this.props.onTouchPress(event);
    }
  };

  onTouchStart = () => {
    this.setViewportActive();
  };

  imageSliderOnInputCallback = value => {
    this.setViewportActive();
    /*
    Temporarily removed because it didn't seem to be performing well
    if (this.props.setViewportSpecificData) {
      this.props.setViewportSpecificData({ stack });
    }*/

    scrollToIndex(this.element, value);

    const stack = this.state.stack;
    stack.currentImageIdIndex = value;

    this.setState({
      stack
    });
  };
}

export default CornerstoneViewport;
