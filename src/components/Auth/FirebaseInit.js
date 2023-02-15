import firebase from "firebase/compat/app";
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/functions'

/**
 * Initialize firebase on start up of the application returning
 * authentication and database(firestore) values for other
 * components to import and utilize
 * 
 * @returns db Firestore instance
 * @returns auth Authentication instance
 * @returns functons Cloud functions
 * @returns firebase General firebase instance
 * @returns authTest Needed for changing password checking reauthenticating credentials may be needed
 * 
 * @author Adam Lyon W19023403
 */
 const firebaseConfig = {
  };

if (firebase.apps.length === 0) { /// firebase instance doesn't exist, create one
    firebase.initializeApp(firebaseConfig)
}

const auth = firebase.auth();
const db = firebase.firestore();
const functions = firebase.functions();
const authTest = firebase.auth;

export { db, auth, functions, firebase, authTest }