import { LOGGED_IN } from "./types";

export const LOGGED_IN_ACTION = (bool) => ({
    type: LOGGED_IN,
    data: bool
})