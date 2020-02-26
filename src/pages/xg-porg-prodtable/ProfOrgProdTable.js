import React, { Component } from 'react';
import { forwardRef } from 'react';

import PlaylistAddCheck from '@material-ui/icons/PlaylistAddCheck';
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
import Typography from '@material-ui/core/Typography';
import DataSrcDS from '../../data/DataSrcDS';
import SnackbarUtil from '../../components/XgSnackBarUtil/SnackbarUtil';
import ApplyMedSalesDlg from '../xg-adm-applysalesdlg/ApplyMedSalesDlg';

import {getUid} from '../../context/UserContext';
import {log} from '../../utils/Util';

const tableIcons = {
    ApplySales: forwardRef((props, ref) => <PlaylistAddCheck {...props} ref={ref} />),
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

class ProfOrgProdTable extends Component {
  constructor(props) {
    super(props);
    this.tableRef = React.createRef();
    this.sbarRef = React.createRef();

    this.dataSrc = new DataSrcDS(
      props.userDispatch,
      props.history,
      () => log('ProdMgmt error handler todo')
    );
  };

  state = {
    page: -1,
    products: [],
    totalCount: -1,
    openApplyDlg: false,
    applyDlgProductName: '',
    applyDlgCommissionRate: 0.0,
    defaultCommissionRates: { },
    applicationMap: { }
  }

  getProfOrgId = () => {
    return getUid();
  }

  async componentDidMount() {

    let t0 = await this.dataSrc.prodMgmtReq(this.getProfOrgId());
    log('all t0:', t0);

    let t = t0[0];

    const { page, products, totalCount } = t.data;

    let commissionRates = t0[1].data;
    log('commissionRates:', commissionRates);

    let defaultCommissionRates = {};
    commissionRates.forEach(c => {
      defaultCommissionRates[c.productId] = c.rate;
    });
    log('default product commission rate:', defaultCommissionRates);

    let existingApplications = t0[2].data;
    log('existingApplications:', existingApplications);
    let applicationMap = { };
    existingApplications.forEach(a => applicationMap[a.productId] = a.isApproved);
    log('applicationMap:', applicationMap);
    products.forEach(p => p.status = applicationMap[p.product.id]);

    this.setState({ page, products, totalCount, defaultCommissionRates });
  }

  onApplySales = (prodId, prodName, applyDlgCommissionRate) => {
    this.setState({
      openApplyDlg: true,
      applyDlgProductId: prodId,
      applyDlgProductName: prodName,
      applyDlgCommissionRate
    });
  }

  onCancelApply = () => this.setState({openApplyDlg: false})

  onSubmitApply = (productId, commissionRate, info) => {
    const salesApp = {
      productId,
      orgId: this.getProfOrgId(),
      rate: commissionRate,
      info
    };
    //const req = { salesApp };
    log('in onSubmitApply', salesApp);

    this.dataSrc.submitProductSalesApplication(
      salesApp,
      opResp => {
        this.sbarRef.current.showOpResp(opResp, '申请已成功提交');
        this.setState({openApplyDlg: false});
        this._updateApplStatus(productId);
        //log('onSubmitApply todo:', resp);
      }
    )
  }

  _updateApplStatus = prodId => {
    let products = this.state.products;
    products.forEach(prod => {
      if (prod.product.id === prodId) {
        prod.status = 'N';
        log('[todo] updated: ', prod.product)
      }
    });
    this.setState({ products });
  }

  render() {
    //const state = this.state;
    return (

      <Container>
        <SnackbarUtil ref={this.sbarRef} />
        <ApplyMedSalesDlg
          open={this.state.openApplyDlg}
          productId={this.state.applyDlgProductId}
          productName={this.state.applyDlgProductName}
          commissionRate={this.state.applyDlgCommissionRate}
          onCancel={this.onCancelApply}
          onSubmit={this.onSubmitApply}
         />

        <MaterialTable
          icons={tableIcons}
          tableRef={this.tableRef}
          title="产品列表"
          columns={[
            { title: '产品名', field: 'product.name' },
            { title: '简称', field: 'product.shortName' },
            { title: '零售价', field: 'product.price0', type: 'numeric' },
            {
              title: '状态', field: 'status',
              render: prod => prod.status !== undefined ? (
                prod.status === 'Y' ?
                  <span style={{color: 'green'}}>审批通过</span> :
                  <span style={{color: 'blue'}}>审批中</span>
              ) : <span style={{color: 'red'}}>未申请审批</span>
            },
            {
              title: '预览图',
              field: 'imgUrl',
              render: prodData => {
                let url = prodData.assetItems.length === 0 ? '' : `/product/${prodData.product.id}/${prodData.assetItems[0].url}`;
                return <img src={url} style={{width: 50}}/>
              }
            }
          ]}
          data={this.state.products}
          
          // todo: disable editing for now
          // editable={{
          //   onRowAdd: this.onRowAdd,
          //   onRowUpdate: this.onRowUpdate,
          //   onRowDelete: this.onRowDelete
          // }}

          actions={[
            row => ({
              icon: () => <PlaylistAddCheck />,
              tooltip: <Typography>申请代理该药品</Typography>,
              isFreeAction: true,
              onClick: () => {
                let prodId = row.product.id;
                let prodName = row.product.name;
                let applyDlgCommissionRate = this.state.defaultCommissionRates[row.product.id];
                //log(applyDlgCommissionRates);
                this.onApplySales(prodId, prodName, applyDlgCommissionRate);
              }
            })
          ]}
        />
      </Container>
  );
  }
};

export default ProfOrgProdTable;
