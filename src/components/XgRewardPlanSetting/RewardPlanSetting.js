import React, { Component } from 'react';
import { forwardRef } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Container from '@material-ui/core/Container';

import SnackbarUtil from '../XgSnackBarUtil/SnackbarUtil';
import {getUid} from '../../context/UserContext';

import Draggable from 'react-draggable';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import { styled } from '@material-ui/core/styles';
import RewardPlanSettingContent from './RewardPlanSettingContent';

// const tableIcons = {
//   SettingsEthernetIcon: forwardRef((props, ref) => <SettingsEthernetIcon {...props} ref={ref} />),
//   Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
//   Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
//   Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
//   Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
//   DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
//   Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
//   Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
//   Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
//   FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
//   LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
//   NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
//   PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
//   ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
//   Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
//   Refresh: forwardRef((props, ref) => <Refresh {...props} ref={ref} />),
//   SortArrow: forwardRef((props, ref) => <ArrowUpward {...props} ref={ref} />),
//   ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
//   ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
// };


function DraggableComponent(props) {
  return (
    <Draggable cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}

const StyledGrid = styled(Grid)(
  {
    flexGrow: 1
  }
);

// const SettingsRef = forwardRef((props, ref) => <RewardPlanSettingContent ref={ref} />);

class RewardPlanSetting extends Component {
  constructor(props) {
    super(props);

    this.dataSrc = props.dataSrc;
    this.sbarRef = React.createRef();
    this.settingsRef = React.createRef();
  }

  
  state = {
    open: false,
    proforgId: null,
    rewardPlan: {},
    products: [],
    rewardPlanEntries: []
  }

  setProducts = products => {
    this.setState({ products });
  }

  handleOpen = (toOpen, proforgId, rewardPlan) => {
    this.setState({ open: toOpen, proforgId, rewardPlan });
    // if (toOpen) {
    //   console.log('this.settingsRef: ', this.state.products, this.settingsRef);
    //   this.settingsRef.current.initProducts(this.state.products);
    // }
  }

  close = () => this.handleOpen(false, null, null);

  // setErrorText = (name, errorText) => {
  //   let errorTexts = this.state.errorTexts;
  //   errorTexts[name] = errorText;
  //   this.setState({ errorTexts });
  // }

  // onRowDelete = oldData =>
  //   new Promise(resolve => {
  //     setTimeout(() => {
  //       resolve();
  //     }, 600);
  //   })
  // getProfOrgId = () => {
  //   //return sessionStorage.getItem('uid');
  //   const uid = sessionStorage.getItem(SessionKeys.uidKey);
  
  //   return uid;
  // }
  
  createRewardPlan = async e => {
    let rewardPlanEntries = this.settingsRef.current.getRewardPlanEntries();

    this.dataSrc.priceMgmt_NewRewardPlan(
      {
        planId: this.state.rewardPlan.id,
        creatorId: getUid(),
        desc: this.state.rewardPlan.info,
        rewardPlanEntries
      },
      opResp => {
        console.log('opResp: ', opResp);
        this.sbarRef.current.showOpResp(opResp, `奖励套餐【${this.state.rewardPlan.id}】创建成功`)
        if (opResp.success) {
          const newRewardPlan = opResp.obj;
          this.props.createRewardPlanCallback(newRewardPlan);
          this.close();
        }
      }
    );
    // let t = await DataSrc.ProfOrg.newRewardPlan({
    //   planId: this.state.rewardPlan.id,
    //   creatorId: this.getProfOrgId(),
    //   desc: this.state.rewardPlan.info,
    //   rewardPlanEntries
    // }, opResp => {
    //   console.log('opResp: ', opResp);
    //   this.sbarRef.current.showOpResp(opResp, `奖励套餐【${this.state.rewardPlan.id}】创建成功`)
    //   if (opResp.success) {
    //     const newRewardPlan = opResp.obj;
    //     this.props.createRewardPlanCallback(newRewardPlan);
    //     this.close();
    //   }
    // });
  }

  render() {
    return (
      <div>
        <SnackbarUtil ref={this.sbarRef} />
        <Dialog
          disableBackdropClick
          disableEscapeKeyDown
          fullWidth={true}
          maxWidth={'lg'}
          PaperComponent={DraggableComponent}
          open={this.state.open}
          onClose={this.close}
          aria-labelledby="form-dialog-title">
          <DialogTitle
            style={{ cursor: 'move' }} 
            id="form-dialog-title">设置奖励套餐</DialogTitle>
          <DialogContent>
            <RewardPlanSettingContent ref={this.settingsRef} 
              products={this.state.products}
              />
            {/* <StyledGrid containter>
              <Grid item xs={6}>
                <TransferList />
              </Grid>
              <Grid item xs={3}>
                <MaterialTable
                  icons={tableIcons}
                  tableRef={this.tabRef}
                  title="奖励配置列表（按产品）"
                  columns={[
                    { title: '产品列表', field: 'productList' },
                    { title: '奖励百分比', field: 'reward' }
                  ]}
                  data={this.state.rewardPlanEntries}
                  editable={{
                    onRowDelete: this.onRowDelete
                  }}
                />
              </Grid>
            </StyledGrid> */}

          </DialogContent>
          {/* <DialogContent>
            <DialogContentText>
              To subscribe to this website, please enter your email address here. We will send updates
              occasionally.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Email Address"
              type="email"
              fullWidth
            />
          </DialogContent> */}
          <DialogActions>
            <Button onClick={this.close} color="primary">取消</Button>
            <Button onClick={this.createRewardPlan} color="primary">创建奖励套餐</Button>
          </DialogActions>
        </Dialog>
      </div>
    );  
  }
};

export default RewardPlanSetting;