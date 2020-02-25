import React, {Component} from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import InfoIcon from '@material-ui/icons/Info';
import CloseIcon from '@material-ui/icons/Close';
import { amber, green } from '@material-ui/core/colors';
import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import WarningIcon from '@material-ui/icons/Warning';
import { makeStyles } from '@material-ui/core/styles';

const variantIcon = {
  success: CheckCircleIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  info: InfoIcon,
};

const useStyles1 = makeStyles(theme => ({
  success: {
    backgroundColor: green[600],
  },
  error: {
    backgroundColor: theme.palette.error.dark,
  },
  info: {
    backgroundColor: theme.palette.primary.main,
  },
  warning: {
    backgroundColor: amber[700],
  },
  icon: {
    fontSize: 20,
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing(1),
  },
  message: {
    display: 'flex',
    alignItems: 'center',
  },
}));

function MySnackbarContentWrapper(props) {
  const classes = useStyles1();
  const { className, message, onClose, variant, ...other } = props;
  const Icon = variantIcon[variant];

  return (
    <SnackbarContent
      className={clsx(classes[variant], className)}
      aria-describedby="client-snackbar"
      message={
        <span id="client-snackbar" className={classes.message}>
          <Icon className={clsx(classes.icon, classes.iconVariant)} />
          {message}
        </span>
      }
      action={[
        <IconButton key="close" aria-label="close" color="inherit" onClick={onClose}>
          <CloseIcon className={classes.icon} />
        </IconButton>,
      ]}
      {...other}
    />
  );
}

const VariantSuccess = 'success';
const VariantError = 'error';
const VariantInfo = 'info';
const VariantWarning = 'warning';

MySnackbarContentWrapper.propTypes = {
  className: PropTypes.string,
  message: PropTypes.string,
  onClose: PropTypes.func,
  variant: PropTypes.oneOf([VariantError, VariantInfo, VariantSuccess, VariantWarning]).isRequired,
};

const useStyles2 = makeStyles(theme => ({
  margin: {
    margin: theme.spacing(1),
  },
}));

class SnackbarUtil extends Component {

  state = {
    open: false,
    variant: VariantInfo,
    message: ''
  }

  setOpen = (toOpen) => {
    this.setState({open: toOpen});
  }

  handleClick = () => {
    this.setOpen(true);
  }

  handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    this.setOpen(false);
  }

  success = (message) => {
    this.setState({
      open: true,
      variant: VariantSuccess,
      message
    })
  }

  err = (message) => {
    this.setState({
      open: true,
      variant: VariantError,
      message
    })
  }

  showOpResp = (opResp, succssMsg) => {
    if (opResp.success) {
      this.success(succssMsg);
    }
    else {
      this.err(`服务器返回错误：${opResp.msg}`);
    }
  }

  show = (opResp, successMessage) => {
    if (opResp.success) {
      this.success(successMessage);
    }
    else {
      this.err(opResp.msg);
    }
  }

  render() {
    return (
      <div>
        <Snackbar
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          open={this.state.open}
          autoHideDuration={3000}
          onClose={this.handleClose}
        >
          <MySnackbarContentWrapper
            onClose={this.handleClose}
            variant={this.state.variant}
            message={this.state.message}
          />
        </Snackbar>
        {/* <MySnackbarContentWrapper
          variant="error"
          // className={classes.margin}
          message="This is an error message!"
        />
        <MySnackbarContentWrapper
          variant="warning"
          message="This is a warning message!"
        />
        <MySnackbarContentWrapper
          variant="info"
          message="This is an information message!"
        />
        <MySnackbarContentWrapper
          variant="success"
          message="This is a success message!"
        /> */}
      </div>
    );
  }

};

export default SnackbarUtil;