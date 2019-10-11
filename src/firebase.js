import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
import 'firebase/storage'

const config = {
  // REPLACE THIS WITH ACTUAL INFORMATION FOR THE APP TO WORK
  // most of this information is generated for you in firebase automatically
  apiKey: '', // Place Your API key here
  authDomain: '', // authDomain from Firebase
  databaseURL: '', // your DB URL from Firebase
  projectId: '', // the ID of the project you created
  storageBucket: '', // keep it empty
  messagingSenderId: '', // messaging SenderID from Firebase
  appId: '' // appID from Firebase
}
// Initialize Firebase
firebase.initializeApp(firebaseConfig)

export default firebase
