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
    case "LOGIN_REQUIRED":
      return { ...state, isAuthenticated: false };
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

export {
  UserProvider, useUserState, useUserDispatch, loginUser, signOut,
  getUid, extractXAuthToken, tokensToHeaders, tokensToHeadersMultiPart, withPageAndCount, SessionKeys
};

// ###########################################################

function loginUser(dispatch, login, password, history, setIsLoading, setError) {
  const loginFail = errorMsg => {
    setError(errorMsg);
    setIsLoading(false);
  };

  setError(false);
  setIsLoading(true);

  const dataSrc = new DataSrcDS(
    history,
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

// ######################################

const SessionKeys = {
  accessTokenKey: 'accessToken',
  xauthTokenKey: 'xauthToken',
  userTypeKey: 'userType',
  uidKey: '_uid_'
};

const _tokensToHeaders = (contentType, history) => {
  let accessToken = sessionStorage.getItem(SessionKeys.accessTokenKey);
  if (!accessToken) {
    log('no access token found!');
    throw Error ('no access token found!');
    // const dispatch = useUserDispatch();
    // dispatch({ type: "LOGIN_REQUIRED" });
    // history.push("/login");
    // return {};
  }
  var headers = { 'Authorization': `Bearer ${accessToken}` };
  if (contentType) headers['Content-Type'] = contentType;

  let xauth = sessionStorage.getItem(SessionKeys.xauthTokenKey);
  if (xauth) {
    headers['X-Auth-Token'] = xauth;
  }
  return headers;
};
  
const tokensToHeadersMultiPart = (history) => {
  return _tokensToHeaders(null, history);
};
const tokensToHeaders = (history) => {
  return _tokensToHeaders('application/json', history);
};

const withPageAndCount = (entityName, entities) => {
  let res = {
    page: 0,
    totalCount: entities.length
  };
  res[entityName] = entities;
  return res;
};

const extractXAuthToken = response => {
  var xauth = null;
  for(let entry in response.headers) {
    //log(entry, response.headers[entry]);
    //if (entry[0] === 'x-auth-token')
    //  xauth = entry[1];
    if (entry === 'x-auth-token')
      xauth = response.headers[entry];
  }
  log('xauth: ', xauth);
  return xauth;
};

const getUid = () => {
  return sessionStorage.getItem(SessionKeys.uidKey);
};
