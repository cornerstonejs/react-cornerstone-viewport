import { PureComponent } from 'react';
import React from 'react';
import PropTypes from 'prop-types';
import cornerstone from 'cornerstone-core';
import dicomParser from 'dicom-parser';
import { helpers } from '../helpers/index.js';
import './ViewportOverlay.css';

const {
  formatPN,
  formatDA,
  formatNumberPrecision,
  formatTM,
  isValidNumber,
} = helpers;

function getCompression(imageId) {
  const generalImageModule =
    cornerstone.metaData.get('generalImageModule', imageId) || {};
  const {
    lossyImageCompression,
    lossyImageCompressionRatio,
    lossyImageCompressionMethod,
  } = generalImageModule;

  if (lossyImageCompression === '01' && lossyImageCompressionRatio !== '') {
    const compressionMethod = lossyImageCompressionMethod || 'Lossy: ';
    const compressionRatio = formatNumberPrecision(
      lossyImageCompressionRatio,
      2
    );
    return compressionMethod + compressionRatio + ' : 1';
  }

  return 'Lossless / Uncompressed';
}

class ViewportOverlay extends PureComponent {
  static propTypes = {
    viewport: PropTypes.object.isRequired,
    imageId: PropTypes.string.isRequired,
    stack: PropTypes.object.isRequired,
  };

  render() {
    const imageId = this.props.imageId;
    if (!imageId) {
      return null;
    }

    const zoom = this.props.viewport.scale * 100;
    const seriesMetadata =
      cornerstone.metaData.get('generalSeriesModule', imageId) || {};
    const imagePlaneModule =
      cornerstone.metaData.get('imagePlaneModule', imageId) || {};
    const { rows, columns, sliceThickness, sliceLocation } = imagePlaneModule;
    const { seriesNumber, seriesDescription } = seriesMetadata;

    const generalStudyModule =
      cornerstone.metaData.get('generalStudyModule', imageId) || {};
    const { studyDate, studyTime, studyDescription } = generalStudyModule;

    const patientModule =
      cornerstone.metaData.get('patientModule', imageId) || {};
    const { patientId, patientName } = patientModule;

    const generalImageModule =
      cornerstone.metaData.get('generalImageModule', imageId) || {};
    const { instanceNumber } = generalImageModule;

    const cineModule = cornerstone.metaData.get('cineModule', imageId) || {};
    const { frameTime } = cineModule;

    const frameRate = formatNumberPrecision(1000 / frameTime, 1);
    const compression = getCompression(imageId);
    const windowWidth = this.props.viewport.voi.windowWidth || 0;
    const windowCenter = this.props.viewport.voi.windowCenter || 0;
    const wwwc = `W: ${windowWidth.toFixed(0)} L: ${windowCenter.toFixed(0)}`;

    const { imageIds } = this.props.stack;
    const imageIndex = imageIds.indexOf(this.props.imageId) + 1;
    const numImages = imageIds.length;
    const imageDimensions = `${columns} x ${rows}`;

    const normal = (
      <React.Fragment>
        <div className="top-left overlay-element">
          <div>{formatPN(patientName)}</div>
          <div>{patientId}</div>
        </div>
        <div className="top-right overlay-element">
          <div>{studyDescription}</div>
          <div>
            {formatDA(studyDate)} {formatTM(studyTime)}
          </div>
        </div>
        <div className="bottom-right overlay-element">
          <div>Zoom: {formatNumberPrecision(zoom, 0)}%</div>
          <div>{wwwc}</div>
          <div className="compressionIndicator">{compression}</div>
        </div>
        <div className="bottom-left overlay-element">
          <div>{seriesNumber >= 0 ? `Ser: ${seriesNumber}` : ''}</div>
          <div>
            {numImages > 1
              ? `Img: ${instanceNumber} ${imageIndex}/${numImages}`
              : ''}
          </div>
          <div>
            {frameRate >= 0 ? `${formatNumberPrecision(frameRate, 2)} FPS` : ''}
            <div>{imageDimensions}</div>
            <div>
              {isValidNumber(sliceLocation)
                ? `Loc: ${formatNumberPrecision(sliceLocation, 2)} mm `
                : ''}
              {sliceThickness
                ? `Thick: ${formatNumberPrecision(sliceThickness, 2)} mm`
                : ''}
            </div>
            <div>{seriesDescription}</div>
          </div>
        </div>
      </React.Fragment>
    );

    const rightOnly = (
      <React.Fragment>
        <div className="top-right overlay-element">
          <div>{formatPN(patientName)}</div>
          <div>{patientId}</div>
          <div>{studyDescription}</div>
          <div>
            {formatDA(studyDate)} {formatTM(studyTime)}
          </div>
        </div>
        <div className="bottom-right overlay-element">
          <div>{seriesNumber >= 0 ? `Ser: ${seriesNumber}` : ''}</div>
          <div>
            {numImages > 1
              ? `Img: ${instanceNumber} ${imageIndex}/${numImages}`
              : ''}
          </div>
          <div>
            {frameRate >= 0 ? `${formatNumberPrecision(frameRate, 2)} FPS` : ''}
          </div>
          <div>{imageDimensions}</div>
          <div>{seriesDescription}</div>
          <div>Zoom: {formatNumberPrecision(zoom, 0)}%</div>
          <div className="compressionIndicator">{compression}</div>
          <div>{wwwc}</div>
        </div>
      </React.Fragment>
    );

    const leftOnly = (
      <React.Fragment>
        <div className="top-left overlay-element">
          <div>{formatPN(patientName)}</div>
          <div>{patientId}</div>
          <div>{studyDescription}</div>
          <div>
            {formatDA(studyDate)} {formatTM(studyTime)}
          </div>
        </div>
        <div className="bottom-left overlay-element">
          <div>{seriesNumber >= 0 ? `Ser: ${seriesNumber}` : ''}</div>
          <div>
            {numImages > 1
              ? `Img: ${instanceNumber} ${imageIndex}/${numImages}`
              : ''}
          </div>
          <div>
            {frameRate >= 0 ? `${formatNumberPrecision(frameRate, 2)} FPS` : ''}
          </div>
          <div>{imageDimensions}</div>
          <div>{seriesDescription}</div>
          <div>Zoom: {formatNumberPrecision(zoom, 0)}%</div>
          <div className="compressionIndicator">{compression}</div>
          <div>{wwwc}</div>
        </div>
      </React.Fragment>
    );

    return <div className="ViewportOverlay">{normal}</div>;
  }
}

export default ViewportOverlay;
