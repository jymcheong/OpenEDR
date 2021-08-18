# ![Logo](https://i.imgur.com/OhyTjKK.png) Intezer-js

An **unofficial** Node.JS wrapper for [**Intezer Analyze**](https://analyze.intezer.com/)'s API.

## 📥 Installation

> **IMPORTANT ⚠️:** This library is written using [**ESModules**](https://flaviocopes.com/es-modules/) specification, wich is **currently not supported by NodeJS's LTS version**.
> In order to use this library you must either, run it on [**NodeJS v16**](https://nodejs.org/dist/latest-v16.x/docs/api/index.html) (_See the [Releases Roadmap](https://nodejs.org/en/about/releases/)_) or build an **ES2015** compatible library.
> See the instructions below:

### NodeJS v16 and superior

#### Using NPM:

> Not yet released on npm, I'm waiting for version NodeJS v16 to become LTS.

#### Cloning from GitHub:

\>To-Do<

### Current NodeJS LTS

#### Using NPM:

> Not yet released on npm, I'm going to make a pre-release version soon.

#### Cloning from GitHub:

\>To-Do<

## ⏳ Quick start

Follow these example to quickly start using the library.

> Note: You first need to [create an account](https://analyze.intezer.com/create-account) and get your [API Key](https://analyze.intezer.com/account-details).

> Important Note: All the snippets in this page will use the ES2015 compatible syntax until release.

### Import the library:

```js
const intezer = require('intezer-js');

// Or import only the client class //

const Client = require('intezer-js').Client;
```

### Instantiate the client

```js
const Client = require('intezer-js').Client; // Import the Client class

const myClient = new Client('#API Key#'); // Create a new instance

// Or us this shorthand //

const myClient = new require('intezer-js').Client('#API Key#');
```

### Send a file to Analysis

```js
myClient
  .analyze('./file.exe') // Returns a promise
  .then((url) => {
    console.log(`See the analysis results here: ${url}`);
  })
  .catch(console.error);
```

### Retrieve analysis data

#### Using ID

```js
const id = 'c5e2d1a4-2277-4bcd-839a-19dff91eb112';

myClient.analysis
  .getAnalysis(id)
  .then((data) => {
    console.log(`Analysis results: ${data}`);
  })
  .catch(console.error);
```

#### Using a file's hash

```js
const hash = '0a76c55fa88d4c134012a5136c09fb938b4be88a382f88bf2804043253b0559f';
// Or
const hash = myClient.hashFile('file.exe');

myClient.analysis
  .getFile(hash)
  .then((data) => {
    console.log(`Analysis results: ${data}`);
  })
  .catch(console.error);
```

### Making a request using the raw API

```js
const intezer = require('intezer');

// ...

async function myFunction() {
  let accessToken = await intezer.raw.getAccessToken('#API Key#');
  // ...
}
```

## 📔 Documentation

### Client

\>To-Do<

### Raw API

\>To-Do<

## 📕 Reference documentation

I used [**Intezer Analyze's API Documentation**](https://analyze.intezer.com/api/docs/documentation) as reference for this wrapper.

### 📄 Disclosure

This library is unofficial and not supported nor sustained by Intezer.
Use it at your own risk !
