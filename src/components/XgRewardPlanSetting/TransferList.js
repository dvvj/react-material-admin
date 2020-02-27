import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import { TextField } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  root: {
    margin: 'auto',
  },
  cardHeader: {
    padding: theme.spacing(1, 2),
  },
  list: {
    width: 200,
    height: 360,
    backgroundColor: theme.palette.background.paper,
    overflow: 'auto',
  },
  button: {
    margin: theme.spacing(0.5, 0),
  },
}));

function not(a, b) {
  let bids = b.map(v => v.id);
  return a.filter(value => !bids.includes(value.id));
}

function intersection(a, b) {
  let bids = b.map(v => v.id);
//  console.log('bids:', bids, a, b);
  return a.filter(value => bids.includes(value.id));
}

function union(a, b) {
  return [...a, ...not(b, a)];
}

function productsIncludes(products, prod) {
  let pids = products.map(v => v.id);
//  console.log('pids: ', pids);
  return pids.includes(prod.id);
}

function productIndexOf(products, prod) {
  let pids = products.map(v => v.id);
//  console.log('pids: ', pids, prod);
  return pids.indexOf(prod.id);
}

const RewardRateInputText = {
  Normal: '回报百分比（%）',
  Err_NumberBtw1_99: '请输入1-99之间的数字'
}

export default function TransferList(props) {
  const classes = useStyles();
  const [checked, setChecked] = React.useState([]);
  const [left, setLeft] = React.useState(props.products);
  const [right, setRight] = React.useState([]);
  const [rewardRate, setRewardRate] = React.useState([]);
  const [rewardRateInputError, setRewardRateInputError] = React.useState(false);
  const [rewardRateInputText, setRewardRateInputText] = React.useState(RewardRateInputText.Normal);
  const selectionCallback = props.selectionCallback;

  // const setProducts = products => {
  //   setLeft(products);
  // }

//  console.log('checked/left: ', checked, left);
  const leftChecked = intersection(checked, left);
//  console.log('checked/right: ', checked, right);
  const rightChecked = intersection(checked, right);

  const handleConfigSelect = e => {
    let selected = right;
    setRight([]);
    let remChecked = intersection(left, checked);
    setChecked(remChecked);
//    console.log('in handleConfigSelect', selected, rewardRate);
    selectionCallback(selected, rewardRate);
  }

  const handleToggle = product => () => {
    const currentIndex = productIndexOf(checked, product);
//    console.log('currentIndex: ', currentIndex);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(product);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    console.log('newChecked: ', newChecked);

    setChecked(newChecked);
  };

  const numberOfChecked = items => intersection(checked, items).length;

  const handleToggleAll = items => () => {
    if (numberOfChecked(items) === items.length) {
      setChecked(not(checked, items));
    } else {
      setChecked(union(checked, items));
    }
  };

  const handleCheckedRight = () => {
    setRight(right.concat(leftChecked));
    setLeft(not(left, leftChecked));
    setChecked(not(checked, leftChecked));
  };

  const handleCheckedLeft = () => {
    console.log('in handleCheckedLeft');
    setLeft(left.concat(rightChecked));
    setRight(not(right, rightChecked));
    setChecked(not(checked, rightChecked));
  };

  const customList = (title, items) => (
    <Card>
      <CardHeader
        className={classes.cardHeader}
        avatar={
          <Checkbox
            onClick={handleToggleAll(items)}
            checked={numberOfChecked(items) === items.length && items.length !== 0}
            indeterminate={numberOfChecked(items) !== items.length && numberOfChecked(items) !== 0}
            disabled={items.length === 0}
            inputProps={{ 'aria-label': 'all items selected' }}
          />
        }
        title={title}
        // subheader={`${numberOfChecked(items)}/${items.length} selected`}
      />
      <Divider />
      <List className={classes.list} dense component="div" role="list">
        {items.map(prod => {
          const product = prod;
          const labelId = `transfer-list-all-item-${product.id}-label`;
          return (
            <ListItem key={product.id} role="listitem" button onClick={handleToggle(prod)}>
              <ListItemIcon>
                <Checkbox
                  checked={productsIncludes(checked, prod)}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ 'aria-labelledby': labelId }}
                />
              </ListItemIcon>
              <ListItemText id={labelId} primary={product.name} />
            </ListItem>
          );
        })}
        <ListItem />
      </List>
    </Card>
  );

  const updateRewardRate = e => {
    let newValue = e.target.value;

    if (newValue >= 100 || newValue < 1) {
      setRewardRateInputError(true);
      setRewardRateInputText(RewardRateInputText.Err_NumberBtw1_99);
    }
    else {
      setRewardRateInputError(false);
      setRewardRateInputText(RewardRateInputText.Normal);
    }
    setRewardRate(newValue);
  }

  return (
    <Grid container spacing={2} justify="center" alignItems="center" className={classes.root}>
      <Grid item>{customList('待选产品', left)}</Grid>
      <Grid item>
        <Grid container direction="column" alignItems="center">
          <Button
            variant="outlined"
            size="small"
            className={classes.button}
            onClick={handleCheckedRight}
            disabled={leftChecked.length === 0}
            aria-label="move selected right"
          >
            &gt;
          </Button>
          <Button
            variant="outlined"
            size="small"
            className={classes.button}
            onClick={handleCheckedLeft}
            disabled={rightChecked.length === 0}
            aria-label="move selected left"
          >
            &lt;
          </Button>
        </Grid>
      </Grid>
      <Grid item>{customList('选定产品', right)}</Grid>
      <Grid item xs={3}>
        <div>
          <TextField
            name='rewardRate'
            value={rewardRate}
            type="number"
            error={rewardRateInputError}
            label={rewardRateInputText}
            onChange={updateRewardRate}
            margin="normal"
            />
          <Button variant="contained" color="primary"
            onClick={e => handleConfigSelect()}>配置选定产品
          </Button>
        </div>

      </Grid>
    </Grid>
  );
}