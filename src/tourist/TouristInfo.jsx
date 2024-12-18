import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import '../css/TouristInfo.scss';


const TouristInfo = () => {
    const location = useLocation();

    const { detailCommon } = location.state || {}; // state에서 데이터 가져오기
    console.log('detailCommon : ', detailCommon);

}

export default TouristInfo