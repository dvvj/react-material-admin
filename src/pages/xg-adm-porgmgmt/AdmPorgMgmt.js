import React, { Component } from 'react';
import { forwardRef } from 'react';

import Lock from '@material-ui/icons/Lock';
import AddBox from '@material-ui/icons/AddBox';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import Refresh from '@material-ui/icons/Refresh';
import ViewColumn from '@material-ui/icons/ViewColumn';
import MaterialTable from 'material-table';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';

import { fontSize } from '@material-ui/system';
import DataSrcDS from '../../data/DataSrcDS';
import SnackbarUtil from '../../components/XgSnackBarUtil/SnackbarUtil';
import SetPassDlg from '../../components/XgSetPassDlg/SetPassDlg';
import {log} from '../../utils/Util';

const tableIcons = {
    Lock: forwardRef((props, ref) => <Lock {...props} ref={ref} />),
    Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
    Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
    Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
    DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
    Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
    Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
    FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
    LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
    NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
    ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
    Refresh: forwardRef((props, ref) => <Refresh {...props} ref={ref} />),
    SortArrow: forwardRef((props, ref) => <ArrowUpward {...props} ref={ref} />),
    ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
    ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
  };

class AdmPorgMgmt extends Component {
  constructor(props) {
    super(props);
    this.tableRef = React.createRef();
    this.dlgRef = React.createRef();
    this.sbarRef = React.createRef();

    this.dataSrc = new DataSrcDS(
      props.history,
      () => log('ProfOrgMgmt error handler todo')
    );
  };

  state = {
    page: -1,
    proforgs: [],
    totalCount: -1,
    rewardPlanDescMap: {}
  }

  async componentDidMount() {
    // const results = await DataSrc.SysAdmin.getAllProfOrgsAndRewardPlans();
    const results = await this.dataSrc.profOrgMgmtReq();
    log('results: ', results);

    // reward plans
    const { pageRp, rewardPlans, totalCountRp } = results[1].data; //await DataSrc.SysAdmin.getAllProfOrgs();
    log('rewardPlans:', rewardPlans);

    const rewardPlanMap = {};
    const rewardPlanDescMap = {};
    rewardPlans.forEach(rp => {
      rewardPlanMap[rp.id] = rp;
      rewardPlanDescMap[rp.id] = rp.info;
    });

    // reward plan records for orgs
    const { pageRpc, rewardPlanRecs, totalCountRpc } = results[2].data; //await DataSrc.SysAdmin.getAllProfOrgs();
    log('rewardPlan recs:', rewardPlanRecs);
    const currRpMap = {}
    rewardPlanRecs.forEach(rpr => {
      currRpMap[rpr.uid] = rpr.planId;
    });
    
    const { page, proforgs, totalCount } = results[0].data; //await DataSrc.SysAdmin.getAllProfOrgs();
    proforgs.forEach( org => {
      org.rewardPlan = currRpMap[org.uid];
    })
    log('proforgs:', proforgs);
    this.setState({ page, totalCount, rewardPlanMap, rewardPlanDescMap });
    this.setProfOrgs(proforgs);
  }

  setProfOrgs = function(newData) {
    const proforgs = newData.sort((a, b) => a.uid.localeCompare(b.uid));
    this.setState({proforgs});
  }

  onRowAdd = async newOrgData => {
    const proforgReq = {
      ...newOrgData,
      rewardPlanId: newOrgData.rewardPlan
    };

    this.dataSrc.newProfOrg(
      proforgReq,
      newOrgResp => {
        log('new ProfOrg: ', newOrgResp);
        this.sbarRef.current.showOpResp(newOrgResp, '添加成功');
        if (newOrgResp.success !== false) {
          const proforgs = this.state.proforgs;
          const { proforg, rewardPlanId } = newOrgResp.obj;
          const proforgRow = {...proforg, rewardPlan: rewardPlanId};
          //this.status.rewardPlanDescMap[rewardPlanId];

          proforgs.push(proforgRow);
          this.setProfOrgs(proforgs);
        }
      }
    )
  }

  onRowUpdate = async (newOrgData, oldOrgData) => {
    // let uid = sessionStorage.getItem('uid');
    // log('uid from session', uid);
    const proforgReq = {
      //proforg: newOrgData,
      ...newOrgData,
      rewardPlanId: newOrgData.rewardPlan
    };
    log('updateProfOrg: ', proforgReq);

    this.dataSrc.updateProfOrg(
      proforgReq, resp => {
        let proforgs = this.state.proforgs;
        log('updateProfOrg resp: ', resp);
        this.sbarRef.current.showOpResp(resp, '更新成功');
        if (resp.success !== false) {
          proforgs = proforgs.filter(org => org.uid !== newOrgData.uid);
          log('newOrgData: ', newOrgData);
          proforgs.push(newOrgData);
          this.setProfOrgs(proforgs);
        }
        
      }
    )
  }
  // onRowUpdate = (newOrgData, oldOrgData) =>
  //   new Promise(resolve => {
  //     // let uid = sessionStorage.getItem('uid');
  //     // log('uid from session', uid);
  //     const proforgReq = {
  //       proforg: newOrgData,
  //       rewardPlanId: newOrgData.rewardPlan
  //     };

  //     this.dataSrc.updateProfOrg(
  //       proforgReq, resp => {
  //         resolve();
  //         var proforgs = this.state.proforgs;
  //         log('updateProfOrg resp: ', resp, newOrgData);
          
  //         proforgs = proforgs.filter(org => org.uid !== newOrgData.uid);
  //         proforgs.push(newOrgData);
  //         this.setProfOrgs(proforgs);
  //       }
  //     )
  //   })


  onRowDelete = oldData =>
    new Promise(resolve => {
      setTimeout(() => {
        resolve();

      }, 600);
    })

  onRefresh = () =>
    new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, 600);
    })

  render() {
    //const state = this.state;
    return (
      <Container>
        <SnackbarUtil ref={this.sbarRef} />
        <SetPassDlg ref={this.dlgRef} />
        <MaterialTable
          icons={tableIcons}
          tableRef={this.tableRef}
          title="医药公司列表"
          columns={[
            // { title: '公司ID', field: 'uid' },
            { title: '公司名', field: 'name' },
            { title: '基本信息', field: 'info' },
            { title: '联系电话', field: 'mobile' },
            { title: '奖励套餐', field: 'rewardPlan',
              lookup: this.state.rewardPlanDescMap
            },
          ]}
          data={this.state.proforgs}
          editable={{
            onRowAdd: this.onRowAdd,
            onRowUpdate: this.onRowUpdate,
            onRowDelete: this.onRowDelete
          }}
          options={{
            pageSize: 10
          }}
          actions={[
            row => ({
              icon: Lock,
              tooltip: '设置密码',
              onClick: (event, proforg) => {
                log(proforg);
                this.dlgRef.current.handleOpen(true, proforg.uid);
              }
            })
          ]}
        />
      </Container>
  );
  }
};

export default AdmPorgMgmt;
