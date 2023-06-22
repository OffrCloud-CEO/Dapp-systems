import React, { useRef, useState } from 'react';

const UploadArea = ({func, status, viewImg, uploadType }) => {
    const [previewFile, setPreviewImage] = useState(null);
    const formRef =  useRef();

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) {
            return;
        }

        func(selectedFile);

        const fileType = selectedFile.type;
        if (uploadType !== 1 && fileType.includes('image/')) {
            // Handle image preview
            const previewImageURL = URL.createObjectURL(selectedFile);
            setPreviewImage(previewImageURL);
        } else {
            // Handle document preview
            const reader = new FileReader();
            reader.onload = () => {
                const previewImageURL = reader.result;
                setPreviewImage(previewImageURL);
            };
            reader.readAsDataURL(selectedFile);
        }
    };
      

    const handleResetImg = () =>{
        formRef.current.reset();
        setPreviewImage(null);
        func(null);
    }
    

    return (
        <div className="upload-area">
            <form action="" ref={formRef}>
                {!viewImg && <input
                    type="file"
                    accept={uploadType === 1 ? ".pdf,application/pdf" :"image/*"}
                    className={`select-file`}
                    onChange={handleFileChange}
                />}
            </form>
            <div className="info-txt">
                {viewImg === undefined && previewFile !== null && <span>
                    {uploadType ===1 ? "Click to Change Document": "Click to Change image"}
                </span>}
                {viewImg === undefined && previewFile === null && <span>
                    {uploadType ===1 ? "Click to upload Document": "Click to upload image"}
                </span>}</div>
                {uploadType !== 1 && <div className="preview-image">
                    {viewImg === undefined && <img src={previewFile} alt="" />}
                    {viewImg && <img src={viewImg} alt="" />}
                </div>}
                {uploadType === 1 && <div className="preview-image">
                    {viewImg && (<iframe src={viewImg} title="Previewing Document" />)}
                    {viewImg === undefined && (<iframe src={previewFile} title="Preview Document" />)}
                </div>}
            {!viewImg && <div className="clear" onClick={handleResetImg}>
                <img src="https://gineousc.sirv.com/Images/icons/icons8-broom-96.png" alt="" />
            </div>}
        </div>
    )
}

export default UploadArea;