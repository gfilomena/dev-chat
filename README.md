# DevChat

Welcome to DevChat. DevChat is a simplified clone of a well-known app - Slack. Devchat allows desktop and large tablet users to exchange messages, files and much more.

## Demo

You can visit https://devchat.andrewkaras.me for a working demo.

## How to use

In order to access the app, you will need to register or log in with an existing account.

After you do that, you will be able to create new channels or access existing ones by clicking the respective option in the navbar on the left.

To send a direct message to an existing user, select one in the "Direct Messages" section and send them a message. If the user is online, the red circle near their display name will turn green.

You can change the colors of the app to the ones you want by clicking the plus icon in the top-left corner. After that select 2 accent colors and save. The theme will be applied to the app, if you click on it.

To upload a file, click "Upload Media" button in the bottom-right corner and select the file you want to upload. Due to limited server capabilities, file types are limited to jpg and png.

To change your avatar, click on the existing avatar of yours and select the "Change Avatar" option.

## Built With

- [React](https://reactjs.org) - A JavaScript library for building user interfaces
- [Redux](https://redux.js.org) - A predictable state container for JavaScript apps
- [Firebase](https://firebase.google.com) - Comprehensive app development platform
- [Semantic UI](https://sass-lang.com) - A development framework

## Getting Started

These instructions will get you a copy of the project up and running on your local machine.

### Prerequisites

You will need to have your own Firebase account to complete the setup. Firebase account is needed to complete the firebase config file with your information.

### Installing

First, you need to clone this repo. After you have done that, navigate to the root folder of the project /src/firebase.js

You will need to complete the config object with data found in your Firebase account. You will find notes on what information goes where in the file. All that information is available in general settings of your project in Firebase.

Next, navigate to the root folder and run:

```
npm -i
```

To run the project locally, you will need to start the server. To do that, go to the root folder of the project and run this command in terminal:

```
npm start
```
