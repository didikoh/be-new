// utils/isTodayMY.ts
export function isTodayMY(startTime: string) {
  // 1. 获取今天在马来西亚时区的年月日
  const now = new Date();
  const nowMY = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Kuala_Lumpur" })
  );

  // 今天的0点
  const startOfDay = new Date(nowMY);
  startOfDay.setHours(0, 0, 0, 0);

  // 今天的23:59:59
  const endOfDay = new Date(nowMY);
  endOfDay.setHours(23, 59, 59, 999);

  // 2. 把 course.start_time 转为 Date
  // 兼容 "YYYY-MM-DD HH:mm:ss" 和 "YYYY-MM-DDTHH:mm:ss" 格式
  let courseTime = startTime.includes("T")
    ? new Date(startTime)
    : new Date(startTime.replace(" ", "T") + "+08:00");

  // 3. 判断是否在今天范围内
  return courseTime >= startOfDay && courseTime <= endOfDay;
}

export function isSevenDaysMY(startTime: string) {
  // 1. 获取今天在马来西亚时区的年月日
  const now = new Date();
  const nowMY = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Kuala_Lumpur" })
  );

  // 今天的0点
  const startOfDay = new Date(nowMY);
  startOfDay.setHours(0, 0, 0, 0);

  // 今天的23:59:59
  const endOfDay = new Date(nowMY);
  endOfDay.setDate(startOfDay.getDate() + 6); // 第七天就是今天+6
  endOfDay.setHours(23, 59, 59, 999);

  // 2. 把 course.start_time 转为 Date
  // 兼容 "YYYY-MM-DD HH:mm:ss" 和 "YYYY-MM-DDTHH:mm:ss" 格式
  let courseTime = startTime.includes("T")
    ? new Date(startTime)
    : new Date(startTime.replace(" ", "T") + "+08:00");

  // 3. 判断是否在今天范围内
  return courseTime >= startOfDay && courseTime <= endOfDay;
}

export function isThisMonthMY(startTime: string) {
  // 获取现在在马来西亚的本地时间
  const now = new Date();
  const nowMY = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Kuala_Lumpur" })
  );

  const yearMY = nowMY.getFullYear();
  const monthMY = nowMY.getMonth(); // 注意：getMonth() 是 0~11

  // 解析 startTime，支持 "YYYY-MM-DD HH:mm:ss" 和 "YYYY-MM-DDTHH:mm:ss"
  let courseTime = startTime.includes("T")
    ? new Date(startTime)
    : new Date(startTime.replace(" ", "T") + "+08:00");

  return (
    courseTime.getFullYear() === yearMY && courseTime.getMonth() === monthMY
  );
}

export function isThisWeekMY(startTime: string) {
  // 当前马来西亚时间
  const now = new Date();
  const nowMY = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Kuala_Lumpur" })
  );

  // 获取本周周一和周日（以马来西亚时间为准）
  const day = nowMY.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(nowMY);
  monday.setDate(nowMY.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  // 解析 startTime（支持 "YYYY-MM-DD HH:mm:ss" 和 "YYYY-MM-DDTHH:mm:ss"）
  const courseTime = startTime.includes("T")
    ? new Date(startTime)
    : new Date(startTime.replace(" ", "T") + "+08:00");

  return courseTime >= monday && courseTime <= sunday;
}

export const toLocalYMD = (d: Date) => {
  const offsetMs = d.getTimezoneOffset() * 60_000; // e.g. -480 min for KL
  return new Date(d.getTime() - offsetMs) // shift into UTC
    .toISOString() // now safe to ISO
    .slice(0, 10); // YYYY-MM-DD
};
