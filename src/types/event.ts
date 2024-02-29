export interface EventUserDetails {
  username?: string;
  firstName?: string;
  lastName?: string;
  isPremium?: boolean;
  writeAccess?: boolean;
}

export interface EventDetails {
  startParameter: string;
  path: string;
  params: { [key: string]: any };
}

export interface BaseEvent {
  eventType: string;
  userDetails: EventUserDetails;
  app: string;
  eventDetails: EventDetails;
  telegramID: string;
  language: string;
  device: string;
  referrerType: string | 'N/A';
  referrer: string | '0';
  timestamp: string;
  isAutocapture: boolean;
  wallet: string | undefined;
  sessionIdentifier?: string;
  eventSource: string;
}
