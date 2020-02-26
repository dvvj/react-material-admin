import React from "react";
import DataSrcDS from "../data/DataSrcDS";
import RouteConsts from "../components/RouteConsts";
import {log} from '../utils/Util';

var UserStateContext = React.createContext();
var UserDispatchContext = React.createContext();

function userReducer(state, action) {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      return { ...state, isAuthenticated: true };
    case "SIGN_OUT_SUCCESS":
      return { ...state, isAuthenticated: false };
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

function UserProvider({ children }) {
  var [state, dispatch] = React.useReducer(userReducer, {
    isAuthenticated: !!localStorage.getItem("id_token"),
  });

  return (
    <UserStateContext.Provider value={state}>
      <UserDispatchContext.Provider value={dispatch}>
        {children}
      </UserDispatchContext.Provider>
    </UserStateContext.Provider>
  );
}

function useUserState() {
  var context = React.useContext(UserStateContext);
  if (context === undefined) {
    throw new Error("useUserState must be used within a UserProvider");
  }
  return context;
}

function useUserDispatch() {
  var context = React.useContext(UserDispatchContext);
  if (context === undefined) {
    throw new Error("useUserDispatch must be used within a UserProvider");
  }
  return context;
}

export { UserProvider, useUserState, useUserDispatch, loginUser, signOut };

// ###########################################################

function loginUser(dispatch, login, password, history, setIsLoading, setError) {
  const loginFail = errorMsg => {
    setError(errorMsg);
    setIsLoading(false);
  };

  setError(false);
  setIsLoading(true);

  const dataSrc = new DataSrcDS(
    "https://localhost:20433",
    () => {
      log('401 error');
      loginFail("401");
    },
    (status, error) => {
      log('error', error);
      loginFail(error);
    }
  );

  if (!!login && !!password) {
    const userpass = {
      user: login,
      pass: password
    };
    dataSrc.doLogin(
      userpass,
      resp => {
        log("login resp: ", resp);

        // test login resp:
        localStorage.setItem('id_token', 1)
        setError(null)
        setIsLoading(false)
        dispatch({ type: 'LOGIN_SUCCESS' })
      
        history.push(RouteConsts.AdminProdTable.link)
      },
      err => {
          let errMsg = `登录失败（${err.status}:${err.statusText}）`;
          log(errMsg);
          setError(errMsg)
          //this.sbarRef.current.err(errMsg);
      }
    )
    // setTimeout(() => {
    //   localStorage.setItem('id_token', 1)
    //   setError(null)
    //   setIsLoading(false)
    //   dispatch({ type: 'LOGIN_SUCCESS' })

    //   history.push('/app/dashboard')
    // }, 2000);
  } else {
    dispatch({ type: "LOGIN_FAILURE" });
    setError(true);
    setIsLoading(false);
  }
}

function signOut(dispatch, history) {
  localStorage.removeItem("id_token");
  dispatch({ type: "SIGN_OUT_SUCCESS" });
  history.push("/login");
}
