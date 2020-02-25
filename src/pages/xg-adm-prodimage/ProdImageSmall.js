import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Dropzone from 'react-dropzone';
import {tokensToHeadersMultiPart } from '../../context/SessionContext';

const useStyles = makeStyles({
  card: {
    margin : "10px 10px",
    maxWidth: 100,
  },
  img: {
    height: 100,
  },
  dropzone: {
    width  : "100px",
    height : "100px",
    // border : "1px solid black",
    // fontSize: 18,
    textAlign : "center"
  }
});

export default function ProdImageSmall(props) {
  const { imageUrlBase, imgUrl0, prodName, productId } = props;
  const classes = useStyles();
  const dragActiveMsg = '松开鼠标完成【' + prodName + '】图片文件选取';
  const dragInactiveMsg = '上传【' + prodName +'】图片：点击选取或者直接拖拽文件至此';
  const dragRejectMsg = '请选取单个图片文件（png/jpg/jpeg后缀）';
  const imgAltText = '【' + prodName +'】预览图';
  const imgTooltipText = '上传【' + prodName +'】图片：点击选取或者直接拖拽文件至此';

  const [state, setState] = React.useState({
    imgUrl: imgUrl0
  });

  const onDropFiles = files => {
    console.log('files: ', files);
    if (files.length != 1) {
      console.log('error: file count != 1');
    }
    else {
      const formData = new FormData();
      const file = files[0];
      formData.append('file', file);
      formData.append('productId', productId);
      const headers = tokensToHeadersMultiPart();

      console.log('headers: ', headers, formData);

      fetch('/api/newProductAsset', {
        method: 'post',
        headers,
        // contentType: false,
        body: formData
      })
      .then(res => {
        if (!res.ok) {
          throw res
        }
        return res.json()
      })
      .then(resp => {
        console.log('resp: ', resp);
        setState({ imgUrl: resp.fileDownloadUri });
      })
      .catch(err => {
        err.json().then(e => {
          console.log('error: ', e);
        })
      })
    }
  }

  return (
    <Dropzone onDrop={onDropFiles}
      accept="image/jpeg,image/png"
      minSize={0}
      maxSize={5242880}
      multiple={false}
    >
      {({getRootProps, getInputProps, isDragActive, isDragReject}) => (

          <div {...getRootProps()}
            className={classes.dropzone}>
            <input {...getInputProps()} />
            {isDragActive ? dragActiveMsg :
              (state.imgUrl == '' ? imgTooltipText :
                <img src={imageUrlBase+state.imgUrl}
                  alt={imgAltText}
                  title={imgTooltipText}
                  className={classes.img}/>)
            }
            
            {/* {isDragActive ? dragActiveMsg : dragInactiveMsg}
            {isDragReject && dragRejectMsg} */}
          </div>

      )}
    </Dropzone>
  );
}