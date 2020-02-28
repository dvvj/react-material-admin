const log = function() {
  console.log(...arguments);
};

const getRestBaseUrl = () => {
  if (process.env.REACT_APP_ADMIN_REST_ENDPOINT) {
    log(`Setting baseURL to ${process.env.REACT_APP_ADMIN_REST_ENDPOINT}`);
    return process.env.REACT_APP_ADMIN_REST_ENDPOINT;
  }
  else {
    log(`empty base url`);
    return "";
  }
};

const restBaseUrl = getRestBaseUrl();

module.exports = {
  log,
  restBaseUrl
};