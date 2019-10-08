import { PureComponent } from 'react';
import React from 'react';
import PropTypes from 'prop-types';
import cornerstoneTools from 'cornerstone-tools';
import './ViewportOrientationMarkers.css';

/**
 *
 * Computes the orientation labels on a Cornerstone-enabled Viewport element
 * when the viewport settings change (e.g. when a horizontal flip or a rotation occurs)
 *
 * @param {*} rowCosines
 * @param {*} columnCosines
 * @param {*} rotationDegrees
 * @param {*} isFlippedVertically
 * @param {*} isFlippedHorizontally
 * @returns
 */
function getOrientationMarkers(
  rowCosines,
  columnCosines,
  rotationDegrees,
  isFlippedVertically,
  isFlippedHorizontally
) {
  const {
    getOrientationString,
    invertOrientationString,
  } = cornerstoneTools.orientation;
  const rowString = getOrientationString(rowCosines);
  const columnString = getOrientationString(columnCosines);
  const oppositeRowString = invertOrientationString(rowString);
  const oppositeColumnString = invertOrientationString(columnString);

  const markers = {
    top: oppositeColumnString,
    left: oppositeRowString,
  };

  // If any vertical or horizontal flips are applied, change the orientation strings ahead of
  // the rotation applications
  if (isFlippedVertically) {
    markers.top = invertOrientationString(markers.top);
  }

  if (isFlippedHorizontally) {
    markers.left = invertOrientationString(markers.left);
  }

  // Swap the labels accordingly if the viewport has been rotated
  // This could be done in a more complex way for intermediate rotation values (e.g. 45 degrees)
  if (rotationDegrees === 90 || rotationDegrees === -270) {
    return {
      top: markers.left,
      left: invertOrientationString(markers.top),
    };
  } else if (rotationDegrees === -90 || rotationDegrees === 270) {
    return {
      top: invertOrientationString(markers.left),
      left: markers.top,
    };
  } else if (rotationDegrees === 180 || rotationDegrees === -180) {
    return {
      top: invertOrientationString(markers.top),
      left: invertOrientationString(markers.left),
    };
  }

  return markers;
}

class ViewportOrientationMarkers extends PureComponent {
  static propTypes = {
    rowCosines: PropTypes.array.isRequired,
    columnCosines: PropTypes.array.isRequired,
    rotationDegrees: PropTypes.number.isRequired,
    isFlippedVertically: PropTypes.bool.isRequired,
    isFlippedHorizontally: PropTypes.bool.isRequired,
  };

  render() {
    const {
      rowCosines,
      columnCosines,
      rotationDegrees,
      isFlippedVertically,
      isFlippedHorizontally,
    } = this.props;

    if (!rowCosines || !columnCosines) {
      return '';
    }

    const markers = getOrientationMarkers(
      rowCosines,
      columnCosines,
      rotationDegrees,
      isFlippedVertically,
      isFlippedHorizontally
    );

    return (
      <div className="ViewportOrientationMarkers noselect">
        <div className="top-mid orientation-marker">{markers.top}</div>
        <div className="left-mid orientation-marker">{markers.left}</div>
      </div>
    );
  }
}

export default ViewportOrientationMarkers;
