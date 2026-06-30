import React from 'react';
import AppProviders from '@app/providers/AppProviders';
import AppNavigator from '@navigation/AppNavigator';
import useConnectivityCheck from '@hooks/useConnectivityCheck';
import useVideoEditor from '@hooks/useVideoEditor';

const App = () => {
  useConnectivityCheck();
  useVideoEditor();

  return (
    <AppProviders>
      <AppNavigator />
    </AppProviders>
  );
};

export default App;
