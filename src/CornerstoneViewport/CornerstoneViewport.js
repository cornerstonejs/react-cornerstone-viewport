// - Fix `imageId` reliance for metadata?
//
// - start/end load Handlers may need to share w/ props, as there can only be one
//
// - After getting everything to work w/o updates, phase in changes that should be reactive from props.
//
// yarn link to extension -- special note of props specific to pulling out state?

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImageScrollbar from '../ImageScrollbar/ImageScrollbar.js';
import ViewportOverlay from '../ViewportOverlay/ViewportOverlay.js';
import LoadingIndicator from '../LoadingIndicator/LoadingIndicator.js';
import ViewportOrientationMarkers from '../ViewportOrientationMarkers/ViewportOrientationMarkers.js';
import cornerstone from 'cornerstone-core';
import cornerstoneTools from 'cornerstone-tools';

// Util
import areStringArraysEqual from './../helpers/areStringArraysEqual.js';

import './CornerstoneViewport.css';

const scrollToIndex = cornerstoneTools.importInternal('util/scrollToIndex');
const { loadHandlerManager } = cornerstoneTools;

class CornerstoneViewport extends Component {
  static defaultProps = {
    imageIdIndex: 0,
    cornerstoneOptions: {},
    isStackPrefetchEnabled: true,
    cineToolData: {
      isPlaying: false,
      cineFrameRate: 24,
    },
    viewportOverlayComponent: ViewportOverlay,
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
    //
    cineToolData: PropTypes.object.isRequired,
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
    style: PropTypes.object,
  };

  static loadIndicatorDelay = 45;

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

  render() {
    const isLoading = this.state.isLoading;
    const displayLoadingIndicator = isLoading || this.state.error;

    let className = 'CornerstoneViewport';

    const scrollbarMax = this.props.imageIds.length - 1;
    const scrollbarHeight = this.element
      ? `${this.element.clientHeight - 20}px`
      : '100px';

    return (
      <div className={className} style={this.props.style}>
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

  // ~~ LIFECYCLE
  async componentDidMount() {
    console.warn('CornerstoneViewport: componentDidMount');
    const {
      tools,
      isStackPrefetchEnabled,
      cornerstoneOptions,
      imageIds,
    } = this.props;
    const { imageIdIndex } = this.state;
    const imageId = imageIds[imageIdIndex];

    // EVENTS
    this._bindInternalEventListeners();
    this._bindExternalEventListeners();
    this._handleOnElementEnabledEvent();

    // Fire 'er up
    cornerstone.enable(this.element, cornerstoneOptions);

    // TODO: careful.. There can only be one
    loadHandlerManager.setStartLoadHandler(
      this.startLoadingHandler,
      this.element
    );
    loadHandlerManager.setEndLoadHandler(this.doneLoadingHandler, this.element);

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
      this.trySetActiveTool();
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
    // `componentDidUpdate` is currently called every render and `newImage`
    const { imageIds: stack, imageIdIndex: imageIndex } = this.props;
    const { imageIds: prevStack, imageIdIndex: prevImageIndex } = prevProps;
    const hasStackChanged = !areStringArraysEqual(prevStack, stack);
    const hasImageIndexChanged = imageIndex !== prevImageIndex;

    if (hasStackChanged) {
      // update stack toolstate
      cornerstoneTools.clearToolState(this.element, 'stack');
      cornerstoneTools.addToolState(this.element, 'stack', {
        imageIds: [...stack],
        currentImageIdIndex: imageIndex,
      });

      // reset viewport (fit to window)
      // load + display image
    } else if (!hasStackChanged && hasImageIndexChanged) {
      scrollToIndex(this.element, imageIndex);
    }

    //   try {
    //     // TODO: Why is this here?
    //     // cornerstoneTools.stackPrefetch.disable(this.element);

    //     // TODO: Handle cases where the user ends the session before the image is displayed.
    //     const image = await cornerstone.loadAndCacheImage(imageId);

    //     cornerstone.displayImage(this.element, image);

    //     // TODO: We just re-enable it?
    //     // cornerstoneTools.stackPrefetch.enable(this.element);
    //   } catch (err) {}

    //   if (this.props.activeTool !== prevProps.activeTool) {
    //     this.setActiveTool(this.props.activeTool);
    //   }

    //   // TODO: int, 0 is paused?
    //   if (
    //     this.props.cineToolData.isPlaying !== prevProps.cineToolData.isPlaying
    //   ) {
    //     if (this.props.cineToolData.isPlaying) {
    //       cornerstoneTools.playClip(this.element);
    //     } else {
    //       cornerstoneTools.stopClip(this.element);
    //     }
    //   }

    //   if (
    //     this.props.cineToolData.cineFrameRate !==
    //     prevProps.cineToolData.cineFrameRate
    //   ) {
    //     if (this.props.cineToolData.isPlaying) {
    //       cornerstoneTools.playClip(
    //         this.element,
    //         this.props.cineToolData.cineFrameRate
    //       );
    //     } else {
    //       cornerstoneTools.stopClip(
    //         this.element,
    //         this.props.cineToolData.cineFrameRate
    //       );
    //     }
    //   }
  }

  componentWillUnmount() {
    const clear = true;

    this._bindInternalEventListeners(clear);
    this._bindExternalEventListeners(clear);
    cornerstoneTools.clearToolState(this.element, 'stackPrefetch');
    cornerstoneTools.stopClip(this.element);
    cornerstone.disable(this.element);
  }

  /**
   *
   *
   * @param {boolean} [clear=false]
   * @memberof CornerstoneViewport
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
   * @param {boolean} [clear=false]
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
   *
   *
   * @memberof CornerstoneViewport
   */
  _handleOnElementEnabledEvent = () => {
    const handler = evt => {
      const elementThatWasEnabled = evt.detail.element;
      if (elementThatWasEnabled === this.element) {
        // Pass Event
        if (this.props.onElementEnabled) {
          this.props.onElementEnabled(evt);
        }
        // Stop Listening
        cornerstone.events.removeEventListener(
          cornerstone.EVENTS.ELEMENT_ENABLED,
          handler
        );
      }
    };

    // Start Listening
    cornerstone.events.addEventListener(
      cornerstone.EVENTS.ELEMENT_ENABLED,
      handler
    );
  };

  /**
   *
   * @param {string} [activeTool]
   *
   * @memberof CornerstoneViewport
   */
  trySetActiveTool = () => {
    if (!this.props.activeTool) {
      return;
    }

    cornerstoneTools.setToolActiveForElement(
      this.element,
      this.props.activeTool,
      {
        mouseButtonMask: 1,
      }
    );
  };

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

  // onImageLoaded = () => {
  //   // This is not necessarily true :thinking:
  //   this.setState({
  //     numImagesLoaded: this.state.numImagesLoaded + 1,
  //   });
  // };

  startLoadingHandler = () => {
    clearTimeout(this.loadHandlerTimeout);
    this.loadHandlerTimeout = setTimeout(() => {
      this.setState({
        isLoading: true,
      });
    }, CornerstoneViewport.loadIndicatorDelay);
  };

  doneLoadingHandler = () => {
    clearTimeout(this.loadHandlerTimeout);
    this.setState({
      isLoading: false,
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
