import React, { Component } from 'react';
import OrgTree from '../../components/XgOrgTree/OrgTree';

class PorgSalesNtwk extends Component {
    constructor(props) {
        super(props);
        this.history = props.history;
        this.userDispatch = props.userDispatch;
    }
    render() {
        //const state = this.state;
        return (
            <OrgTree history={this.history} userDispatch={this.userDispatch} />
        );
    }
};

export default PorgSalesNtwk;