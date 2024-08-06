enum LogLevel {
    ERROR = 'error',
    WARN = 'warn',
    INFO = 'info',
    DEBUG = 'debug',
  }
  
  class Logger {
    private static level: LogLevel = LogLevel.INFO;
  
    static setLevel(level: LogLevel) {
      this.level = level;
    }
  
    private static log(level: LogLevel, message: string, meta?: object) {
      if (this.shouldLog(level)) {
        const logMessage = meta ? `${message} ${JSON.stringify(meta)}` : message;
        console[level](logMessage);
      }
    }
  
    private static shouldLog(level: LogLevel): boolean {
      const levels = Object.values(LogLevel);
      return levels.indexOf(level) <= levels.indexOf(this.level);
    }
  
    static error(message: string, meta?: object) {
      this.log(LogLevel.ERROR, message, meta);
    }
  
    static warn(message: string, meta?: object) {
      this.log(LogLevel.WARN, message, meta);
    }
  
    static info(message: string, meta?: object) {
      this.log(LogLevel.INFO, message, meta);
    }
  
    static debug(message: string, meta?: object) {
      this.log(LogLevel.DEBUG, message, meta);
    }
  }
  
  export { Logger, LogLevel };