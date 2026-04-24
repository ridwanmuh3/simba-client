import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.locale("id");
dayjs.extend(relativeTime);

export const formatDateTable = (dateString: string | Date) => {
  if (!dateString) return "-";
  return dayjs(dateString).format("DD MMMM YYYY");
};

export const formatDateDetail = (dateString: string | Date) => {
  if (!dateString) return "-";
  return dayjs(dateString).format("DD MMMM YYYY HH:mm:ss");
};

export const formatDateRelative = (dateString: string | Date) => {
  if (!dateString) return "-";
  return dayjs(dateString).fromNow();
};

export const combineDateTime = (date?: Date, time: string = "00:00:00") => {
  if (!date) return undefined;

  return dayjs(
    `${dayjs(date).format("DD MMMM YYYY")} ${time}`,
    "DD MMMM YYYY HH:mm:ss",
  ).toDate();
};
