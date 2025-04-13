import { useState } from 'react';
import ComponentA from './components/ComponentA';
import ComponentB from './components/ComponentB';

const App = () => {
  const [component, setComponent] = useState('A');
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <h1 className="text-4xl font-bold">Baseball Scoreboard Component List</h1>
      <div className="mt-8 flex justify-center items-center gap-8">
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => setComponent('A')}
        >
          Display Component A
        </button>
        <button
          className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
          onClick={() => setComponent('B')}
        >
          Display Component B
        </button>
      </div>
      <div className="mt-8">
        {component === 'A' && <ComponentA />}
        {component === 'B' && <ComponentB />}
      </div>
    </div>
  );
};

export default App;
