import React, { useContext } from 'react';
import { greetUser } from '../../../useful/useful_tool';
import { contextData } from '../dashboard';

const Settings = () => {
  const { storeDataUser } = useContext(contextData);
  return (
    <div className="dash_section">
      <div className="greet">
        <div className="title">{greetUser()} {storeDataUser ? ((storeDataUser.displayname)) : "@firstname"}, </div>
        <div className="tags">
          <div className="img">
            {storeDataUser && <img src={storeDataUser?.dp} alt="" />}
            {!storeDataUser && <img src="https://gineousc.sirv.com/Images/Infinite.gif" alt="" />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings;