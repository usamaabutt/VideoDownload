import React from 'react';
import AppProviders from '@app/providers/AppProviders';
import AppNavigator from '@navigation/AppNavigator';
import useConnectivityCheck from '@hooks/useConnectivityCheck';

const App = () => {
  useConnectivityCheck();

  return (
    <AppProviders>
      <AppNavigator />
    </AppProviders>
  );
};

export default App;
