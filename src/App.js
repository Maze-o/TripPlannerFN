
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import TravelCourse from './tourist/TravelCourse.jsx';
import TravelCourseInfo from './tourist/TravelCourseInfo.jsx';
import Tourist from './tourist/Tourist.jsx';
import TouristInfo from './tourist/TouristInfo.jsx';
import Board from './planner/Board.jsx';
import DestinationInfo from './planner/DestinationInfo.jsx';
import Destination from './planner/Destination.jsx';

const App = () => {
  return (

    <Router>
      <Link to="/tourist">
        <button>관광지</button>
      </Link>
      <Link to="/travelcourse">
        <button>추천코스</button>
      </Link>

      <Link to="/planner/board">
        <button>게시판</button>
      </Link>
      <Routes>
        <Route path="/travelcourse" element={< TravelCourse />}></Route>
        <Route path="/travelcourse-info" element={< TravelCourseInfo />}></Route>
        <Route path="/tourist" element={<Tourist />}></Route>
        <Route path="/tourist-info" element={<TouristInfo />}></Route>
        <Route path="/planner/board" element={<Board />}></Route>
        <Route path="/planner/board/destination" element={<Destination/>}></Route>
        <Route path="/planner/board/destination/info" element={<DestinationInfo />}></Route>
      </Routes>

    </Router>


  );
}

export default App;
