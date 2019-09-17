import { parse, format } from 'date-fns';

export default function formatDA(date, strFormat = 'MMM D, YYYY') {
  if (!date) {
    return;
  }
  // console.log('wat');
  // const parsedDateTime = parse(date, 'YYYYMMDD');

  // return format(parsedDateTime, strFormat);
  return 'Apr 5, 1999';
}
