import React from 'react';

import CssBaseline from '@material-ui/core/CssBaseline';

function Frame({ children }) {
  return (
    <>
      <CssBaseline />
      <main>
        {children}
      </main>
    </>
  );
}

export default Frame;
