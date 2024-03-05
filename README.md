![](https://tc-images-api.s3.eu-central-1.amazonaws.com/gif_cropped.gif)

# TON Solutions Telemetree library for React.js
![Static Badge](https://img.shields.io/badge/build-passing-brightgreen?style=flat) ![GitHub top language](https://img.shields.io/github/languages/top/tonsolutions/telemetree-react) ![GitHub commit activity](https://img.shields.io/github/commit-activity/w/tonsolutions/telemetree-react)

To learn more about the SDK, here are some useful links:
- Documentation: https://docs.ton.solutions/
- Boilerplate: https://github.com/TONSolutions/react-twa-boilerplate

## Installation

Install it from [NPM](https://www.npmjs.com/package/@tonsolutions/telemetree-react):
```
$ npm install @tonsolutions/telemetree-react
```

## How to use
```javascript
import { TwaAnalyticsProvider } from '@tonsolutions/telemetree-react';

export function App() {
    return (
        <TwaAnalyticsProvider
            projectId='YOUR_PROJECT_ID'
            apiKey='YOUR_API_KEY'
            appName='YOUR_APPLICATION_NAME'
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

## User data and Processing
This library is designed to automatically retrieve user data from Telegram, enhancing your events with valuable insights. 

Adhering to Telegram's high standards of security, we employ RSA encryption for the transmission of data across networks, ensuring both the integrity and safety of your analytics processes
