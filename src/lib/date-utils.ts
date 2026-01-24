import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.locale("id");
dayjs.extend(relativeTime);

export const formatDateTable = (dateString: string | Date) => {
  if (!dateString) return "-";
  return dayjs(dateString).format("DD MMM YYYY");
};

export const formatDateDetail = (dateString: string) => {
  if (!dateString) return "-";
  return dayjs(dateString).format("DD MMM YYYY HH:mm");
};

export const formatDateRelative = (dateString: string) => {
  if (!dateString) return "-";
  return dayjs(dateString).fromNow();
};
