import { Telegram } from "./src/telegram";

declare global {
  interface Window {
    Telegram?: {
      WebApp: Telegram.WebApp;
    };
  }
}
