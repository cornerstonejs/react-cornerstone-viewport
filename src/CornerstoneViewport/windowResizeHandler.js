import cornerstone from 'cornerstone-core';

const registeredListeners = [];

const enable = function(element) {
  const handler = resizeThrottler.bind(null, element);

  window.addEventListener('resize', handler, false);
  registeredListeners.push({
    element,
    handler,
    cancelToken: undefined,
  });
};

const disable = function(element) {
  const registeredListener = registeredListeners.find(
    listener => listener.element === element
  );
  if (registeredListener) {
    window.removeEventListener('resize', registeredListener.handler, false);
    registeredListeners.splice(
      registeredListeners.indexOf(registeredListener),
      1
    );
  }
};

function resizeThrottler(element) {
  const registeredListener = registeredListeners.find(
    listener => listener.element === element
  );

  // Ignore resize events as long as an actualResizeHandler execution is in the queue
  if (!registeredListener.cancelToken) {
    registeredListener.cancelToken = setTimeout(function() {
      registeredListener.cancelToken = null;
      forceEnabledElementResize(element);

      // The actualResizeHandler will execute at a rate of 15fps
    }, 66);
  }
}

export const forceEnabledElementResize = function(element) {
  element.setAttribute('width', '');
  element.setAttribute('height', '');
  cornerstone.resize(element);
};

export default {
  enable,
  disable,
};
