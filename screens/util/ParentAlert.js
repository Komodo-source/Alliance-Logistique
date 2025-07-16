import React, { useRef, useEffect } from 'react';
import BetterAlert from './BetterAlert';
import { setAlertRef } from '../util/AlertService';

const ParentAlert = () => {
  const alertRef = useRef();

  useEffect(() => {
    setAlertRef(alertRef);
  }, []);


  return <BetterAlert ref={alertRef} />;
};

export default ParentAlert;