import React from 'react';
import FormPart from './components/form';
import SideInfo from './components/sideInfo';
import { Toaster } from 'react-hot-toast';

const Login = () => {
  return (
    <div className="login">
      <Toaster
        toastOptions={{
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      <main>
        <SideInfo />
        <FormPart />
      </main>
    </div>
  )
}

export default Login;