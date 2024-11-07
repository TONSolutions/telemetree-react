![](https://tc-images-api.s3.eu-central-1.amazonaws.com/gif_cropped.gif)

# TON Solutions Telemetree library for React.js

![Static Badge](https://img.shields.io/badge/build-passing-brightgreen?style=flat) ![GitHub top language](https://img.shields.io/github/languages/top/tonsolutions/telemetree-react) ![GitHub commit activity](https://img.shields.io/github/commit-activity/w/tonsolutions/telemetree-react)

To learn more about the SDK, here are some useful links:

- Documentation: https://docs.telemetree.io/
- Boilerplate: https://github.com/TONSolutions/react-twa-boilerplate

![Alt](https://repobeats.axiom.co/api/embed/71dde1ce0ebd118019e03f5e9ba6a9d0898f3d70.svg "Repobeats analytics image")

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

Website: telemetree.io
Twitter: x.com/telemetree_hq
Telegram channel: t.me/telemetree_en
LinkedIn: www.linkedin.com/company/telemetree
Medium: medium.com/@telemetree
Documentation: docs.telemetree.io

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
import { TwaAnalyticsProvider } from '@tonsolutions/telemetree-react';

export function App() {
  return (
    <TwaAnalyticsProvider
      projectId="YOUR_PROJECT_ID"
      apiKey="YOUR_API_KEY"
      appName="YOUR_APPLICATION_NAME"
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
## Other SDKs
Telemetree SDKs are available for various frameworks and environments, making it easy to incorporate powerful analytics into any Telegram Mini App.
- React SDK: TONSolutions/telemetree-react
- Node.js SDK: TONSolutions/telemetree-node
- .NET SDK: MANABbl4/Telemetree.Net (community-supported)
