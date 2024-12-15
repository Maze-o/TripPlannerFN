import logo from './logo.svg';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import TravelCourse from './tourist/TravelCourse.jsx';
import TravelCourseInfo from './tourist/TravelCourseInfo.jsx';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/travelcourse" element={< TravelCourse />}></Route>
        <Route path="/travelcourse-info" element={< TravelCourseInfo />}></Route>
      </Routes>

    </Router>


  );
}

export default App;
