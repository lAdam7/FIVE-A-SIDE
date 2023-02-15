import * as Notifications from "expo-notifications"

import { auth, db } from "./FirebaseInit"

/** Notification settings, when delivered to device */
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false
    })
})

/**
 * Get the logged-in users push notification if
 * access has been granted, to enable the ability
 * to send notifications to the user
 * 
 * @author Adam Lyon W19023403
 */
export default async function PushNotification() {
    let token;

    const { status: existingStatus } = await Notifications.getPermissionsAsync() // permission status
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') { // request access, if doesn't currently have
        const { status } = await Notifications.requestPermissionsAsync()
        finalStatus = status;
    }
    if (finalStatus !== 'granted') { // access refused
        alert('Failed to get push token for push notification!')
        return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data // get users push token

    /** 
     * if user is logged in update pushToken for the user, merge if the field
     * doesn't currently exist in the firestore database
     */
    if (auth.currentUser && auth.currentUser.uid) {
        db
        .collection("Users")
        .doc(auth.currentUser.uid)
        .set({
            pushToken: token
        }, { merge: true })
    }
    
    /** Notification settings */
    Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
    });
}