import React, { useRef, useState } from 'react';

const UploadArea = ({func, status, viewImg, uploadType }) => {
    const [previewImage, setPreviewImage] = useState(null);
    const formRef =  useRef();

    const handleImageChange = (e) => {
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
                    accept={uploadType === 1 ? ".doc,.docx,.pdf,.txt,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,text/plain" :"image/*"}
                    className={`select-file`}
                    onChange={handleImageChange}
                />}
            </form>
            <div className="info-txt">
                {viewImg === undefined && previewImage !== null && <span>
                    {uploadType ===1 ? "Click to Change Document": "Click to Change image"}
                </span>}
                {viewImg === undefined && previewImage === null && <span>
                    {uploadType ===1 ? "Click to upload Document": "Click to upload image"}
                </span>}</div>
                {uploadType !== 1 && <div className="preview-image">
                    {viewImg === undefined && <img src={previewImage} alt="" />}
                    {viewImg && <img src={viewImg} alt="" />}
                </div>}
                {uploadType === 1 && <div className="preview-image">
                    {viewImg && (<iframe src={viewImg} title="Preview Document" />)}
                    {viewImg === undefined && (<iframe src={previewImage} title="Preview Document" />)}
                </div>}
            {!viewImg && <div className="clear" onClick={handleResetImg}>
                <img src="https://gineousc.sirv.com/Images/icons/icons8-broom-96.png" alt="" />
            </div>}
        </div>
    )
}

export default UploadArea;