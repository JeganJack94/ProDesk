import React from 'react';
import Lottie from 'lottie-react';
import loaderAnimation from '../assets/Loader.json';

const Loader = ({ small }) => {
  return (
    <div className={`flex items-center justify-center ${small ? 'min-h-0' : 'min-h-[200px]'}`}>
      <Lottie
        animationData={loaderAnimation}
        loop={true}
        style={{ width: small ? 40 : 120, height: small ? 40 : 120 }}
      />
    </div>
  );
};

export default Loader; 