import { parse, format } from 'date-fns';

export default function formatDA(date, strFormat = 'MMM d, yyyy') {
  if (!date) {
    return;
  }

  // Goal: 'Apr 5, 1999'
  try {
    const parsedDateTime = parse(date, 'yyyyMMdd', new Date());
    const formattedDateTime = format(parsedDateTime, strFormat);

    return formattedDateTime;
  } catch (err) {
    // swallow?
  }

  return;
}
