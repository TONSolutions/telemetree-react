export const getCurrentUTCTimestamp = (): string => {
  return Math.floor(Date.now() / 1000).toString();
};

export const getCurrentUTCTimestampMilliseconds = (): string => {
  return Date.now().toString();
};
