/*
 *
 * Account actions
 *
 */

import axios from "axios";

import { FETCH_ANALYST, SET_ANALYST_LOADING } from "./constants";
import handleError from "../../utils/error";

export const setAnalystLoading = (value) => {
  return {
    type: SET_ANALYST_LOADING,
    payload: value,
  };
};

export const fetchAnalyst = () => {
  return async (dispatch, getState) => {
    try {
      dispatch(setAnalystLoading(true));
      const response = await axios.get(`/api/payment/analyst`);

      dispatch({ type: FETCH_ANALYST, payload: response.data });
    } catch (error) {
      handleError(error, dispatch);
    } finally {
      dispatch(setAnalystLoading(false));
    }
  };
};
