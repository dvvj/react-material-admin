const SessionKeys = {
  accessTokenKey: 'accessToken',
  xauthTokenKey: 'xauthToken',
  userTypeKey: 'userType',
  uidKey: '_uid_'
};

const _tokensToHeaders = (contentType) => {
  let accessToken = sessionStorage.getItem(SessionKeys.accessTokenKey);
  if (!accessToken) {
    throw Error('no access token found!');
  }
  var headers = { 'Authorization': `Bearer ${accessToken}` };
  if (contentType) headers['Content-Type'] = contentType;

  let xauth = sessionStorage.getItem(SessionKeys.xauthTokenKey);
  if (xauth) {
    headers['X-Auth-Token'] = xauth;
  }
  return headers;
};
  
const tokensToHeadersMultiPart = () => {
  return _tokensToHeaders(null);
};
const tokensToHeaders = () => {
  return _tokensToHeaders('application/json');
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
    //console.log(entry, response.headers[entry]);
    //if (entry[0] === 'x-auth-token')
    //  xauth = entry[1];
    if (entry === 'x-auth-token')
      xauth = response.headers[entry];
  }
  console.log('xauth: ', xauth);
  return xauth;
};

const getUid = () => {
  return sessionStorage.getItem(SessionKeys.uidKey);
};

export {getUid, extractXAuthToken, tokensToHeaders, tokensToHeadersMultiPart, withPageAndCount, SessionKeys };