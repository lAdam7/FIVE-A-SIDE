import { Alert } from "react-native"
import { auth, db } from "./FirebaseInit"
import { LOGGED_IN_ACTION } from '../../redux/actions/authenticate';

import PushNotification from "./PushNotifications"

/**
 * Utilizes the auth element from the Firebase initialization sets
 * an event listener for user authentication changing and output
 * correct content
 * 
 * @author Adam Lyon W19023403
 */
function Authentication( store ) {

    auth.onAuthStateChanged((user) => {
        if (!user) { // not logged-in
            console.log("NOT-LOGGGED-IN")
            store.dispatch(LOGGED_IN_ACTION(false))
        /*} else if (!user.emailVerified) {
            console.log("VERIFY-YOUR-EMAIL")
            //user.sendEmailVerification()
            store.dispatch(LOGGED_IN_ACTION(true))*/
        } else if (user.emailVerified) { // logged-in and email verified
            console.log("LOGGED-IN")
            
            store.dispatch(LOGGED_IN_ACTION(true))
            PushNotification()
        } else { // email not verified
            console.log("verify your email")
            Alert.alert(
                "Verify Email!",
                "You haven't verified your account, please check your emails!"
            )
        }
    })
}
  
export default Authentication;