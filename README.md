# Payment methods PoC
Merchant checkout flow example

### Install dependencies
```bash
yarn install
```

### Development
```bash
yarn serve
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
