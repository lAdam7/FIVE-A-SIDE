import { createStore, combineReducers } from "redux"
import Authenticate from "./reducers/authenticate"
import Location from "./reducers/userlocation"

const rootReducer = combineReducers({
    authenticateReducer: Authenticate,
    locationReducer: Location
})

const configureStore = () => createStore(rootReducer)

export default configureStore