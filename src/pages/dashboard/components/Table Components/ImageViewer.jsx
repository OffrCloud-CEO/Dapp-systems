import React from 'react';

const ImageViewer = ({closeFunc, imgUrl}) => {
    const closeHandler = () =>{
        closeFunc(false);
    }

    function downloadImage(url) {
        const filename = url.substring(url.lastIndexOf('/')+1);
        fetch(url)
          .then(response => response.blob())
          .then(blob => {
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
          });
      }
      

    return (
        <div className="cover">
            <div className="div viewImage">
                <div className="close" onClick={closeHandler}>x</div>
                <div className="viewPic">
                    <img src={`${imgUrl}`} alt="" />
                </div>
            </div>
            <div className="controls">
                <div onClick={()=>downloadImage(imgUrl)}>download <img src="https://gineousc.sirv.com/Images/icons/icons8-downloading-updates-64.png" alt="" /></div>
            </div>
        </div>
    )
}

export default ImageViewer;