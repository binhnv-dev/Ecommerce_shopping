/*
 *
 * Analyst reducer
 *
 */

import { FETCH_ANALYST, SET_ANALYST_LOADING } from "./constants";

const initialState = {
  analyst: {},
  isLoading: false,
};

const analystReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ANALYST:
      return {
        ...state,
        analyst: action.payload,
      };
    case SET_ANALYST_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    default:
      return state;
  }
};

export default analystReducer;
