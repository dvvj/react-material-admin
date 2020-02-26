import Axios from 'axios';

import {getUid, extractXAuthToken, tokensToHeaders, tokensToHeadersMultiPart, withPageAndCount, SessionKeys } from '../context/SessionContext';

export default class DataSrcDS {
  constructor(baseUrl, error401Handler, errorUnkHandler) {
    this.baseUrl = baseUrl;
    this.error401Handler = error401Handler;
    this.errorUnkHandler = errorUnkHandler;
  }

  getUrl = path => this.baseUrl + path;

  handleError = error => {
    if (error.response) {
      // // The request was made and the server responded with a status code
      // // that falls out of the range of 2xx
      // console.log(error.response.data);
      // console.log(error.response.status);
      // console.log(error.response.headers);
      if (error.response.status === 401) {
        this.error401Handler();
      }
      else {
        console.log(`Unhandled status code: ${error.response.status}`);
        if (this.errorUnkHandler) {
          this.errorUnkHandler(error.response.status, error);
        }
      }
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error);
    }
    console.log(error.config);
  }

  multiPostTkr = async (dataUrlCallbacks, _traceTag) => {
    let headers = tokensToHeaders();

    const reqs = dataUrlCallbacks.map(duc => {
      const {data, method, url} = duc;
      const m = method || 'POST';
      // console.log('method: ', m);
      const options = {
        method: m,
        headers,
        url,
        data
      };
    
      return Axios(options);
    });

    const traceTag = _traceTag ? _traceTag : 'NoTag';

    return Axios.all(reqs)
      .then(Axios.spread((...responses) => {
        console.log(`[${traceTag}] responses: `, responses);
        return responses.map((response, index) => {
          console.log(`[${traceTag}] response[${index}]: `, response);
          var xauth = extractXAuthToken(response);
          if (xauth) {
            sessionStorage.setItem(SessionKeys.xauthTokenKey, xauth);
            console.log('x-auth token saved session: ', xauth);
          }
    
          const data = response.data;
          const callback = dataUrlCallbacks[index].callback;
          const res = callback(data);
          return({data: res, xauth});  
        });
      })).catch(err => {
        this.handleError(err);
      });
  }

  _doPost = async (data, url, callback, addTokens) => {
    const CancelToken = Axios.CancelToken;
    const source = CancelToken.source();
  
    const options = {
      method: 'POST',
      url,
      data,
      cancelToken: source.token
    };

    if (addTokens) {
      const headers = tokensToHeaders();
      options['headers'] = headers;
    }
  
    return Axios(options)
      .then(response => {
        console.log('response: ', response);
        var xauth = extractXAuthToken(response);
        if (xauth) {
          sessionStorage.setItem(SessionKeys.xauthTokenKey, xauth);
          console.log('x-auth token saved session: ', xauth);
        }
  
        let data = response.data;
        let res = callback(data);
        return({data: res, xauth});
      })
      .catch(err => {
        this.handleError(err);
      });
  }

  doPost = async (data, url, callback) => {
    return this._doPost(data, url, callback, false);
  }

  doPostTkr = async (data, url, callback) => {
    return this._doPost(data, url, callback, true);
  }

  doPostTkrOpts = async (options) => {
    const {data, url, callback} = options;
    return this._doPost(data, url, callback, true);
  }

  doGetTkr = async (url, cb) => {
    let headers = tokensToHeaders();
    const options = {
      method: 'GET',
      headers,
      url
    };
  
    return Axios(options)
      .then(result => {
        console.log('result:', result);
        let res = cb(result);
        return res;
      })
      .catch(err => {
        this.handleError();
      });
  };

  requestConfigs = {
    allProducts: {
      url: '/api/productsWithAssets',
      method: 'GET',
      callback: data => withPageAndCount('products', data)
    }
  }

  prodMgmtReq = async (proforgId) => {
    return this.multiPostTkr(
      [
        this.requestConfigs.allProducts,
        {
          url: '/proforg/productDefaultRates',
          method: 'GET',
          callback: data => data
        },
        {
          data: {orgId: proforgId},
          url: '/proforg/getProdSalesApplications',
          callback: data => data
        }
      ],
      'prodMgmtReq'
    );
  };

  adminProdMgmtReq = async () => {
    return this.multiPostTkr(
      [{
        url: '/api/productsWithAssets',
        method: 'GET',
        callback: data => withPageAndCount('products', data)
      }],
      'adminProdMgmtReq'
    );
  };

  profOrgMgmtReq = async () => {
    return this.multiPostTkr(
      [{
        url: '/api/proforgs',
        method: 'GET',
        callback: proforgs => withPageAndCount('proforgs', proforgs)
      },{
        url: '/api/getAdminRewardPlans',
        method: 'GET',
        callback: plans => withPageAndCount('rewardPlans', plans)
      },{
        url: '/api/getRewardPlan4Orgs',
        method: 'GET',
        callback: recs => withPageAndCount('rewardPlanRecs', recs)
      }],
      'profOrgMgmtReq'
    );
  };

  priceMgmtReq = async (proforgId) => {
    return this.multiPostTkr(
      [{
        data: {proforgId},
        url: '/api/getRewardPlansByProfOrg',
        callback: plans => {
          console.log('plans: ', plans);
          return withPageAndCount('rewardPlans', plans);
        }
      },
      {
        data: {orgId: proforgId},
        url: '/proforg/allApprovedProducts',
        callback: resp => {
          let x = withPageAndCount('products', resp);
          console.log('resp: ', x, resp);
          return x;
        }
      }],
      'priceMgmtReq'
    );
  }

  priceMgmt_DeleteRewardPlan = async (planId, callback) => {
    return this.doPostTkr(
      {planId},
      '/api/deleteRewardPlan',
      callback
    );
  }

  priceMgmt_NewRewardPlan = async (reqData, callback) => {
    return this.doPostTkr(reqData, '/api/newRewardPlan', callback);
  }

  // let getOrdersByCurrUser = (url) => {
  //   const uid = getUid();
  //   return doPostTkr(
  //     { uid },
  //     url,
  //     orders => withPageAndCount('orders', orders)
  //   );
  // };
  orderListUrls = {
    Today: '/api/ordersToday',
    Last7Days: '/api/ordersLatest7Days',
    ThisMonth: '/api/ordersThisMonth'
  }
  
  genOrderListReqConfig = (uid, url) => ({
    data: {uid},
    url: url,
    callback: orders => {
      console.log('orders: ', orders);
      return withPageAndCount('orders', orders);
    }
  })

  orderListReq = async () => {
    const uid = getUid();
    return this.multiPostTkr(
      [
        this.genOrderListReqConfig(uid, this.orderListUrls.Today),
        this.requestConfigs.allProducts
      ],
      'priceMgmtReq'
    );
  }

  newProduct = (data, cb) => {
    return this.doPostTkr(data, '/api/newProduct', cb);
  }

  getOrdersOf = async (rangeUrl) => {
    const uid = getUid();
    return this.doPostTkrOpts(
      this.genOrderListReqConfig(uid, rangeUrl)
    );
  }

  getOrdersToday = async () => this.getOrdersOf(this.orderListUrls.Today)
  getOrdersLatest7Days = async () => this.getOrdersOf(this.orderListUrls.Last7Days)
  getOrdersThisMonth = async () => this.getOrdersOf(this.orderListUrls.ThisMonth)

  doLogin = async (userpass, callback) => {
    //let {user, pass} = userpass;
    // console.log('in doLogin', user, pass);
    return this.doPost(
      userpass,
      '/api/login',
      resp => {
        console.log('login resp:', resp);
        let { oauth2, uid, userType } = resp;

        sessionStorage.setItem(SessionKeys.uidKey, uid);
        sessionStorage.setItem(SessionKeys.accessTokenKey, oauth2.access_token);
        // let t = sessionStorage.getItem(DataSrc.SessionKeys.accessTokenKey);
        // sessionStorage.setItem('userType', userType);
        console.log('login ok: ', userType, oauth2);

        callback(resp);
      }
    );
  }

  // getProdApplToApprove: () => {
  //   return doGetTkr(
  //     '/admin/salesApplications',
  //     resp => withPageAndCount('applications', resp)
  //   )
  // }
  getProdApplApprovalInfo = () => {
    // return multiPosts(
    //   [
    //     DataSrc.SysAdmin.getProdApplToApprove(),
    //     DataSrc.getAllProducts()
    //   ]
    // )
    return this.multiPostTkr(
      [
        {
          url: '/admin/salesApplications',
          method: 'GET',
          callback: resp => withPageAndCount('applications', resp.obj)
        },
        this.requestConfigs.allProducts
      ],
      'getProdApplApprovalInfo'
    );
  }

  approveSalesApplication = (applId, cb) => {
    return this.doPostTkr(
      applId,
      '/admin/approveSalesApplications',
      resp => {
        console.log('application approval resp: ', resp);
        cb(resp);
      }
    )
  }
};

//export default DataSrcDS;