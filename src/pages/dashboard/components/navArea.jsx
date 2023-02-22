import React, { useState } from 'react';
import Controls from './controls';
import NavBar from './navBar';

export const navdata = React.createContext()

const NavArea = () => {
  const [expand, setExpand] = useState(0);

  return (
    <navdata.Provider value={{ expand, setExpand }}>
      <div className="navArea">
        <Controls />
        <NavBar />
      </div>
    </navdata.Provider>
  )
}

export default NavArea;