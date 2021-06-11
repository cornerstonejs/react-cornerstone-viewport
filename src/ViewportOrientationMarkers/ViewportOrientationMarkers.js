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
    right: rowString,
    bottom: columnString,
  };

  // If any vertical or horizontal flips are applied, change the orientation strings ahead of
  // the rotation applications
  if (isFlippedVertically) {
    markers.top = invertOrientationString(markers.top);
    markers.bottom = invertOrientationString(markers.bottom);
  }

  if (isFlippedHorizontally) {
    markers.left = invertOrientationString(markers.left);
    markers.right = invertOrientationString(markers.right);
  }

  // Swap the labels accordingly if the viewport has been rotated
  // This could be done in a more complex way for intermediate rotation values (e.g. 45 degrees)
  if (rotationDegrees === 90 || rotationDegrees === -270) {
    return {
      top: markers.left,
      left: invertOrientationString(markers.top),
      right: invertOrientationString(markers.bottom),
      bottom: markers.right, // left
    };
  } else if (rotationDegrees === -90 || rotationDegrees === 270) {
    return {
      top: invertOrientationString(markers.left),
      left: markers.top,
      bottom: markers.left,
      right: markers.bottom,
    };
  } else if (rotationDegrees === 180 || rotationDegrees === -180) {
    return {
      top: invertOrientationString(markers.top),
      left: invertOrientationString(markers.left),
      bottom: invertOrientationString(markers.bottom),
      right: invertOrientationString(markers.right),
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
    orientationMarkers: PropTypes.arrayOf(PropTypes.string),
  };

  static defaultProps = {
    orientationMarkers: ['top', 'left'],
  };

  render() {
    const {
      rowCosines,
      columnCosines,
      rotationDegrees,
      isFlippedVertically,
      isFlippedHorizontally,
      orientationMarkers,
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

    const getMarkers = orientationMarkers =>
      orientationMarkers.map((m, index) => (
        <div
          className={`${m}-mid orientation-marker`}
          key={`${m}-mid orientation-marker`}
        >
          {markers[m]}
        </div>
      ));

    return (
      <div className="ViewportOrientationMarkers noselect">
        {getMarkers(orientationMarkers)}
      </div>
    );
  }
}

export default ViewportOrientationMarkers;
