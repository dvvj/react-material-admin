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
import DoneOutlineIcon from '@material-ui/icons/DoneOutline';
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

import SnackbarUtil from '../../components/XgSnackBarUtil/SnackbarUtil';
import DataSrcDS from '../../data/DataSrcDS';

const tableIcons = {
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

const Columns = {
  ProductName: 'productName',
  ProductPrice0: 'productPrice0',
  CommissionRate: 'commissionRate',
  Info: 'info',
  OrgId: 'orgId',
};

class AdmApprSalesAppl extends Component {
  constructor(props) {
    super(props);
    this.tableRef = React.createRef();
    this.sbarRef = React.createRef();

    this.dataSrc = new DataSrcDS(
      () => console.log('AdminProdMgmt error handler todo')
    );
  };

  state = {
    page: -1,
    applications: [],
    totalCount: -1
  }

  async componentDidMount() {

    let t = await this.dataSrc.getProdApplApprovalInfo();
    console.log('t:', t);

    let prods = t[1].data;
    let prodMap = {};
    prods.products.forEach(p => prodMap[p.product.id] = p.product);

    let appData = t[0].data;
    console.log('applications:', appData, prodMap);
    const { page, applications, totalCount } = appData;
    applications.forEach(app => {
        app[Columns.ProductName] = prodMap[app.productId].name;
        app[Columns.ProductPrice0] = prodMap[app.productId].price0;
        app[Columns.CommissionRate] = `${app.rate * 100}%`;
    });

    this.setState({ page, applications, totalCount });
  }

  _removeAppl = applId => {
    let appls = this.state.applications;
    appls = appls.filter(appl => appl.id !== applId);
    this.setState({applications: appls});
  }

  _getAppl = applId => {
    let appl = this.state.applications.filter(appl => appl.id === applId)[0];
    const productName = appl[Columns.ProductName];
    const orgId = appl[Columns.OrgId];

    return {productName, orgId};
  }

  onApprove = (e, row) => {
    let applId = row.id;
    console.log('approved: ', applId);
    this.dataSrc.approveSalesApplication(
      applId,
      opResp => {
        console.log('opResp', opResp);
        const {productName, orgId} = this._getAppl(applId);
        this.sbarRef.current.showOpResp(opResp, `医药公司【${orgId}】销售药品【${productName}】申请审批通过`);
        this._removeAppl(applId);
      }
      );
  }

  render() {
    //const state = this.state;
    return (

      <Container>
        <SnackbarUtil ref={this.sbarRef} />
        <MaterialTable
          icons={tableIcons}
          tableRef={this.tableRef}
          title="产品销售申请列表"
          columns={[
            { title: '产品名', field: Columns.ProductName },
            { title: '申请公司', field: Columns.OrgId },
            { title: '基准价格', field: Columns.ProductPrice0, type: 'numeric' },
            { title: '销售佣金比例', field: Columns.CommissionRate },
            { title: '附加信息', field: Columns.Info }
          ]}

          data={this.state.applications}

          actions={[
            row =>
                ({
                    icon: DoneOutlineIcon,
                    tooltip: 'Approve',
                    onClick: this.onApprove
                })
              ]}
        />
      </Container>
  );
  }
};

export default AdmApprSalesAppl;
