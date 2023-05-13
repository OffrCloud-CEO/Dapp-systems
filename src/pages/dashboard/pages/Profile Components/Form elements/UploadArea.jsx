import React, { useRef, useState } from 'react';

const UploadArea = ({func, status, viewImg }) => {
    const [previewImage, setPreviewImage] = useState(null);
    const formRef =  useRef();

    const handleImageChange = (e) => {
        if (viewImg === undefined) {
            const selectedImage = e.target.files[0];
            if (!selectedImage) {
                return;
            }
    
            func(selectedImage);
    
            const previewImageURL = URL.createObjectURL(selectedImage);
            setPreviewImage(previewImageURL);
        }
    };

    const handleResetImg = () =>{
        formRef.current.reset();
        setPreviewImage(null);
    }
    

    return (
        <div className="upload-area">
            <form action="" ref={formRef}>
                {!viewImg && <input
                    type="file"
                    accept="image/*"
                    name=""
                    id=""
                    className={`select-file`}
                    onChange={handleImageChange}
                />}
            </form>
            <div className="info-txt">
                {viewImg === undefined && previewImage !== null && <span>Click to Change image</span>}
                {viewImg === undefined && previewImage === null && <span>Click to upload image</span>}</div>
            <div className="preview-image">
                {viewImg === undefined && <img src={previewImage} alt="" />}
                {viewImg && <img src={viewImg} alt="" />}
            </div>
            {!viewImg && <div className="clear" onClick={handleResetImg}>
                <img src="https://gineousc.sirv.com/Images/icons/icons8-broom-96.png" alt="" />
            </div>}
        </div>
    )
}

export default UploadArea;