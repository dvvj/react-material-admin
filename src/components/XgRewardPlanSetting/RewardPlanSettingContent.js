import React, {Component} from 'react';
import { makeStyles, styled } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import { forwardRef } from 'react';
import TransferList from './TransferList';
import MaterialTable from 'material-table';
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
import Button from '@material-ui/core/Button';

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

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
}));

class RewardPlanSettingContent extends Component {
  constructor(props) {
    super(props);
    this.tabRef = React.createRef();
    // this.transferListRef = React.createRef();
  }

  state = {
    configEntries: []
  }

    // forwardRef((props, ref) => <TransferList {...props} ref={ref} />);
  // const { products } = props;

  // const [values, setValues] = React.useState({
  //   products: [],
  //   rewardPlanEntries: []
  // });

  // initProducts = products => {
  //   this.transferListRef.current.setProducts(products);
  // }

  onRowDelete = oldData =>
    new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, 600);
    })

  onRowUpdate = oldData =>
    new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, 600);
    })

  selectionCallback = (selectedProducts, rewardRate) => {
      console.log('selectedProducts: ', selectedProducts);
      if (selectedProducts.length > 0) {
        let configEntries = this.state.configEntries;
        let ids = selectedProducts.map(p => p.id);
        // let names = selectedProducts.map(p => p.shortName).join("】【");
        // let productNames =  `【${names}】`;
        let productNames = selectedProducts.map(p => p.shortName).join(" - ");
        configEntries.push({
          productIds: ids,
          productNames,
          rewardRate
        });
        this.setState({configEntries});
      }
    }

  getRewardPlanEntries() {
    return this.state.configEntries;
  }

  render() {
    return (
      <div>
        <Grid container spacing={1}>
          <Grid item xs={7}>
            <TransferList
              products={this.props.products}
              selectionCallback={this.selectionCallback} />
          </Grid>

          <Grid item xs={4}>
            <MaterialTable
              icons={tableIcons}
              tableRef={this.tabRef}
              title="奖励配置列表（按产品）"
              columns={[
                { title: '产品列表', field: 'productNames' },
                { title: '回报百分比', field: 'rewardRate',
                  render: row => `${row.rewardRate}%`
                }
              ]}
              data={this.state.configEntries}
              // editable={{
              //   onRowDelete: this.onRowDelete
              // }}
            />
          </Grid>
        </Grid>
      </div>
    );
    }
};

export default RewardPlanSettingContent;