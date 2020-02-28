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

import { fontSize } from '@material-ui/system';
import DataSrcDS from '../../data/DataSrcDS';
import ProdImageSmall from '../xg-adm-prodimage/ProdImageSmall';
import ApplyMedSalesDlg from '../xg-adm-applysalesdlg/ApplyMedSalesDlg';
import SnackbarUtil from '../../components/XgSnackBarUtil/SnackbarUtil';

import { withStyles } from '@material-ui/core/styles';
import {log, restBaseUrl} from '../../utils/Util';


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

const styles = {
  container: {
    backgroundColor: '#fff',
    padding: '20px'
  }
};

//const userDispatch = useUserDispatch();

class AdmProdTable extends Component {
  constructor(props) {
    super(props);
    this.tableRef = React.createRef();
    this.sbarRef = React.createRef();

    this.userDispatch = props.userDispatch;

    this.dataSrc = new DataSrcDS(
      props.userDispatch,
      props.history,
      () => {
        log('AdminProdMgmt error handler todo');
        //log(userDispatch);
      }
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

  async componentDidMount() {
    // let t0 = await DataSrc.ProfOrg.getProductInfos(
    //   { proforgId: this.getProfOrgId() }
    // );
    const t0 = await this.dataSrc.adminProdMgmtReq();
    
    let t = t0[0];

    log('products t:', t, t.xauthToken);
    const { page, products, totalCount } = t.data;

    // let existingApplications = t0[2].data.obj;
    // log('existingApplications:', existingApplications);
    // let applicationMap = { };
    // existingApplications.forEach(a => applicationMap[a.productId] = a.isApproved);
    // log('applicationMap:', applicationMap);
    // products.forEach(p => p.status = applicationMap[p.product.id]);

    this.setState({ page, products, totalCount });
  }

  onRowAdd = newProdData =>
    new Promise(resolve => {
      const uid = this.dataSrc.getUid(); //this.getProfOrgId(); //
      log('getItem from session', uid);
      const prod = {
        id: null,
        ...newProdData.product,
        detailedInfo: '',
        keywords: '',
        categories: '',
        producerId: uid
      };
      this.dataSrc.newProduct(
        prod, newProdResp => {
          resolve();
          log('newProdResp: ', newProdResp);
          this.sbarRef.current.showOpResp(newProdResp, '添加成功');
          if (newProdResp.success) {
            const newProd = newProdResp.obj;
            const products = this.state.products;
            products.push({
              product: newProd,
              assetItems: []
            })
            this.setState({products});
          }
          else {
            // todo:
          }
        }
      )
      // fetch(() => {
      //   resolve();
      //   const data = {...this.state.data};
      //   data.products.push(newData);
      //   this.setState({ ...this.state, data });
      // }, 600);
    })

  onRowDelete = oldData =>
    new Promise(resolve => {
      setTimeout(() => {
        resolve();
        // const data = {...this.state.data};
        // const oldDataIdx = data.products.indexOf(oldData);
        // data.products.splice(data.products[oldDataIdx], 1);
        // this.setState({ ...this.state, data });
      }, 600);
    })

  // onCancelApply = () => this.setState({openApplyDlg: false})

  // onSubmitApply = (productId, commissionRate, info) => {
  //   const salesApp = {
  //     productId,
  //     orgId: this.getProfOrgId(),
  //     rate: commissionRate,
  //     info
  //   };
  //   const req = { salesApp };
  //   log('in onSubmitApply', req);

  //   this.dataSrc.submitProductSalesApplication(
  //     req,
  //     opResp => {
  //       this.sbarRef.current.showOpResp(opResp, '申请已成功提交');
  //       this.setState({openApplyDlg: false});
  //       //log('onSubmitApply todo:', resp);
  //     }
  //   )
  // }

  render() {
    //const state = this.state;
    const { classes } = this.props;
    return (

          <Container className={classes.container}>
            {/* <div>Authenicated:: {`${this.userDispatch}`}</div> */}
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
              // {
              //   title: '状态', field: 'status',
              //   render: prod => prod.status !== undefined ? (
              //     prod.status === 'Y' ?
              //       <span style={{color: 'green'}}>审批通过</span> :
              //       <span style={{color: 'blue'}}>审批中</span>
              //   ) : <span style={{color: 'red'}}>未申请审批</span>
              // },
              {
                title: '预览图',
                field: 'imgUrl',
                render: prodData =>
                  <ProdImageSmall
                    productId={prodData.product.id}
                    imageUrlBase={`${restBaseUrl}/product`}
                    imgUrl0={prodData.assetItems.length == 0 ? '' : `/${prodData.product.id}/${prodData.assetItems[0].url}`}
                    prodName={prodData.product.name} />
              }
            ]}
            data={this.state.products}
            
            // todo: disable editing for now
            editable={{
              onRowAdd: this.onRowAdd,
              onRowUpdate: this.onRowUpdate,
              onRowDelete: this.onRowDelete
            }}
          />
        </Container>

  );
  }
};

export default withStyles(styles)(AdmProdTable);