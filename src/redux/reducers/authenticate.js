import { LOGGED_IN } from "../actions/types";

const intialState = {
    logged: false
}

const authenticateReducer = (state = intialState, action) => {
    switch(action.type) {
        case LOGGED_IN:
        return {logged: state.logged = action.data}
        
        default:
        return state;
    }
}

export default authenticateReducer