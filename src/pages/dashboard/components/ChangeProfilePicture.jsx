import { doc, updateDoc } from 'firebase/firestore';
import React from 'react';
import { useEffect } from 'react';
import { useContext } from 'react';
import { useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { fireStore } from '../../../firebase/sdk';
import { contextData } from '../dashboard';

const ChangeProfilePicture = ({ setSettingDp }) => {
    const { storeDataUser, coinBase } = useContext(contextData);
    const [pending, setPending] = useState(false);
    const [images, setImages] = useState([
        { img: "https://gineousc.sirv.com/Images/profile_pictures/icons8-sheep-on-bike-96.png", id: 0, selected: false },
        { img: "https://gineousc.sirv.com/Images/profile_pictures/icons8-bear-96.png", id: 1, selected: false },
        { img: "https://gineousc.sirv.com/Images/profile_pictures/icons8-cat-head-96.png", id: 2, selected: false },
        { img: "https://gineousc.sirv.com/Images/profile_pictures/icons8-cow-96.png", id: 3, selected: false },
        { img: "https://gineousc.sirv.com/Images/profile_pictures/icons8-crab-96.png", id: 4, selected: false },
        { img: "https://gineousc.sirv.com/Images/profile_pictures/icons8-doge-96.png", id: 5, selected: false },
        { img: "https://gineousc.sirv.com/Images/profile_pictures/icons8-fish-96.png", id: 6, selected: false },
        { img: "https://gineousc.sirv.com/Images/profile_pictures/icons8-giraffe-96.png", id: 7, selected: false },
        { img: "https://gineousc.sirv.com/Images/profile_pictures/icons8-octopus-96.png", id: 8, selected: false },
        { img: "https://gineousc.sirv.com/Images/profile_pictures/icons8-racoon-96.png", id: 9, selected: false },
    ])
    const [dp, setDp] = useState(null);
    const [selection, setSelection] = useState(0);

    useEffect(() => {
        if (storeDataUser !== null) {
            setDp(storeDataUser);
        }
    }, [storeDataUser]);

    useEffect(() => {
        if (dp !== null) {
            images.forEach(element => {
                if (element.img === dp.dp) {
                    setImages(images.map(i => {
                        if (i.id === element.id) {
                            return { ...i, selected: true }
                        }
                        return i
                    }))
                }
            });
        }
    }, [dp]);

    const handleClick = async (e) => {
        setSelection(e);
        setPending(true);
        const userRef = doc(fireStore, "user_credentials", `${String(coinBase?.coinbase).toLocaleLowerCase()}`);
        const img = images[e].img;

        await updateDoc(userRef, {
            profile_picture: img
        });

        setPending(false);
        setTimeout(() => {
            setSettingDp(false); 
        }, 2000);
    }

    const watchHandleClickFunc = (e) =>{
        const promise = handleClick(e);
        toast.promise(promise, {
            loading: 'changing profile photo...',
            success: 'Profile photo changed',
            error: 'An error occurred',
        });
    } 

    return (
        <div className="cover main">
            <Toaster 
                    toastOptions={{
                        style: {
                            background: '#363636',
                            color: '#fff',
                        },
                    }}
                />
            <div className="div">
                {pending && <div className="pending">
                    <div className="loadingio-spinner-gear-abqyc1i9wu"><div className="ldio-r68llg26yv">
                        <div><div></div><div></div><div></div><div></div><div></div><div></div></div>
                    </div></div>
                </div>}
                <label>Select profile picture</label>
                <div className="close" onClick={() => setSettingDp(false)}>x</div>
                <section>
                    {images.map(i => (
                        <div className="pic" key={i.id} onClick={() => watchHandleClickFunc(`${i.id}`)}>
                            <img src={i.img} alt="" />
                            {i.selected && <div className="ck"><img src="https://gineousc.sirv.com/Images/icons/ck.png" alt="" /></div>}
                        </div>
                    ))}
                </section>
            </div>
        </div>
    )
}

export default ChangeProfilePicture;