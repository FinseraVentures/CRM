import winston from "winston";
import "winston-daily-rotate-file";

const { createLogger, format, transports } = winston;

const fileRotateTransport = new transports.DailyRotateFile({
  filename: "logs/%DATE%-combined.log",
  datePattern: "YYYY-MM-DD",
  maxSize: "10m",
  maxFiles: "14d",
});

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.json()
  ),
  transports: [new transports.Console(), fileRotateTransport],
});

export default logger;
