import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import TreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';
import Typography from '@material-ui/core/Typography';
import MailIcon from '@material-ui/icons/Mail';
import Label from '@material-ui/icons/Label';
import PersonIcon from '@material-ui/icons/Person';
import PersonOutlineIcon from '@material-ui/icons/PersonOutline';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import InfoIcon from '@material-ui/icons/Info';
import ForumIcon from '@material-ui/icons/Forum';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import { getUid, UserTypes, uid2Type } from '../../context/UserContext';
import DataSrcDS from '../../data/DataSrcDS';
import {log} from '../../utils/Util';

const useTreeItemStyles = makeStyles(theme => ({
  root: {
    color: theme.palette.text.secondary,
    '&:focus > $content': {
      backgroundColor: `var(--tree-view-bg-color, ${theme.palette.grey[400]})`,
      color: 'var(--tree-view-color)',
    },
  },
  content: {
    color: theme.palette.text.secondary,
    borderTopRightRadius: theme.spacing(2),
    borderBottomRightRadius: theme.spacing(2),
    paddingRight: theme.spacing(1),
    fontWeight: theme.typography.fontWeightMedium,
    '$expanded > &': {
      fontWeight: theme.typography.fontWeightRegular,
    },
  },
  groups: [{
    marginLeft: 0,
    '& $content': {
      paddingLeft: theme.spacing(2),
    },
  },
  {
    marginLeft: 0,
    '& $content': {
      paddingLeft: theme.spacing(4),
    },
  },
  {
    marginLeft: 0,
    '& $content': {
      paddingLeft: theme.spacing(6),
    },
  },
  {
    marginLeft: 0,
    '& $content': {
      paddingLeft: theme.spacing(8),
    },
  },
  {
    marginLeft: 0,
    '& $content': {
      paddingLeft: theme.spacing(10),
    },
  }],
  expanded: {},
  label: {
    fontWeight: 'inherit',
    color: 'inherit',
  },
  labelRoot: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0.5, 0),
  },
  labelIcon: {
    marginRight: theme.spacing(1),
  },
  labelText: {
    fontWeight: 'inherit',
    flexGrow: 1,
  },
}));

function initNodeData(m) {
  m.agents = [];
  m.medprofs = [];
}

function StyledTreeItem(props) {
  const classes = useTreeItemStyles();
  const {
    labelIcon: LabelIcon,
    labelInfo, color, bgColor, data, groupIdx, postHandleClick,
    getAgentTreeAndStat, getCurrUserStat,
    ...other
   } = props;

  const [x, setX] = React.useState({
    ...data,
    medprofs: []
  });

  const handleClickAgent = async () => {
    let t = await getAgentTreeAndStat(data.uid);
    let agentTreeResp = t[0];
    let userStatResp = t[1];
    console.log('handleClick', agentTreeResp, userStatResp);
    let medprofs = agentTreeResp.data.medprofs;
    medprofs.forEach(m => initNodeData(m));
    let newx = {
      ...x,
      medprofs
    };
    setX(newx);

    postHandleClick(userStatResp.data);
  }
  const handleClickMedProf = handleClickAgent

  const handleClickOrg = async () => {
    let userStatResp = await getCurrUserStat();
    postHandleClick(userStatResp.data);
  }

  const handleClick = async e => {
    console.log('data: ', data);
    const ut = uid2Type(data.uid);
    switch(ut) {
      case UserTypes.ProfOrg.text:
        e.preventDefault();
        handleClickOrg();
        break;
      case UserTypes.ProfOrgAgent.text:
        e.preventDefault();
        handleClickAgent();
        break;
      case UserTypes.MedProf.text:
        e.preventDefault();
        handleClickMedProf();
        break;
      default:
          console.log('handleClick: default todo');
          break;
    }

  }

  return (
    <TreeItem
      key={x.uid}
      nodeId={x.uid}
      onClick={handleClick}
      label={
        <div className={classes.labelRoot}>
          <LabelIcon color="inherit" className={classes.labelIcon} />
          <Typography variant="body2" className={classes.labelText}>
          {data.name}
          </Typography>
          <Typography variant="caption" color="inherit">
            {labelInfo}
          </Typography>
        </div>
      }
      style={{
        '--tree-view-color': color,
        '--tree-view-bg-color': bgColor,
      }}
      classes={{
        root: classes.root,
        content: classes.content,
        expanded: classes.expanded,
        group: classes.groups[groupIdx],
        label: classes.label,
      }}
      {...other}
    >
        {data.agents.map((a, i) =>
            <StyledTreeItem
              key={a.uid}
              postHandleClick={postHandleClick}
              data={a}
              groupIdx={groupIdx+1}
              labelIcon={PersonIcon}
              labelInfo={UserTypes.ProfOrgAgent.displayText}
              getAgentTreeAndStat={getAgentTreeAndStat}
              getCurrUserStat={getCurrUserStat}
              color="#1a73e8"
              bgColor="#e8f0fe">
            </StyledTreeItem>
        )}
        {x.medprofs.map((m, i) =>
            <StyledTreeItem
              key={m.uid}
              postHandleClick={postHandleClick}
              data={m}
              groupIdx={groupIdx+1}
              labelIcon={PersonOutlineIcon}
              labelInfo={UserTypes.MedProf.displayText}
              getAgentTreeAndStat={getAgentTreeAndStat}
              getCurrUserStat={getCurrUserStat}
              color="#1a73e8"
              bgColor="#e8f0fe">
            </StyledTreeItem>
        )}
        {/* {x.customers.map((c, i) =>
            <StyledTreeItem
                data={c}
                groupIdx={groupIdx+1}
                labelIcon={SupervisorAccountIcon}
                labelInfo="90"
                color="#1a73e8"
                bgColor="#e8f0fe">
            </StyledTreeItem>
        )} */}
      </TreeItem>
  );
}

StyledTreeItem.propTypes = {
  bgColor: PropTypes.string,
  color: PropTypes.string,
  labelIcon: PropTypes.elementType.isRequired,
  labelInfo: PropTypes.string,
//   labelText: PropTypes.string.isRequired,
};

const useStyles = makeStyles({
  root: {
    height: 264,
    flexGrow: 1,
    maxWidth: 400,
  },
});

class OrgTree extends Component {
  constructor(props) {
    super(props);
    // this.rootRef = React.createRef();

    this.dataSrc = new DataSrcDS(
      props.userDispatch,
      props.history,
      () => {
        log('AdminProdMgmt error handler todo');
        //log(userDispatch);
      }
    );

    let orgId = getUid();
    console.log('orgId: ', orgId);
    let defExpandIds = [orgId];
    this.state = {
        defExpandIds,
        org: {uid: orgId, name: '', agents: []},
        userStat: {
          agentCount: -1,
          medprofCount: -1,
          customerCount: -1
        }
    };
  };

  async componentDidMount() {
    let t = await this.dataSrc.getOrgTreeAndStat();

    let orgTreeResp = t[0];
    let agents = orgTreeResp.data.agents;
    agents.forEach(a => initNodeData(a));
    let org = {
      ...orgTreeResp.data.profOrg,
      agents,
      medprofs: []
    };

    let orgStat = t[1].data;

    console.log('eee: ', org, orgStat);
    this.setState({org, userStat: orgStat});
    //this.rootRef.current.updateData(org);
    //console.log('eee: ', this.treeRef.current);
  }

  updateUserStat = userStat => {
    console.log(userStat, this);
    this.setState({userStat});
  }

  render() {
    return (
      <Grid container spacing={3}>
        <Grid item xs={8}>
            <Paper>
              <TreeView
                defaultExpanded={this.state.defExpandIds}
                defaultCollapseIcon={<ArrowDropDownIcon />}
                defaultExpandIcon={<ArrowRightIcon />}
                defaultEndIcon={<div style={{ width: 24 }} />}
                onNodeToggle={(nodeid, expanded) => console.log('nodeid/expanded: ', nodeid, expanded)}
              >
                <StyledTreeItem
                  key={this.state.org.uid}
                  data={this.state.org}
                  groupIdx={0}
                  labelIcon={SupervisorAccountIcon}
                  getAgentTreeAndStat={this.dataSrc.getAgentTreeAndStat}
                  getCurrUserStat={this.dataSrc.getCurrUserStat}
                  postHandleClick={this.updateUserStat}>
                </StyledTreeItem>
                {/* <StyledTreeItem nodeId="3" labelText="Categories" labelIcon={Label}>
                  <StyledTreeItem
                    nodeId="5"
                    labelText="Social"
                    labelIcon={SupervisorAccountIcon}
                    labelInfo="90"
                    color="#1a73e8"
                    bgColor="#e8f0fe"
                  />
                </StyledTreeItem> */}
                {/* <StyledTreeItem nodeId="4" labelText="History" labelIcon={Label} /> */}
              </TreeView>
            </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper>
            <List aria-label="main mailbox folders">
              <ListItem button>
                <ListItemText>{this.state.userStat.agentCount}位 {UserTypes.ProfOrgAgent.displayText}</ListItemText>
              </ListItem>
              <ListItem button>
                <ListItemText>{this.state.userStat.medprofCount}位 {UserTypes.MedProf.displayText}</ListItemText>
              </ListItem>
              <ListItem button>
                <ListItemText>{this.state.userStat.customerCount}位 {UserTypes.Customer.displayText}</ListItemText>
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
      );
      }
}

export default OrgTree;