import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const TravelCourseInfo = () => {
    const location = useLocation();
    const { courseDetail } = location.state || {}; // state에서 데이터 가져오기

    const [detailCommon, setDetailCommon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 렌더링을 넘어서는 상태로 변경 여부를 추적하는 useRef
    const prevCourseDetailRef = useRef();
    // 코스 데이터 정보를 담을 변수
    const courseDetailData = courseDetail.items;

    useEffect(() => {
        if (!courseDetail) {
            return; // courseDetail이 없으면 실행하지 않음
        }

        // courseDetail이 변경되었을 때만 API를 호출
        if (prevCourseDetailRef.current !== courseDetail) {
            console.log('')
            const contentId = courseDetail.items.item[0].contentid;
            console.log('courseDetail : ', courseDetail);

            // GET 요청으로 API 호출
            axios.get(`http://localhost:9000/travelcourse-info-detailCommon`, {
                    params: {
                        id: contentId
                    }
                })
                .then((response) => {
                    console.log('response : ' ,response)
                    console.log('response.item : ', response.data.items.item[0]);
                    setDetailCommon(response.data.items.item[0]); // 받아온 데이터를 상태로 설정
                    setLoading(false);
                })
                .catch((err) => {
                    setError('데이터를 불러오는 데 실패했습니다.');
                    setLoading(false);
                });

            // 이전 courseDetail을 현재로 갱신
            prevCourseDetailRef.current = courseDetail;
        }
    }, [courseDetail]); // courseDetail만 의존성 배열에 추가

    if (loading) {
        return <p>로딩 중...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    if (!detailCommon) {
        return <p>여행 코스 정보가 없습니다.</p>;
    }

    // <br><br>을 제거하고 공백으로 대체 (제주올레길이 이상함)
    const sanitizedOverview = detailCommon.overview.replace(/<br\s*\/?>/g, ' ');
    return (
        <div>
            <h3>{sanitizedOverview}</h3>

            <div>
                <ul>
                    {courseDetailData.item.map((subItem, index) => (
                        <li key={subItem.subcontentid}>
                            {index + 1}. {subItem.subname}
                        </li>
                    ))}
                </ul>
            </div>
        </div>


    );
};

export default TravelCourseInfo;
