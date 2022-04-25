import React from 'react';

import CssBaseline from '@material-ui/core/CssBaseline';

function Frame({ children }) {
  return (
    <>
      <CssBaseline />
      <main style={{ padding: 20 }}>
        {children}
      </main>
    </>
  );
}

export default Frame;
