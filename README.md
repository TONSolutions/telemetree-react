# TON Solutions Analytics library for React.js

## Installation

Install it from [NPM](https://www.npmjs.com/package/@tonsolutions/analytics-react):
```
$ npm install @tonsolutions/analytics-react
```

## How to use
```javascript
import { TwaAnalyticsProvider } from '@tonsolutions/analytics-react';

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
import { useTWAEvent } from '@tonsolutions/analytics-react';

const builder = useTWAEvent();
builder.track('transfer', {
    amount: 1000,
    method: 'TON',
});
```

## User data and Processing
This library is designed to automatically retrieve user data from Telegram, enhancing your events with valuable insights. 

Adhering to Telegram's high standards of security, we employ RSA encryption for the transmission of data across networks, ensuring both the integrity and safety of your analytics processes