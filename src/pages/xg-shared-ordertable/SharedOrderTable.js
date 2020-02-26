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
import Button from '@material-ui/core/Button';

import { fontSize } from '@material-ui/system';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import DataSrcDS from '../../data/DataSrcDS';
import SnackbarUtil from '../../components/XgSnackBarUtil/SnackbarUtil';
import {log} from '../../utils/Util';

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

const TimeRanges = {
    Today: '当日',
    Recent7Days: '最近七天',
    ThisMonth: '当月'
}

class SharedOrderTable extends Component {
    constructor(props) {
        super(props);
        this.tableRef = React.createRef();
        this.sbarRef = React.createRef();

        this.dataSrc = new DataSrcDS(
          props.history,
            () => {
                log('OrderList error handler');
            },
            (status, errorText) => {
                this.sbarRef.current.err(`未知错误:${status}, ${errorText}`);
            }
        );
    };

    state = {
        page: -1,
        orders: [],
        totalCount: -1,
        timeRangeFilter: TimeRanges.Today,
        pageSize: 10,
        prodMap: {},
        prodNameMap: {}
    }

    formatDate = dateStr => {
        return dateStr.slice(0, 10);
    }

    async componentDidMount() {

        //let t = await DataSrc.SysAdmin.getOrdersInitial();
        const t = await this.dataSrc.orderListReq();
        log('t: ', t);

        let prodMap = { };
        let prodNameMap = { };
        t[1].data.products.forEach(prod => {
            // log('prod: ', prod);
            prodMap[prod.product.id] = prod;
            prodNameMap[prod.product.id] = prod.product.name;
        });
        log('prodMap: ', prodMap, prodNameMap);
        this.setState({prodMap, prodNameMap});

        this.processOrderResult(t[0], prodMap);
    }

    processOrderResult = (orderResp, prodMap) => {
        log('orderResp: ', orderResp);
        const { page, orders, totalCount } = orderResp.data;
        orders.forEach(order => {
            order.payTime = this.formatDate(order.payTime);
            order['prodName'] = prodMap[order.productId].product.id; // we use lookup here
        })

        this.setState({ page, orders, totalCount }); 
    }

    timeRangeChange = async e => {
        const newRange = e.target.value;
        log('newRange: ', newRange);
        // this.getExportCsvFileName();

        var orderResp;
        switch (newRange) {
            case TimeRanges.Today:
                orderResp = await this.dataSrc.getOrdersToday();
                this.processOrderResult(orderResp, this.state.prodMap);
                break;
            case TimeRanges.ThisMonth:
                orderResp = await this.dataSrc.getOrdersThisMonth();
                this.processOrderResult(orderResp, this.state.prodMap);
                break;
            case TimeRanges.Recent7Days:
                orderResp = await this.dataSrc.getOrdersLatest7Days();
                this.processOrderResult(orderResp, this.state.prodMap);
                break;
        }

        this.setState({timeRangeFilter: newRange})
    }

    onChangeRowsPerPage = e => {
        log('onChangeRowsPerPage: ', e);
        this.setState({pageSize: e});
    }

    getExportCsvFileName = () => {
        let nowStr = new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' });
        let isoStr = new Date(nowStr).toISOString().substring(0, 19);
        let res = isoStr.replace(/:/g, '') + `-${this.state.timeRangeFilter}`;
        log('datetime str: ', res);
        return res;
    }

    render() {
        return (

        <Container>
            <SnackbarUtil ref={this.sbarRef} />
            <FormControl style={{minWidth: 120, marginBottom: 10}}>
                <InputLabel htmlFor="age-simple">时间区间</InputLabel>
                <Select
                    value={this.state.timeRangeFilter}
                    onChange={this.timeRangeChange}
                    // inputProps={{
                    //     name: 'age',
                    //     id: 'age-simple',
                    // }}
                    >
                    <MenuItem value={TimeRanges.Today}>{TimeRanges.Today}</MenuItem>
                    <MenuItem value={TimeRanges.Recent7Days}>{TimeRanges.Recent7Days}</MenuItem>
                    <MenuItem value={TimeRanges.ThisMonth}>{TimeRanges.ThisMonth}</MenuItem>
                </Select>
            </FormControl>
            <MaterialTable
            icons={tableIcons}
            tableRef={this.tableRef}
            title={`订单列表【${this.state.timeRangeFilter}】`}
            columns={[
                { title: '产品', field: 'prodName',
                  lookup: this.state.prodNameMap
                },
                { title: '邮寄地址', field: 'postAddr' },
                { title: '客户手机号', field: 'mobile' },
                { title: '实付价格', field: 'actualCost', type: 'numeric' },
                { title: '付款日期', field: 'payTime' },
            ]}
            data={this.state.orders}
            onChangeRowsPerPage={this.onChangeRowsPerPage}
            options={{
                exportButton: true,
                exportFileName: this.getExportCsvFileName(),
                exportAllData: true,
                pageSize: this.state.pageSize,
                pageSizeOptions: [4, 10, 20],
                filtering: true
            }}
            />
        </Container>
    );
    }
};

export default SharedOrderTable;