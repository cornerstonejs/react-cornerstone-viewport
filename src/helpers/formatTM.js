import { parse, format } from 'date-fns';

export default function formatTM(time, strFormat = 'HH:mm:ss') {
  if (!time) {
    return;
  }

  // DICOM Time is stored as HHmmss.SSS, where:
  //      HH 24 hour time:
  //      m mm    0..59   Minutes
  //      s ss    0..59   Seconds
  //      S SS SSS    0..999  Fractional seconds
  //
  // Goal: '24:12:12'
  try {
    const inputFormat = 'HHmmss.SSS';
    const strTime = time.toString().substring(0, inputFormat.length);
    const parsedDateTime = parse(strTime, 'HHmmss.SSS', new Date(0));
    const formattedDateTime = format(parsedDateTime, strFormat);

    return formattedDateTime;
  } catch (err) {
    // swallow?
  }

  return;
}
