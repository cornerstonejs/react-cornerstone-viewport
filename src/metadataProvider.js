import cornerstone from 'cornerstone-core';
import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import dicomParser from 'dicom-parser';

const { getNumberValue, getValue } = cornerstoneWADOImageLoader.wadors.metaData;

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

  if (type === 'generalImageModule') {
    return {
      sopInstanceUid: getValue(metaData['00080018']),
      instanceNumber: getNumberValue(metaData['00200013']),
      lossyImageCompression: getValue(metaData['00282110']),
      lossyImageCompressionRatio: getValue(metaData['00282112']),
      lossyImageCompressionMethod: getValue(metaData['00282114']),
    };
  }

  if (type === 'patientModule') {
    return {
      patientName: getValue(metaData['00100010']),
      patientId: getValue(metaData['00100020']),
      patientSex: getValue(metaData['00100040']),
      patientBirthDate: getValue(metaData['00100030']),
    };
  }

  if (type === 'spacingBetweenSlices') {
    return getValue(metaData['00180088']);
  }

  if (type === 'generalStudyModule') {
    return {
      studyDescription: getValue(metaData['00081030']),
      studyDate: getValue(metaData['00080020']),
      studyTime: getValue(metaData['00080030']),
      accessionNumber: getValue(metaData['00080050']),
    };
  }

  if (type === 'cineModule') {
    return {
      frameTime: getNumberValue(metaData['00181063']),
    };
  }
}

cornerstone.metaData.addProvider(wadoRsMetaDataProvider);

function wadoUriMetaDataProvider(type, imageId) {
  const {
    parseImageId,
    dataSetCacheManager,
  } = cornerstoneWADOImageLoader.wadouri;
  const parsedImageId = parseImageId(imageId);
  const dataSet = dataSetCacheManager.get(parsedImageId.url);

  if (!dataSet) {
    return;
  }

  if (type === 'generalImageModule') {
    return {
      sopInstanceUid: dataSet.string('x00080018'),
      instanceNumber: dataSet.intString('x00200013'),
      lossyImageCompression: dataSet.string('x00282110'),
      lossyImageCompressionRatio: dataSet.string('x00282112'),
      lossyImageCompressionMethod: dataSet.string('x00282114'),
    };
  }

  if (type === 'patientModule') {
    return {
      patientName: dataSet.string('x00100010'),
      patientId: dataSet.string('x00100020'),
    };
  }

  if (type === 'generalStudyModule') {
    return {
      studyDescription: dataSet.string('x00081030'),
      studyDate: dataSet.string('x00080020'),
      studyTime: dataSet.string('x00080030'),
    };
  }

  if (type === 'cineModule') {
    return {
      frameTime: dataSet.float('x00181063'),
    };
  }

  if (dataSet.elements[type] !== undefined) {
    const element = dataSet.elements[type];
    if (!element.vr) {
      return;
    }

    return dicomParser.explicitElementToString(dataSet, element);
  }
}

cornerstone.metaData.addProvider(wadoUriMetaDataProvider);
