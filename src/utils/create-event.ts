import { BaseEvent, EventDetails, EventUserDetails } from '../types';

export const createEvent = (
  appName: string,
  eventName: string,
  userDetails: EventUserDetails,
  eventDetails: EventDetails,
  telegramID: string,
  language: string,
  device: string,
  referrerType: string | 'N/A',
  referrer: string | '0',
  timestamp: string,
  isAutocapture: boolean,
  wallet: string | undefined,
): BaseEvent => {
  return {
    eventType: eventName,
    userDetails,
    app: appName,
    eventDetails,
    telegramID,
    language,
    device,
    referrerType,
    referrer,
    timestamp,
    isAutocapture,
    wallet,
  };
};
