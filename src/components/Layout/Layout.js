import React from "react";
import {
  Route,
  Switch,
  Redirect,
  withRouter,
} from "react-router-dom";
import classnames from "classnames";

// styles
import useStyles from "./styles";

// components
import Header from "../Header";
import Sidebar from "../Sidebar";

// pages
// import Dashboard from "../../pages/dashboard";
import Typography from "../../pages/typography";
import Notifications from "../../pages/notifications";
import Maps from "../../pages/maps";
import Tables from "../../pages/tables";
import Icons from "../../pages/icons";
import Charts from "../../pages/charts";

// context
import { useLayoutState } from "../../context/LayoutContext";
import RouteConsts from "../RouteConsts";
import AdmProdTable from "../../pages/xg-adm-prodtable/AdmProdTable";
import SharedOrderTable from "../../pages/xg-shared-ordertable/SharedOrderTable";
import ProfOrgProdTable from "../../pages/xg-porg-prodtable/ProfOrgProdTable";
import AdmApprSalesAppl from "../../pages/xg-adm-apprsalessppl/AdmApprSalesAppl";
import AdmPorgMgmt from "../../pages/xg-adm-porgmgmt/AdmPorgMgmt";

import { UserDispatchContext } from '../../context/UserContext';

function Layout(props) {
  var classes = useStyles();

  // global
  var layoutState = useLayoutState();

  return (
    <UserDispatchContext.Consumer>
    {
      userDispatch =>

    <div className={classes.root}>
        <>
          <Header history={props.history} />
          <Sidebar />
          <div
            className={classnames(classes.content, {
              [classes.contentShift]: layoutState.isSidebarOpened,
            })}
          >
            <div className={classes.fakeToolbar} />
            <Switch>
              {/* <Route path="/app/dashboard" component={Dashboard} /> */}
              <Route path={RouteConsts.AdminProdTable.link} component={() => <AdmProdTable userDispatch={userDispatch} history={props.history} />} />
              {/* <Route path="/app/typography" component={Typography} /> */}
              <Route path={RouteConsts.OrderTable.link} component={SharedOrderTable} userDispatch={userDispatch} history={props.history} />
              {/* <Route path="/app/tables" component={Tables} /> */}
              <Route path={RouteConsts.PorgProdTable.link} component={ProfOrgProdTable} userDispatch={userDispatch} history={props.history} />
              {/* <Route path="/app/notifications" component={Notifications} /> */}
              <Route path={RouteConsts.SalesApplApprTable.link} component={AdmApprSalesAppl} userDispatch={userDispatch} history={props.history} />
              <Route path={RouteConsts.PorgMgmt.link} component={AdmPorgMgmt} userDispatch={userDispatch} history={props.history} />
              {/* <Route
                exact
                path="/app/ui"
                render={() => <Redirect to="/app/ui/icons" />}
              />
              <Route path="/app/ui/maps" component={Maps} />
              <Route path="/app/ui/icons" component={Icons} />
              <Route path="/app/ui/charts" component={Charts} /> */}
            </Switch>
          </div>
        </>
    </div>
    }
    </UserDispatchContext.Consumer>
  );
}

export default withRouter(Layout);
