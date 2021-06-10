# Payments PoC
A little payment app

Payment Cars | PayPal
------------ | -------------
![payment-card-frame](https://user-images.githubusercontent.com/1580169/121419135-a3998c00-c939-11eb-80f1-b66191375b36.gif) | ![paypal-frame](https://user-images.githubusercontent.com/1580169/121419169-ad22f400-c939-11eb-9357-005129e292d4.gif)

### Install dependencies
```bash
yarn install
```

### Development
```bash
yarn serve
```
### Browser
```bash
http://localhost:1234/index.html
```

### Configuration
The application uses [environment variables](https://cli.vuejs.org/guide/mode-and-env.html#modes) on the server component

The environment variables are loaded from the file `.env` (Git-ignored).

Below is an example of how to config the environment variables, copy them into `.env`

```dotenv
NODE_ENV=development
# Set your database/API connection information here
API_KEY={PUBLISHABLE_KEY}
ORGANIZATION_ID=0000000000000000000
APP_MODE=sandbox
```
