import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Container from '@material-ui/core/Container';
import SnackbarUtil from '../XgSnackBarUtil/SnackbarUtil';

import {log} from '../../utils/Util';

class SetPassDlg extends Component {
  constructor(props) {
    super(props);

    this.setProfOrgPass = props.setProfOrgPass;

    this.sbarRef = React.createRef();
  }

  state = {
    open: false,
    proforgId: null,
    passwords: {
      pass1: '',
      pass2: ''
    },
    errorTexts: {
      pass1: '',
      pass2: ''
    }
  }

  handleOpen = (toOpen, proforgId) => {
    this.setState({ open: toOpen, proforgId });
  }

  close = () => this.handleOpen(false, null);

  handleInputChange = (event, errorText) => {
    log('event: ', event);
    let name = event.target.name;
    let passwords = { ...this.state.passwords, [name]: event.target.value };
    log('updated passwords: ', passwords);
    let errorTexts = this.state.errorTexts;
    errorTexts[name] = errorText;
    this.setState({ passwords, errorTexts });
  };

  // setErrorText = (name, errorText) => {
  //   let errorTexts = this.state.errorTexts;
  //   errorTexts[name] = errorText;
  //   this.setState({ errorTexts });
  // }

  updatePass1 = event => {
    let pass1 = event.target.value;
    let errorText = (pass1.length < 3) ? '密码不得少于3位' : '';
    
    this.handleInputChange(event, errorText);
  }

  updatePass2 = event => {
    let passwords = this.state.passwords;
    let pass2 = event.target.value;
    let errorText = (passwords.pass1 !== pass2) ? '两次密码输入不匹配' : '';
    this.handleInputChange(event, errorText);
  }

  setPass = e => {
    const state = this.state;
    this.setProfOrgPass(
      {
        proforgId: state.proforgId,
        password: state.passwords.pass1
      }, resp => {
        log('setPass resp: ', resp);

        this.sbarRef.current.show(resp, '密码设置成功');
        //this.sbarRef.current.show({success: false, 'msg': 'failed'}, '密码设置成功');
        this.close();
      });
    //log('setPass t:', t);
  }

  render() {
    return (
      <div>
        <SnackbarUtil ref={this.sbarRef} />
        <Dialog
          disableBackdropClick
          disableEscapeKeyDown
          open={this.state.open} onClose={this.close} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">设置【{this.state.proforgId}】密码</DialogTitle>
          <DialogContent>
            <Container>
              {/* <form onSubmit={handleSetPass}> */}
              <div>
                  <TextField
                      name='pass1'
                      value={this.state.passwords.pass1}
                      label="请输入密码"
                      // className={this.classes.textField}
                      onChange={this.updatePass1}
                      margin="normal"
                      helperText={this.state.errorTexts.pass1}
                      error={this.state.errorTexts.pass1 !== ''}
                      type="password"
                  />
              </div>
              <div>
                  <TextField
                      name='pass2'
                      value={this.state.passwords.pass2}
                      label="再次输入密码"
                      // className={this.classes.textField}
                      onChange={this.updatePass2}
                      helperText={this.state.errorTexts.pass2}
                      error={this.state.errorTexts.pass2 !== ''}
                      margin="normal"
                      type="password"
                  />
              </div>
            </Container>
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
            <Button onClick={this.setPass} color="primary">设置密码</Button>
          </DialogActions>
        </Dialog>
      </div>
    );  
  }
};

export default SetPassDlg;