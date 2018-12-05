import moment from 'moment';

export default function formatDA(date, format= "MMM D, YYYY") {
  if (!date) {
    return;
  }

  const dateAsMoment = moment(date, "YYYYMMDD");

  return dateAsMoment.format(strFormat);
};
