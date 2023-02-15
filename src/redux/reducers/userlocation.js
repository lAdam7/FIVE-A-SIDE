import { USER_LOCATION } from "../actions/types";

const intialState = {
    location: null
}

const locationReducer = (state = intialState, action) => {
    switch(action.type) {
        case USER_LOCATION:
        return {location: state.location = action.data}
 
        
        default:
        return state;
    }
}

export default locationReducer