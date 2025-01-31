import LoginPageComponent from "./components/LoginPageComponent";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setReduxUserState } from "../redux/actions/userActions";
import apiURL from "../utils/ToggleAPI";
import { LoggedInOrRegisteredUserResponse } from "types";

const loginUserApiRequest = async (email, password, doNotLogout) => {
  const { data } = await axios.post<LoggedInOrRegisteredUserResponse>(
    `${apiURL}/users/login`,
    {
      email,
      password,
      doNotLogout,
    },
  );
  // localStorage.clear();
  // sessionStorage.clear();
  if (data.userLoggedIn.doNotLogout) {
    localStorage.setItem("userInfo", JSON.stringify(data.userLoggedIn));
    localStorage.setItem("token", data.token);
  } else {
    sessionStorage.setItem("userInfo", JSON.stringify(data.userLoggedIn));
    sessionStorage.setItem("token", data.token);
  }
  return data;
};

const googleLogin = async (google_token) => {
  try {
    const token_request = { token: google_token };
    const response = await axios.post("/apiv2/signin-google", token_request);
    const data = response?.data;

    // localStorage.clear();
    // sessionStorage.clear();
    if (data.userLoggedIn.doNotLogout) {
      localStorage.setItem("userInfo", JSON.stringify(data.userLoggedIn));
      localStorage.setItem("token", data.token);
    } else {
      sessionStorage.setItem("userInfo", JSON.stringify(data.userLoggedIn));
      sessionStorage.setItem("token", data.token);
    }
    return data;
  } catch (error: any) {
    console.error("Error during login:", error);
  }
};

const LoginPage = () => {
  const reduxDispatch = useDispatch();
  return (
    <LoginPageComponent
      loginUserApiRequest={loginUserApiRequest}
      reduxDispatch={reduxDispatch}
      setReduxUserState={setReduxUserState}
      googleLogin={googleLogin}
    />
  );
};

export default LoginPage;
