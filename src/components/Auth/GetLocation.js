import * as Location from 'expo-location'
import { USER_LOCATION_ACTION } from '../../redux/actions/userlocation';

/**
 * Get the users location on app start-up and store the data
 * via redux so all components can utilize where needed, so
 * viewing a map instantly shows location and doesn't need to
 * wait for the permissions and get position async to respond
 * 
 * @param store Redux store for updating user locaiton
 * 
 * @author Adam Lyon W19023403
 */
async function getLocation( store ) {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') { // refused access
        console.log("Permission to access location was denied")
    }
    
    let { coords } = await Location.getCurrentPositionAsync();
    if (coords) { // obtained users coordinated from current mobile location
        // set the users location to the redux store of USER_LOCATION_ACTION
        store.dispatch(USER_LOCATION_ACTION({
            longitude: coords.longitude,
            latitude: coords.latitude,
            longitudeDelta: 0.06,
            latitudeDelta: 0.0421
        }))
    }      
}
  
export default getLocation;