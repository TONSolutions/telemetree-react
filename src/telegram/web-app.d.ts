export declare namespace Telegram {
  interface User {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    is_premium: boolean;
    allows_write_to_pm?: boolean;
    added_to_attachment_menu?: boolean;
    photo_url?: string;
    language_code: string;
  }

  interface InitData {
    query_id?: string;
    user?: User;
    chat_type?: 'private' | 'group' | 'supergroup' | 'channel';
    chat_instance?: string;
    start_param?: string;
    auth_date: number;
    hash: string;
  }

  interface WebApp {
    // Properties
    initData: string;
    initDataUnsafe: InitData;
    version: string;
    platform: string;
    colorScheme: 'light' | 'dark';
    themeParams: {
      bg_color: string;
      text_color: string;
      hint_color: string;
      link_color: string;
      button_color: string;
      button_text_color: string;
      secondary_bg_color: string;
    };
    isExpanded: boolean;
    viewportHeight: number;
    viewportStableHeight: number;
    headerColor: string;
    backgroundColor: string;
    isClosingConfirmationEnabled: boolean;
    isVersionAtLeast: (version: string) => boolean;
    ready: () => void;
    close: () => void;

    switchInlineQuery: (
      query: string,
      chat_types?: Array<'users' | 'bots' | 'groups' | 'channels'>,
    ) => void;

    shareToStory: (
      media_url: string,
      params?: {
        text?: string;
      },
    ) => void;

    // Main Button
    MainButton: {
      text: string;
      color: string;
      textColor: string;
      isVisible: boolean;
      isActive: boolean;
      isProgressVisible: boolean;
      setText: (text: string) => MainButton;
      onClick: (callback: () => void) => MainButton;
      offClick: (callback: () => void) => MainButton;
      show: () => MainButton;
      hide: () => MainButton;
      enable: () => MainButton;
      disable: () => MainButton;
      showProgress: (leaveActive: boolean) => MainButton;
      hideProgress: () => MainButton;
      setParams: (params: {
        text?: string;
        color?: string;
        text_color?: string;
        is_active?: boolean;
        is_visible?: boolean;
      }) => MainButton;
    };

    // Back Button
    BackButton: {
      isVisible: boolean;
      onClick: (callback: () => void) => BackButton;
      offClick: (callback: () => void) => BackButton;
      show: () => BackButton;
      hide: () => BackButton;
    };

    // Settings Button
    SettingsButton: {
      isVisible: boolean;
      onClick: (callback: () => void) => SettingsButton;
      offClick: (callback: () => void) => SettingsButton;
      show: () => SettingsButton;
      hide: () => SettingsButton;
    };

    // HapticFeedback
    HapticFeedback: {
      impactOccurred: (
        style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft',
      ) => void;
      notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
      selectionChanged: () => void;
    };

    // Cloud Storage
    CloudStorage: {
      getItem: (key: string) => Promise<string | null>;
      setItem: (key: string, value: string) => Promise<void>;
      removeItem: (key: string) => Promise<void>;
      getKeys: () => Promise<string[]>;
      removeItems: (keys: string[]) => Promise<void>;
    };

    // Event Handling
    onEvent: (
      eventType:
        | 'viewportChanged'
        | 'themeChanged'
        | 'mainButtonClicked'
        | 'backButtonClicked'
        | 'settingsButtonClicked'
        | 'invoiceClosed'
        | 'popupClosed'
        | 'qrTextReceived'
        | 'clipboardTextReceived'
        | 'web_app_switch_inline_query',
      eventHandler: (event: any) => void,
    ) => void;

    offEvent: (
      eventType:
        | 'viewportChanged'
        | 'themeChanged'
        | 'mainButtonClicked'
        | 'backButtonClicked'
        | 'settingsButtonClicked'
        | 'invoiceClosed'
        | 'popupClosed'
        | 'qrTextReceived'
        | 'clipboardTextReceived'
        | 'web_app_switch_inline_query',
      eventHandler: (event: any) => void,
    ) => void;

    // Methods
    ready: () => void;
    expand: () => void;
    close: () => void;

    // Popup methods
    showPopup: (params: {
      title?: string;
      message: string;
      buttons?: Array<{
        id: string;
        type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
        text: string;
      }>;
    }) => Promise<string>;
    showAlert: (message: string) => Promise<void>;
    showConfirm: (message: string) => Promise<boolean>;

    // Auxiliary methods
    enableClosingConfirmation: () => void;
    disableClosingConfirmation: () => void;
    isVersionAtLeast: (version: string) => boolean;
    setHeaderColor: (color: string) => void;
    setBackgroundColor: (color: string) => void;

    // Clipboard methods
    readTextFromClipboard: () => Promise<string>;

    // Link handling
    openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
    openTelegramLink: (url: string) => void;

    // Invoice methods
    openInvoice: (url: string) => Promise<{
      url: string;
      status: 'paid' | 'cancelled' | 'failed' | 'pending';
    }>;

    // QR Scanner methods
    showScanQrPopup: (params: { text?: string }) => Promise<{ data: string }>;
    closeScanQrPopup: () => void;

    // Request methods
    requestWriteAccess: () => Promise<boolean>;
    requestContact: () => Promise<boolean>;
    requestLocation: () => Promise<boolean>;

    // Sensor methods
    requestAccelerometerAccess: () => Promise<boolean>;
    requestGyroscopeAccess: () => Promise<boolean>;
    requestDeviceOrientationAccess: () => Promise<boolean>;

    // Sensor events
    onAccelerometerChange: (
      callback: (data: { x: number; y: number; z: number }) => void,
    ) => void;
    onGyroscopeChange: (
      callback: (data: { x: number; y: number; z: number }) => void,
    ) => void;
    onDeviceOrientationChange: (
      callback: (data: { alpha: number; beta: number; gamma: number }) => void,
    ) => void;

    // Sensor control
    startAccelerometerUpdates: () => void;
    stopAccelerometerUpdates: () => void;
    startGyroscopeUpdates: () => void;
    stopGyroscopeUpdates: () => void;
    startDeviceOrientationUpdates: () => void;
    stopDeviceOrientationUpdates: () => void;
  }

  type WebAppEvent =
    | 'main_button_pressed'
    | 'settings_button_pressed'
    | 'back_button_pressed'
    | 'secondary_button_pressed'
    | 'prepared_message_sent'
    | 'fullscreen_changed'
    | 'home_screen_added'
    | 'home_screen_checked'
    | 'emoji_status_set'
    | 'location_checked'
    | 'location_requested'
    | 'accelerometer_started'
    | 'accelerometer_stopped'
    | 'accelerometer_changed'
    | 'device_orientation_started'
    | 'device_orientation_stopped'
    | 'device_orientation_changed'
    | 'device_orientation_failed'
    | 'gyroscope_started'
    | 'gyroscope_stopped'
    | 'gyroscope_changed'
    | 'gyroscope_failed'
    | 'invoice_closed'
    | 'clipboard_text_received'
    | 'popup_closed'
    | 'write_access_requested'
    | 'qr_text_received'
    | 'phone_requested'
    | 'web_app_request_fullscreen'
    | 'web_app_exit_fullscreen'
    | 'theme_changed'
    | 'viewport_changed'
    | 'scan_qr_popup_closed'
    | 'web_app_switch_inline_query'
    | 'web_app_ready';

  interface WebView {
    /**
     * A method that posts an event to the bot.
     */
    postEvent: (event: string, trigger: () => void, data?: object) => void;

    /**
     * A method that subscribes to events from the bot.
     */
    onEvent: (
      event: WebAppEvent,
      callback: (event: string, data?: object) => void,
    ) => void;

    /**
     * A method that unsubscribes from events from the bot.
     */
    offEvent: (
      event: WebAppEvent,
      callback: (event: string, data?: object) => void,
    ) => void;

    /**
     * A method that enables the closing confirmation.
     */
    enableClosingConfirmation: () => void;

    /**
     * A method that disables the closing confirmation.
     */
    disableClosingConfirmation: () => void;

    /**
     * A method that shows a popup.
     */
    showPopup: (params: {
      title?: string;
      message: string;
      buttons?: Array<{
        id: string;
        type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
        text: string;
      }>;
    }) => Promise<string>;

    /**
     * A method that shows an alert.
     */
    showAlert: (message: string) => Promise<void>;

    /**
     * A method that shows a confirmation dialog.
     */
    showConfirm: (message: string) => Promise<boolean>;

    /**
     * A method that closes the Web App.
     */
    close: () => void;

    /**
     * A method that expands the Web App to full screen.
     */
    expand: () => void;

    /**
     * A method that requests the write access to the bot.
     */
    requestWriteAccess: () => Promise<boolean>;

    /**
     * A method that requests the user's phone number.
     */
    requestContact: () => Promise<boolean>;

    /**
     * A method that reads text from the clipboard.
     */
    readTextFromClipboard: () => Promise<string>;

    /**
     * A method that opens a link in an external browser.
     */
    openLink: (url: string, options?: { try_instant_view?: boolean }) => void;

    /**
     * A method that opens a telegram link in the Telegram app.
     */
    openTelegramLink: (url: string) => void;

    /**
     * A method that opens an invoice.
     */
    openInvoice: (url: string) => Promise<{ url: string; status: string }>;

    /**
     * A method that shows a scanning QR code popup.
     */
    showScanQrPopup: (params: { text?: string }) => Promise<{ data: string }>;

    /**
     * A method that closes the scanning QR code popup.
     */
    closeScanQrPopup: () => void;

    /**
     * A method that requests the user's location.
     */
    requestLocation: () => Promise<boolean>;

    /**
     * A method that requests the device's accelerometer access.
     */
    requestAccelerometerAccess: () => Promise<boolean>;

    /**
     * A method that requests the device's gyroscope access.
     */
    requestGyroscopeAccess: () => Promise<boolean>;

    /**
     * A method that requests the device's orientation access.
     */
    requestDeviceOrientationAccess: () => Promise<boolean>;

    switchInlineQuery: (query: string, choose_chat_types?: string[]) => void;

    /**
     * Ready state of the Web App
     */
    isReady: boolean;
  }
}
