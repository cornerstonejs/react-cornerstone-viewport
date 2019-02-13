import cornerstone from 'cornerstone-core';
import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import dicomParser from 'dicom-parser';

function wadoRsMetaDataProvider(type, imageId) {
  const metaData = cornerstoneWADOImageLoader.wadors.metaDataManager.get(
    imageId
  );

  if (!metaData) {
    return;
  }

  if (
    metaData[type] !== undefined &&
    metaData[type].Value !== undefined &&
    metaData[type].Value.length
  ) {
    return metaData[type].Value[0];
  }

  const typeCleaned = type.replace('x', '');
  if (
    metaData[typeCleaned] !== undefined &&
    metaData[typeCleaned].Value !== undefined &&
    metaData[typeCleaned].Value.length
  ) {
    return metaData[typeCleaned].Value[0];
  }
}

cornerstone.metaData.addProvider(wadoRsMetaDataProvider);

function wadoUriMetaDataProvider(type, imageId) {
  const {
    parseImageId,
    dataSetCacheManager
  } = cornerstoneWADOImageLoader.wadouri;
  const parsedImageId = parseImageId(imageId);
  const dataSet = dataSetCacheManager.get(parsedImageId.url);

  if (!dataSet) {
    return;
  }

  if (dataSet.elements[type] !== undefined) {
    const element = dataSet.elements[type];

    return dicomParser.explicitElementToString(dataSet, element);
  }
}

cornerstone.metaData.addProvider(wadoUriMetaDataProvider);
