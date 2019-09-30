// - Fix `imageId` reliance for metadata?
// - After getting everything to work w/o updates, phase in changes that should be reactive from props.
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ImageScrollbar from '../ImageScrollbar/ImageScrollbar.js';
import ViewportOverlay from '../ViewportOverlay/ViewportOverlay.js';
import LoadingIndicator from '../LoadingIndicator/LoadingIndicator.js';
import ViewportOrientationMarkers from '../ViewportOrientationMarkers/ViewportOrientationMarkers.js';
import windowResizeHandler from './windowResizeHandler.js';
import cornerstone from 'cornerstone-core';
import cornerstoneTools from 'cornerstone-tools';
import ReactResizeDetector from 'react-resize-detector/lib/index.js';

// Util
import areStringArraysEqual from './../helpers/areStringArraysEqual.js';

import './CornerstoneViewport.css';

const scrollToIndex = cornerstoneTools.importInternal('util/scrollToIndex');
const { loadHandlerManager } = cornerstoneTools;

class CornerstoneViewport extends Component {
  static defaultProps = {
    // Watch
    imageIdIndex: 0,
    isPlaying: false,
    cineFrameRate: 24,
    viewportOverlayComponent: ViewportOverlay,
    // Init
    cornerstoneOptions: {},
    isStackPrefetchEnabled: true,
    loadIndicatorDelay: 45,
    resizeThrottleMs: 200,
    tools: [],
  };

  static propTypes = {
    imageIds: PropTypes.arrayOf(PropTypes.string).isRequired,
    imageIdIndex: PropTypes.number,
    // Controlled
    activeTool: PropTypes.string,
    tools: PropTypes.arrayOf(
      PropTypes.oneOfType([
        // String
        PropTypes.string,
        // Object
        PropTypes.shape({
          name: PropTypes.string, // Tool Name
          toolClass: PropTypes.func, // Custom (ToolClass)
          props: PropTypes.Object, // Props to Pass to `addTool`
          mode: PropTypes.string, // Initial mode, if one other than default
          modeOptions: PropTypes.Object, // { mouseButtonMask: [int] }
        }),
      ])
    ),
    // Optional
    // isActive ?? classname -> active
    children: PropTypes.node,
    cornerstoneOptions: PropTypes.object, // cornerstone.enable options
    isStackPrefetchEnabled: PropTypes.bool, // should prefetch?
    // CINE
    isPlaying: PropTypes.bool,
    frameRate: PropTypes.number, // Between 1 and ?
    //
    setViewportActive: PropTypes.func, // Called when viewport should be set to active?
    viewportOverlayComponent: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.func,
    ]),
    // Cornerstone Events
    onElementEnabled: PropTypes.func, // Escape hatch
    eventListeners: PropTypes.arrayOf(
      PropTypes.shape({
        target: PropTypes.oneOf(['element', 'cornerstone']).isRequired,
        eventName: PropTypes.string.isRequired,
        handler: PropTypes.func.isRequired,
      })
    ),
    startLoadHandler: PropTypes.func,
    endLoadHandler: PropTypes.func,
    loadIndicatorDelay: PropTypes.number,
    resizeThrottleMs: PropTypes.number, // 0 to disable
    //
    style: PropTypes.object,
    className: PropTypes.string,
  };

  constructor(props) {
    super(props);

    const imageIdIndex = props.imageIdIndex;
    const imageId = props.imageIds[imageIdIndex];

    this.state = {
      // Used for metadata lookup (imagePlane, orientation markers)
      // We can probs grab this once and hold on to? (updated on newImage)
      imageId,
      imageIdIndex, // Maybe
      isLoading: true,
      numImagesLoaded: 0,
      error: null,
      // Overlay
      scale: undefined,
      windowWidth: undefined,
      windowCenter: undefined,
      // Orientation Markers
      rotationDegrees: undefined,
      isFlippedVertically: undefined,
      isFlippedHorizontally: undefined,
    };

    // TODO: Deep Copy? How does that work w/ handlers?
    // Save a copy. Props could change before `willUnmount`
    this.eventListeners = this.props.eventListeners;
    this.startLoadHandler = this.props.startLoadHandler;
    this.endLoadHandler = this.props.endLoadHandler;
    this.loadHandlerTimeout = undefined; // "Loading..." timer
  }

  // ~~ LIFECYCLE
  async componentDidMount() {
    const {
      tools,
      isStackPrefetchEnabled,
      cornerstoneOptions,
      imageIds,
      resizeThrottleMs,
    } = this.props;
    const { imageIdIndex } = this.state;
    const imageId = imageIds[imageIdIndex];

    // EVENTS
    this._bindInternalEventListeners();
    this._bindExternalEventListeners();
    this._handleOnElementEnabledEvent();

    // Fire 'er up
    cornerstone.enable(this.element, cornerstoneOptions);
    if (resizeThrottleMs) {
      windowResizeHandler.enable(this.element, resizeThrottleMs);
    }

    // Only after `uuid` is set for enabledElement
    this._setupLoadHandlers();

    try {
      // Load first image in stack
      const image = await cornerstone.loadAndCacheImage(imageId);

      // Display
      cornerstone.displayImage(this.element, image);
      // Setup "Stack State"
      cornerstoneTools.clearToolState(this.element, 'stack');
      cornerstoneTools.addStackStateManager(this.element, [
        'stack',
        'playClip',
        'referenceLines',
      ]);
      cornerstoneTools.addToolState(this.element, 'stack', {
        imageIds: [...imageIds],
        currentImageIdIndex: imageIdIndex,
      });

      if (isStackPrefetchEnabled) {
        _enableStackPrefetching(this.element);
      }

      _addAndConfigureInitialToolsForElement(tools, this.element);
      _trySetActiveTool(this.element, this.props.activeTool);
      this.setState({ isLoading: false });
    } catch (error) {
      console.error(error);
      this.setState({ error });
    }
  }

  // I pretty much only care here if the stack's updated, right?
  async componentDidUpdate(prevProps, prevState) {
    // TODO: Expensive compare?
    // It's actually most expensive when there are _no changes_
    // We could _not_ update for stack changes, and instead use identity compare
    // Where... If "StackUniqueIdentifier" has changed (displaySet/StudyId)
    // `componentDidUpdate` is currently called every render and `newImage`

    // ~~ STACK/IMAGE
    const { imageIds: stack, imageIdIndex: imageIndex } = this.props;
    const { imageIds: prevStack, imageIdIndex: prevImageIndex } = prevProps;
    const hasStackChanged = !areStringArraysEqual(prevStack, stack);
    const hasImageIndexChanged = imageIndex !== prevImageIndex;
    let updatedState = {};

    if (hasStackChanged) {
      // update stack toolstate
      cornerstoneTools.clearToolState(this.element, 'stack');
      cornerstoneTools.addToolState(this.element, 'stack', {
        imageIds: [...stack],
        currentImageIdIndex: imageIndex,
      });

      // New stack; reset counter
      updatedState['numImagesLoaded'] = 0;

      try {
        // cornerstoneTools.stackPrefetch.disable(this.element);
        // load + display image
        const imageId = stack[imageIndex];
        const image = await cornerstone.loadAndCacheImage(imageId);

        cornerstone.displayImage(this.element, image);
        cornerstone.reset(this.element);
        // cornerstoneTools.stackPrefetch.enable(this.element);
      } catch (err) {
        // :wave:
        // What if user kills component before `displayImage`?
      }
    } else if (!hasStackChanged && hasImageIndexChanged) {
      scrollToIndex(this.element, imageIndex);
    }

    // ~~ ACTIVE TOOL
    const { activeTool } = this.props;
    const { activeTool: prevActiveTool } = prevProps;
    const hasActiveToolChanges = activeTool !== prevActiveTool;

    if (hasActiveToolChanges) {
      _trySetActiveTool(this.element, activeTool);
    }

    // ~~ CINE
    const { frameRate, isPlaying } = this.props;
    const { frameRate: prevFrameRate, isPlaying: prevIsPlaying } = prevProps;
    const validFrameRate = Math.max(frameRate, 1);
    const shouldStart = isPlaying !== prevIsPlaying && isPlaying;
    const shouldPause = isPlaying !== prevIsPlaying && !isPlaying;
    const hasFrameRateChanged = isPlaying && frameRate !== prevFrameRate;

    if (shouldStart || hasFrameRateChanged) {
      cornerstoneTools.playClip(this.element, validFrameRate);
    } else if (shouldPause) {
      cornerstoneTools.stopClip(this.element);
    }

    // ~~ STATE: Update aggregated state changes
    if (Object.keys(updatedState).length > 0) {
      this.setState(updatedState);
    }
  }

  /**
   * Tear down any listeners/handlers, and stop any asynchronous/queued operations
   * that could fire after Unmount and cause errors.
   *
   * @memberof CornerstoneViewport
   * @returns {undefined}
   */
  componentWillUnmount() {
    const clear = true;

    this._bindInternalEventListeners(clear);
    this._bindExternalEventListeners(clear);
    this._setupLoadHandlers(clear);
    cornerstoneTools.clearToolState(this.element, 'stackPrefetch');
    cornerstoneTools.stopClip(this.element);
    if (this.props.resizeThrottleMs) windowResizeHandler.disable(this.element);
    cornerstone.disable(this.element);
  }

  /**
   *
   *
   * @returns
   * @memberof CornerstoneViewport
   */
  getOverlay() {
    const { viewportOverlayComponent: Component, imageIds } = this.props;
    const { imageIdIndex, scale, windowWidth, windowCenter } = this.state;
    const imageId = imageIds[imageIdIndex];

    return (
      imageId &&
      windowWidth && (
        <Component
          imageIndex={imageIdIndex + 1}
          stackSize={imageIds.length}
          scale={scale}
          windowWidth={windowWidth}
          windowCenter={windowCenter}
          imageId={imageId}
        />
      )
    );
  }

  /**
   *
   *
   * @returns
   * @memberof CornerstoneViewport
   */
  getOrientationMarkersOverlay() {
    const { imageIds } = this.props;
    const {
      imageIdIndex,
      rotationDegrees,
      isFlippedVertically,
      isFlippedHorizontally,
    } = this.state;
    const imageId = imageIds[imageIdIndex];

    // Workaround for below TODO stub
    if (!imageId) {
      return false;
    }
    // TODO: This is throwing an error with an undefined `imageId`, and it shouldn't be
    const { rowCosines, columnCosines } =
      cornerstone.metaData.get('imagePlaneModule', imageId) || {};

    if (!rowCosines || !columnCosines || rotationDegrees === undefined) {
      return false;
    }

    return (
      <ViewportOrientationMarkers
        rowCosines={rowCosines}
        columnCosines={columnCosines}
        rotationDegrees={rotationDegrees}
        isFlippedVertically={isFlippedVertically}
        isFlippedHorizontally={isFlippedHorizontally}
      />
    );
  }

  /**
   *
   *
   * @param {boolean} [clear=false] - True to clear event listeners
   * @memberof CornerstoneViewport
   * @returns {undefined}
   */
  _bindInternalEventListeners(clear = false) {
    const addOrRemoveEventListener = clear
      ? 'removeEventListener'
      : 'addEventListener';

    // Updates state's imageId, and imageIndex
    this.element[addOrRemoveEventListener](
      cornerstone.EVENTS.NEW_IMAGE,
      this.onNewImage
    );

    // Update our "Images Loaded" count.
    // Better than nothing?
    this.element[addOrRemoveEventListener](
      cornerstone.EVENTS.IMAGE_LOADED,
      this.onImageLoaded
    );

    // Updates state's viewport
    this.element[addOrRemoveEventListener](
      cornerstone.EVENTS.IMAGE_RENDERED,
      this.onImageRendered
    );

    // Set Viewport Active
    this.element[addOrRemoveEventListener](
      cornerstoneTools.EVENTS.MOUSE_CLICK,
      this.setViewportActive
    );
    this.element[addOrRemoveEventListener](
      cornerstoneTools.EVENTS.MOUSE_DOWN,
      this.setViewportActive
    );
    this.element[addOrRemoveEventListener](
      cornerstoneTools.EVENTS.TOUCH_PRESS,
      this.setViewportActive
    );
    this.element[addOrRemoveEventListener](
      cornerstoneTools.EVENTS.TOUCH_START,
      this.setViewportActive
    );
    this.element[addOrRemoveEventListener](
      cornerstoneTools.EVENTS.STACK_SCROLL,
      this.setViewportActive
    );
  }

  /**
   *
   * @param {boolean} [clear=false] - True to clear event listeners
   * @returns {undefined}
   */
  _bindExternalEventListeners(clear = false) {
    if (!this.eventListeners) {
      return;
    }

    const cornerstoneEvents = Object.values(cornerstone.EVENTS);
    const cornerstoneToolsEvents = Object.values(cornerstoneTools.EVENTS);
    const addOrRemoveEventListener = clear
      ? 'removeEventListener'
      : 'addEventListener';

    for (let i = 0; i < this.eventListeners.length; i++) {
      const { target: targetType, eventName, handler } = this.eventListeners[i];
      const target =
        targetType === 'element' ? this.element : cornerstone.events;

      if (
        !cornerstoneEvents.includes(eventName) &&
        !cornerstoneToolsEvents.includes(eventName)
      ) {
        console.warn(
          `No cornerstone or cornerstone-tools event exists for event name: ${eventName}`
        );
        continue;
      }

      target[addOrRemoveEventListener](eventName, handler);
    }
  }

  /**
   * Convenience handler to pass the "Element Enabled" event back up to the
   * parent via a callback. Can be used as an escape hatch for more advanced
   * cornerstone fucntionality.
   *
   * @memberof CornerstoneViewport
   * @returns {undefined}
   */
  _handleOnElementEnabledEvent = () => {
    const handler = evt => {
      const elementThatWasEnabled = evt.detail.element;
      if (elementThatWasEnabled === this.element) {
        // Pass Event
        this.props.onElementEnabled(evt);

        // Stop Listening
        cornerstone.events.removeEventListener(
          cornerstone.EVENTS.ELEMENT_ENABLED,
          handler
        );
      }
    };

    // Start Listening
    if (this.props.onElementEnabled) {
      cornerstone.events.addEventListener(
        cornerstone.EVENTS.ELEMENT_ENABLED,
        handler
      );
    }
  };

  /**
   * There is a "GLOBAL/DEFAULT" load handler for start/end/error,
   * and one that can be defined per element. We use start/end handlers in this
   * component to show the "Loading..." indicator if a loading request is taking
   * longer than expected.
   *
   * Because we're using the "per element" handler, we need to call the user's
   * handler within our own (if it's set). Load Handlers are not well documented,
   * but you can find [their source here]{@link https://github.com/cornerstonejs/cornerstoneTools/blob/master/src/stateManagement/loadHandlerManager.js}
   *
   * @param {boolean} [clear=false] - true to remove previously set load handlers
   * @memberof CornerstoneViewport
   * @returns {undefined}
   */
  _setupLoadHandlers(clear = false) {
    if (clear) {
      loadHandlerManager.removeHandlers(this.element);
      return;
    }

    // We use this to "flip" `isLoading` to true, if our startLoading request
    // takes longer than our "loadIndicatorDelay"
    const startLoadHandler = element => {
      clearTimeout(this.loadHandlerTimeout);

      // Call user defined loadHandler
      if (this.startLoadHandler) {
        this.startLoadHandler(element);
      }

      // We're taking too long. Indicate that we're "Loading".
      this.loadHandlerTimeout = setTimeout(() => {
        this.setState({
          isLoading: true,
        });
      }, this.props.loadIndicatorDelay);
    };

    const endLoadHandler = (element, image) => {
      clearTimeout(this.loadHandlerTimeout);

      // Call user defined loadHandler
      if (this.endLoadHandler) {
        this.endLoadHandler(element, image);
      }

      if (this.state.isLoading) {
        this.setState({
          isLoading: false,
        });
      }
    };

    loadHandlerManager.setStartLoadHandler(startLoadHandler, this.element);
    loadHandlerManager.setEndLoadHandler(endLoadHandler, this.element);
  }

  // TODO: May need to throttle?
  onImageRendered = event => {
    const viewport = event.detail.viewport;

    this.setState({
      scale: viewport.scale,
      windowCenter: viewport.voi.windowCenter,
      windowWidth: viewport.voi.windowWidth,
      rotationDegrees: viewport.rotation,
      isFlippedVertically: viewport.vflip,
      isFlippedHorizontally: viewport.hflip,
    });
  };

  onNewImage = event => {
    const newImageId = event.detail.image.imageId;
    const newImageIdIndex = this.props.imageIds.indexOf(newImageId);

    // TODO: Should we grab and set some imageId specific metadata here?
    // Could prevent cornerstone dependencies in child components.
    this.setState({
      imageIdIndex: newImageIdIndex,
    });
  };

  onImageLoaded = () => {
    // TODO: This is not necessarily true :thinking:
    // We need better cache reporting a layer up
    this.setState({
      numImagesLoaded: this.state.numImagesLoaded + 1,
    });
  };

  imageSliderOnInputCallback = value => {
    this.setViewportActive();

    scrollToIndex(this.element, value);
  };

  setViewportActive = () => {
    if (this.props.setViewportActive) {
      this.props.setViewportActive(); // TODO: should take viewport index/ident?
    }
  };

  render() {
    const isLoading = this.state.isLoading;
    const displayLoadingIndicator = isLoading || this.state.error;
    const scrollbarMax = this.props.imageIds.length - 1;
    const scrollbarHeight = this.element
      ? `${this.element.clientHeight - 20}px`
      : '100px';

    return (
      <div
        style={this.props.style}
        className={classNames('viewport-wrapper', this.props.className)}
      >
        <ReactResizeDetector
          handleWidth
          handleHeight
          skipOnMount={true}
          refreshMode={'throttle'}
          refreshRate={this.props.resizeThrottleMs}
          onResize={() => {
            cornerstone.resize(this.element);
          }}
        />
        <div
          className="viewport-element"
          onContextMenu={e => e.preventDefault()}
          onMouseDown={e => e.preventDefault()}
          ref={input => {
            this.element = input;
          }}
        >
          {displayLoadingIndicator && (
            <LoadingIndicator error={this.state.error} />
          )}
          {/* This classname is important in that it tells `cornerstone` to not
           * create a new canvas element when we "enable" the `viewport-element`
           */}
          <canvas className="cornerstone-canvas" />
          {this.getOverlay()}
          {this.getOrientationMarkersOverlay()}
        </div>
        <ImageScrollbar
          onInputCallback={this.imageSliderOnInputCallback}
          max={scrollbarMax}
          height={scrollbarHeight}
          value={this.state.imageIdIndex}
        />
        {this.props.children}
      </div>
    );
  }
}

/**
 *
 *
 * @param {HTMLElement} element
 * @param {string} activeToolName
 * @returns
 */
function _trySetActiveTool(element, activeToolName) {
  if (!element || !activeToolName) {
    return;
  }

  const validTools = cornerstoneTools.store.state.tools.filter(
    tool => tool.element === element
  );
  const validToolNames = validTools.map(tool => tool.name);

  if (!validToolNames.includes(activeToolName)) {
    console.warn(
      `Trying to set a tool active that is not "added". Available tools include: ${validToolNames.join(
        ', '
      )}`
    );
  }

  cornerstoneTools.setToolActiveForElement(element, activeToolName, {
    mouseButtonMask: 1,
  });
}

// TODO: Move configuration elsewhere
// This is app wide, right?
// Why would we configure this per element?
function _enableStackPrefetching(element) {
  cornerstoneTools.stackPrefetch.setConfiguration({
    maxImagesToPrefetch: Infinity,
    preserveExistingPool: false,
    maxSimultaneousRequests: 6,
  });

  cornerstoneTools.stackPrefetch.enable(element);
}

/**
 * Iterate over the provided tools; Add each tool to the target element
 *
 * @param {string[]|object[]} tools
 * @param {HTMLElement} element
 */
function _addAndConfigureInitialToolsForElement(tools, element) {
  for (let i = 0; i < tools.length; i++) {
    const tool =
      typeof tools[i] === 'string'
        ? { name: tools[i] }
        : Object.assign({}, tools[i]);
    const toolName = `${tool.name}Tool`; // Top level CornerstoneTools follow this pattern

    tool.toolClass = tool.toolClass || cornerstoneTools[toolName];

    if (!tool.toolClass) {
      console.warn(`Unable to add tool with name '${tool.name}'.`);
      continue;
    }

    cornerstoneTools.addToolForElement(
      element,
      tool.toolClass,
      tool.props || {}
    );

    const hasInitialMode =
      tool.mode && AVAILABLE_TOOL_MODES.includes(tool.mode);

    if (hasInitialMode) {
      // TODO: We may need to check `tool.props` and the tool class's prototype
      // to determine the name it registered with cornerstone. `tool.name` is not
      // reliable.
      const setToolModeFn = TOOL_MODE_FUNCTIONS[tool.mode];
      setToolModeFn(element, tool.name, tool.modeOptions || {});
    }
  }
}

const AVAILABLE_TOOL_MODES = ['active', 'passive', 'enabled', 'disabled'];

const TOOL_MODE_FUNCTIONS = {
  active: cornerstoneTools.setToolActiveForElement,
  passive: cornerstoneTools.setToolPassiveForElement,
  enabled: cornerstoneTools.setToolEnabledForElement,
  disabled: cornerstoneTools.setToolDisabledForElement,
};

export default CornerstoneViewport;
