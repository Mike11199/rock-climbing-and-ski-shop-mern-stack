import * as actionTypes from "../constants/darkModeConstants";

export const setDarkMode = (mode) => async (dispatch) => {
  dispatch({
    type: actionTypes.SET_DARK_MODE,
    payload: {
      mode,
    },
  });
};
