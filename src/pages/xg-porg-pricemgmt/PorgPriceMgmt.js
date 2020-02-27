import React, { Component } from 'react';
import { forwardRef } from 'react';

import AddBox from '@material-ui/icons/AddBox';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import SettingsEthernetIcon from '@material-ui/icons/SettingsEthernet';
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

import DataSrcDS from '../../data/DataSrcDS';
import SnackbarUtil from '../../components/XgSnackBarUtil/SnackbarUtil';
import {SessionKeys} from '../../context/UserContext';
import RewardPlanSetting from '../../components/XgRewardPlanSetting/RewardPlanSetting';

const tableIcons = {
    SettingsEthernetIcon: forwardRef((props, ref) => <SettingsEthernetIcon {...props} ref={ref} />),
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

const RewardPlanStatus = {
  NewCreate: "待配置",
  Locked: "已创建"
}

class PorgPriceMgmt extends Component {
  constructor(props) {
    super(props);
    this.tableRef = React.createRef();
    this.sbarRef = React.createRef();
    this.rewardPlanSettingsRef = React.createRef();

    this.dataSrc = new DataSrcDS(
      props.userDispatch,
      props.history,
      () => {
        console.log('PriceMgmt error handler todo');
        this.setState({confirmLogoutDlgOpen: true});
        //this.props.setLoggedOut();
      },
      (status, errorText) => {
        this.sbarRef.current.err(`未知错误:${status}, ${errorText}`);
      }
    );
  };

  state = {
    page: -1,
    products: [],
    totalCount: -1,
    rewardPlans: [],
    rewardPlansPage: -1,
    rewardPlansTotal: -1,

    confirmDlgOpen: false,
    confirmLogoutDlgOpen: false,
    confirmDlgTitle: '',
    rewardPlanToDelete: {}
  }

  getProfOrgId = () => {
    //return sessionStorage.getItem('uid');
    const uid = sessionStorage.getItem(SessionKeys.uidKey);
  
    return uid; //todo
  }

  componentWillUnmount() {
    console.log('in componentWillUnmount');
    //delete this.dataSrc;
  }

  async componentDidMount() {
    const t = await this.dataSrc.priceMgmtReq(this.getProfOrgId());

    console.log('pricemgmt: ', t);

    if (t) {
      const { page, products, totalCount } = t[1].data;
      const { rewardPlans } = t[0].data;
  
      console.log('products/plans:', products, rewardPlans);
      
      rewardPlans.forEach(plan => {
        plan.status = RewardPlanStatus.Locked
      });
      let rewardPlansPage = t[0].page;
      let rewardPlansTotal = t[0].totalCount;
      this.setState({ page, products, totalCount, rewardPlans, rewardPlansPage, rewardPlansTotal });
      console.log('this.state.products:', this.state.products);
      this.rewardPlanSettingsRef.current.setProducts(products);
    }
  }

  onRowAdd = newPlanData =>
    new Promise(resolve => {
      let rewardPlans = this.state.rewardPlans;
      newPlanData.status = RewardPlanStatus.NewCreate;
      rewardPlans.push(newPlanData);
      this.setState({rewardPlans});
      resolve();
    })

  onRowDelete = rowToDelete => {
    return this.dataSrc.priceMgmt_DeleteRewardPlan(
      rowToDelete.id,
      opResp => {
        console.log('onRowDelete resp:', opResp);
        const rewardPlans = this.state.rewardPlans.filter(p => p.id !== rowToDelete.id);
        this.setState({rewardPlans});
        this.sbarRef.current.showOpResp(opResp, '删除成功');
      }
    )
    // return DataSrc.ProfOrg.deleteRewardPlan(
    //   {
    //     planId: rowToDelete.id
    //   },
    //   opResp => {
    //     console.log('onRowDelete resp:', opResp);
    //     const rewardPlans = this.state.rewardPlans.filter(p => p.id !== rowToDelete.id);
    //     this.setState({rewardPlans});
    //     this.sbarRef.current.showOpResp(opResp, '删除成功');
    //   }
    // );
  }

  handleConfirmDlgClose = (confirmed) => {
    console.log('confirm delete: ', confirmed);
    this.setState({confirmDlgOpen: false});

    if (confirmed) {
      this.onRowDelete(this.state.rewardPlanToDelete);
    }
  }

  handleConfirmLogoutDlgClose = () => {
    this.props.setLoggedOut();
  }

  confirmDelete = (currRewardPlan) => {
    let confirmDlgTitle = `确认删除该奖励套餐【${currRewardPlan.id}】？`;
    this.setState({confirmDlgOpen: true, confirmDlgTitle, rewardPlanToDelete: currRewardPlan});
  }

  getCreatedPlanId = origPlanId => {
    return `${this.getProfOrgId()}.${origPlanId}`;
  }

  createRewardPlanCallback = newRewardPlan => {
    const rewardPlans = this.state.rewardPlans.filter(plan => this.getCreatedPlanId(plan.id) !== newRewardPlan.id);
    newRewardPlan.status = RewardPlanStatus.Locked;
    rewardPlans.push(newRewardPlan);
    this.setState({rewardPlans});
  }
  

  render() {
    //const state = this.state;
    return (

      <Container>
        <SnackbarUtil ref={this.sbarRef} />
        {/* <ConfirmDlg
          // classes={{
          //   paper: classes.paper,
          // }}
          keepMounted
          open={this.state.confirmDlgOpen}
          onClose={this.handleConfirmDlgClose}
          title={this.state.confirmDlgTitle}
          value={false}
        /> */}
        {/* <ConfirmLogoutDlg
          keepMounted
          open={this.state.confirmLogoutDlgOpen}
          onClose={this.handleConfirmLogoutDlgClose}
          title={'会话超时，请重新登录'}
        /> */}
        <RewardPlanSetting ref={this.rewardPlanSettingsRef}
          dataSrc={this.dataSrc}
          createRewardPlanCallback={this.createRewardPlanCallback}
          />
        <MaterialTable
          icons={tableIcons}
          tableRef={this.tableRef}
          title="奖励套餐列表"
          columns={[
            { title: '套餐ID', field: 'id' },
            { title: '描述', field: 'info' },
            { title: '状态', field: 'status', editable: 'never',
              render: plan => { //<span style={{color: 'red'}}>{plan.status}</span>

                return (plan ? (
                  plan.status === RewardPlanStatus.Locked ?
                    <span style={{color: 'red'}}>{plan.status}</span> :
                    <span style={{color: 'green'}}>{plan.status}</span>
                  ) : ''
                )
              }
            }
          ]}
          data={this.state.rewardPlans}
          editable={{
            onRowAdd: this.onRowAdd,
            // onRowUpdate: this.onRowUpdate,
            // onRowDelete: this.onRowDelete
          }}
          actions={[
            // config
            row => (
              row.status === RewardPlanStatus.NewCreate ? {
                icon: SettingsEthernetIcon,
                tooltip: '套餐设置',
                onClick: (event, proforg) => {
                  this.rewardPlanSettingsRef.current.handleOpen(true, proforg.id, row);
                }
              } : null
            ),
            // delete
            row => (
              {
                icon: DeleteOutline,
                tooltip: '删除套餐',
                onClick: (event, proforg) => {
                  console.log('proforg: ', proforg);
                  this.confirmDelete(row);
                  //this.onRowDelete(row);
                }
              }
            ),
          ]}
        />
      </Container>
  );
  }
};

export default PorgPriceMgmt;
