import React, { useState, useEffect } from 'react';

import Frame from './Frame';
import DataScreen from './DataScreen';

function App() {
  const [data, setData] = useState({});

  useEffect(() => {
    const baseUrl = process.env.PUBLIC_URL ? process.env.PUBLIC_URL : '';
    const fetchData = async () => {
      const result = await fetch(`${baseUrl}/data.json`);
      const json = await result.json();
      setData(json);
    };
    fetchData();
  }, []);

  return (
    <Frame>
      <DataScreen data={data} />
    </Frame>
  );
}

export default App;
