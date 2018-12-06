/*function metaDataProvider(type, imageId) {
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

  if (type === 'instance') {
    return metaData;
  }
}

cornerstone.metaData.addProvider(metaDataProvider);*/
