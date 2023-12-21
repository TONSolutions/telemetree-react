export const getCurrentUTCTimestamp = (): string => {
  return Math.floor(Date.now() / 1000).toString();
};
