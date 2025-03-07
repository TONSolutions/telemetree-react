![](https://tc-images-api.s3.eu-central-1.amazonaws.com/gif_cropped.gif)

# Telegram Mini App analytics SDK for React

![Static Badge](https://img.shields.io/badge/build-passing-brightgreen?style=flat) ![GitHub top language](https://img.shields.io/github/languages/top/tonsolutions/telemetree-react) ![GitHub commit activity](https://img.shields.io/github/commit-activity/w/tonsolutions/telemetree-react)

Documentation: https://docs.telemetree.io/

## Telemetree SDKs for Telegram Mini App Analytics

Telemetree is a comprehensive free analytics tool designed specifically for **Telegram Mini Apps**. With our SDKs, developers, marketers, and product managers can easily track and optimize user engagement, making data-driven decisions to boost user acquisition and retention. Telemetree simplifies **Analytics for Telegram Mini Apps** by delivering insights into user behaviors, acquisition channels, and in-app interactions.

### Key Features
- **Real-Time Analytics**: Monitor user activity within your Telegram Mini App in real-time.
- **User Retention Metrics**: Track returning users and pinpoint which features encourage app retention.
- **Web3 data**: discover web3 metrics associated with your users.
- **Seamless Integration**: Our SDKs are lightweight and integrate easily with auto event mapping.
- **Telegram-native**: Telemetree is built natively for Telegram.
- **User segmentation**: API for personalized notifications based on cohorts, completed actions. web3 data and more.
- **Free tier** with wide limits.

### Why Use Telemetree for Telegram Mini App Analytics?

Telemetree is uniquely focused on the needs of Telegram Mini App developers, providing tailored metrics and insights that help you grow and retain your user base efficiently. As the demand for Analytics for Telegram Mini Apps grows, Telemetree remains at the forefront, offering tools that cater specifically to the Telegram ecosystem.

Start capturing valuable insights with Telemetree and make data-driven decisions for your app's growth on Telegram.

## Resources
Consider visiting our resources for more info about the state of the Telegram Mini Apps ecosystem and Telegram analytics.

- [Website](https://www.telemetree.io/)
- [Twitter](https://x.com/telemetree_HQ)
- [Telegram channel](https://t.me/telemetree_en)
- [LinkedIn](https://linkedin.com/company/telemetree)
- [Medium](https://medium.com/@telemetree)
- [Documentation](https://docs.telemetree.io/)

## Examples
- [Next15 twa-dev/sdk](https://github.com/Telemetree/telemetree-next-15-template-twa-sdk)
- [Next15 @telegram-apps/sdk](https://github.com/Telemetree/telemetree-next-15-template)

# Installation

Install it from [NPM](https://www.npmjs.com/package/@tonsolutions/telemetree-react):

```
$ npm install @tonsolutions/telemetree-react
```

## How to use

Call this script in `<head>`:

```html
<script src="https://telegram.org/js/telegram-web-app.js"></script>
```

In your app:

```javascript
import { TrackGroups, TwaAnalyticsProvider } from '@tonsolutions/telemetree-react';
import { useInitData, useLaunchParams } from "@telegram-apps/sdk-react"; // v 1.1.3 

export function App() {
    const initData = useInitData();
    const launchParams = useLaunchParams();
    
    const telegramWebAppData: TelegramWebAppData = {
        query_id: initData?.queryId,
        user: initData?.user,
        chat_type: initData?.chatType,
        chat_instance: initData?.chatInstance,
        start_param: initData?.startParam,
        auth_date: initData?.authDate,
        hash: initData?.hash,
        platform: launchParams?.platform,
    };
    
  return (
    <TwaAnalyticsProvider
      projectId="YOUR_PROJECT_ID"
      apiKey="YOUR_API_KEY"
      trackGroup={TrackGroups.HIGH} // default is TrackGroups.HIGH
      telegramWebAppData={telegramWebAppData} // optional for alternative sdk, for example @telegram-apps/sdk-react
    >
      ...
    </TwaAnalyticsProvider>
  );
}
```

```js
import { useTWAEvent } from '@tonsolutions/telemetree-react';

const builder = useTWAEvent();
builder.track('transfer', {
  amount: 1000,
  method: 'TON',
});
```

In order to track TON related operations, such as wallet connections, signed transactions etc, you should use `@tonconnect/ui` or `@tonconnect/ui-react`. When these libs are detected, Telemetree will automatically log on-chain events.

## Other SDKs
Telemetree SDKs are available for various frameworks and environments, making it easy to incorporate powerful analytics into any Telegram Mini App.
- React SDK: https://github.com/Telemetree/telemetree-react
- Node.js SDK: https://github.com/Telemetree/telemetree-node
- .NET SDK: https://github.com/MANABbl4/Telemetree.Net (community-supported)

## Tracking groups
false - no tracking
### Low
```
- Pageview

- Session start

- Wallet (ton connect events)

- Invoice opened (webApp event)

- Invoice closed (webApp event)

- Transaction signed (ton connect events)
```

### Medium
```
All in Low group

- Click

- openLink (webApp event)

- openTelegramLink (webApp event)

```

### High
```
All in Medium group

Web app events:

- MainButtonPressed

- SettingsButtonPressed

- BackButtonPressed

- SecondaryButtonPressed

- PreparedMessageSent

- FullScreenChanged

- HomeScreenAdded

- HomeScreenChecked

- EmojiStatusSet

- LocationChecked

- LocationRequested

- AccelerometerStarted

- AccelerometerStopped

- AccelerometerChanged

- DeviceOrientationStarted

- DeviceOrientationStopped

- DeviceOrientationChanged

- DeviceOrientationFailed

- GyroscropeStarted

- GyroscropeStopped

- GyroscropeChanged

- GyroscropeFailed

- PopupClosed

- WriteAccessRequested

- QRTextReceived

- PhoneRequested

- WebAppExitFullscreen

- Session end (webApp.close)

- Inline query opened (webApp.switchInlineQuery)

- Fullscreen on

- Fullscreen off

- Story shared (webApp.shareStory)

TON connect events:
- Transaction sent for signature

- Transaction signing failed

- Wallet disconnected

- Wallet connection restore error

- Wallet connection restored

- Wallet connection restoring started

```

## Start params
Start parameters by default are taken from the start parameters that Telegram transmits.
For example:

```https://t.me/{{bot_handle}}/{{short_name}}?startapp=command```

In this case, the start parameter will be ```command```.

If the start parameter is not passed when the application starts, it is taken from the application's url query parameter.
