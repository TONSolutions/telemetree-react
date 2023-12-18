export interface TonConnectStorageData {
  connectEvent?: {
    event: string;
    id: number;
    payload: {
      items: {
        address: string;
      }[];
    };
  };
}
