import './App.css';
import { Fragment } from 'react';

//components

import FilterRooms from './components/FilterRooms';

function App() {
  return (
    <Fragment>
      <div className="container">
        <FilterRooms />
      </div>
    </Fragment>
  )
}

export default App;
