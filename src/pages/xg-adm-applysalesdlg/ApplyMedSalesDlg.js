import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { Typography, FormControl, Divider, List, ListItem, ListItemText } from '@material-ui/core';

export default function ApplyMedSalesDlg(props) {
  const { onCancel, onSubmit, open, productId, productName, commissionRate, ...other } = props;
  const commissionRatePercentage = commissionRate * 100;
  const [info, setInfo] = React.useState('');
  return (
    <Dialog
      disableBackdropClick
      disableEscapeKeyDown
      maxWidth="xs"
      aria-labelledby="confirmation-dialog-title"
      open={open}
      {...other}
    >
      <DialogTitle id="confirmation-dialog-title">申请销售产品 【{productName}】</DialogTitle>
      <DialogContent dividers>
        <List>
          <ListItem>
            <ListItemText>
            本公司提交销售产品 【{productName}】 的申请，条款请参考相关法律文件
            </ListItemText>
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText>
            佣金提成缺省为: {commissionRatePercentage}%
            </ListItemText>
          </ListItem>
          <Divider />
          <ListItem>
            <FormControl fullWidth>
              <TextField
                id="standard-multiline-static"
                label="附加信息"
                multiline
                rows="8"
                placeholder="填写是否需要洽谈合作方式、协商佣金比例等信息，并留下联系方式"
                onChange={e => setInfo(e.target.value)}
              />
            </FormControl>
          </ListItem>

        </List>

      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="primary">
        取消
        </Button>
        <Button onClick={() => onSubmit(productId, commissionRate, info)} color="primary">
        提交申请
        </Button>
      </DialogActions>
    </Dialog>
  );
}
