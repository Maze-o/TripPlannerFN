import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import '../css/Destination.scss';

const Destination = () => {

    // Day별로 지도에 그을 라인의 색상 (10일이 최대)
    const dayColors = [
        "#FF5733", // Red-Orange
        "#33FF57", // Lime Green
        "#3357FF", // Bright Blue
        "#F0E68C", // Khaki
        "#FF1493", // Deep Pink
        "#8A2BE2", // Blue Violet
        "#FFD700", // Gold
        "#FF6347", // Tomato
        "#00FA9A", // Medium Spring Green
        "#ADFF2F"  // Green Yellow
    ];

    const location = useLocation();
    const plannerID = new URLSearchParams(location.search).get("plannerID");

    const [destinations, setDestinations] = useState([]);
    const [username, setUsername] = useState('');
    // 몇일차 인지 담음
    const [shownDays, setShownDays] = useState([]);

    // destination 데이터를 서버에서 가져오는 API 호출
    useEffect(() => {
        if (plannerID) {
            axios.get(`http://localhost:9000/planner/board/destination?plannerID=${plannerID}`)
                .then((response) => {
                    console.log('response : ', response);
                    setUsername(response.data[0].username);
                    setDestinations(response.data); // 받아온 destination 데이터를 state에 저장
                })
                .catch((error) => {
                    console.error("Error fetching destinations:", error);
                });
        }


    }, [plannerID]);


    useEffect(() => {


        const uniqueDays = destinations.reduce((acc, destination) => {
            if (!acc.includes(destination.day)) acc.push(destination.day);
            return acc;
        }, []);

        setShownDays(uniqueDays);

        if (destinations.length > 0) {
            const container = document.getElementById('main-map');
            const options = {
                center: new window.kakao.maps.LatLng(destinations[0].y, destinations[0].x),
                level: 5
            };
            const map = new window.kakao.maps.Map(container, options);
            const bounds = new window.kakao.maps.LatLngBounds();
            let dayMarkers = {}; // Day별로 마커 그룹화
            let dayPolylines = {}; // Day별 Polyline 그룹화
            let dayCounters = {}; // 각 Day별로 커스텀 오버레이 번호 초기화

            destinations.forEach((destination, index) => {
                const position = new window.kakao.maps.LatLng(destination.y, destination.x);
                bounds.extend(position);

                // 마커 생성
                // const marker = new window.kakao.maps.Marker({
                //     position: position,
                //     map: map,
                // });

                // Day별로 Polyline 색상 변경
                const currentDay = destination.day;
                const color = dayColors[(currentDay - 1) % dayColors.length];
                console.log(index, '번째의 ', 'color : ', color)
                // Day별로 번호 초기화
                if (!dayCounters[currentDay]) {
                    dayCounters[currentDay] = 1; // 해당 Day에 대한 번호 초기화
                } else {
                    dayCounters[currentDay] += 1; // Day별로 번호 증가
                }

                console.log('dayCounters[currentDay] : ', dayCounters[currentDay])
                // 마커 위에 커스텀 오버레이 생성
                // <div style="position: absolute; left: -15px; top: -40px; padding: 5px; font-size: 16px; font-weight: bold; background-color: ${dayColors[(destination.day - 1) % dayColors.length]}; border-radius: 50%; width: 30px; height: 30px; display: flex; justify-content: center; align-items: center; border: 2px solid blue; cursor: pointer; z-index: 100;">
                const customOverlayContent = `
                    <div style="font-size: 16px; font-weight: bold; background-color: ${dayColors[(destination.day - 1) % dayColors.length]}; border-radius: 50%; width: 30px; height: 30px; display: flex; justify-content: center; align-items: center; cursor: pointer; z-index: 100; color: white;">
                        ${dayCounters[currentDay]}
                    </div>
                `;
                const customOverlay = new window.kakao.maps.CustomOverlay({
                    position, content: customOverlayContent, clickable: true
                });
                customOverlay.setMap(map);

                // Day별 Polyline 그리기
                if (!dayMarkers[currentDay]) {
                    dayMarkers[currentDay] = []; // 새로운 Day에 대해서 Polyline을 초기화
                }
                dayMarkers[currentDay].push(position);

                if (dayMarkers[currentDay].length > 1) {
                    if (!dayPolylines[currentDay]) {
                        dayPolylines[currentDay] = new window.kakao.maps.Polyline({
                            path: dayMarkers[currentDay],
                            strokeWeight: 5,
                            strokeColor: color, // Day별 색상
                            strokeOpacity: 0.7,
                            strokeStyle: 'solid',
                        });
                        dayPolylines[currentDay].setMap(map);
                    } else {
                        dayPolylines[currentDay].setPath(dayMarkers[currentDay]);
                    }
                }
            });

            map.setBounds(bounds); // 경계에 맞게 지도 중심 및 확대 조정
        }
    }, [destinations]);






    return (

        <div className="destination-wrapper">
            <div className="destination-content">
                <h3>{username}님의 여행지 코스입니다</h3>
                {destinations.length > 0 ? (
                    destinations.map((destination, index) => {
                        // 이전 day와 비교하여 새로운 day일 때만 출력
                        const isNewDay = index === 0 || destination.day !== destinations[index - 1].day;

                        return (

                            <ul key={index} className="destination-card">
                                {/* 몇일차 */}
                                {isNewDay && (


                                    // <p className="destination-day" style={{ borderBottom: `1px solid ${dayColors[(destination.day - 1) % dayColors.length]}` }}>
                                    <p className="destination-day" style={{ color: `${dayColors[(destination.day - 1) % dayColors.length]}` }}>
                                        Day {destination.day}
                                    </p>
                                )}
                                {/* 각각 내용 리스트 */}
                                <li className="destination-info">
                                    {/*  몇번째 내용인지 숫자 */}
                                    <p className="destination-dayOrder">{destination.dayOrder}</p>
                                    {/* 이미지가 들어갈 구역 */}
                                    <span className="destination-image" >
                                        <img src={destination.image} />
                                    </span>
                                    {/* 상세정보가 들어갈 구역 */}
                                    <div className="destination-desc">
                                        {/* 카테고리 */}
                                        <p className="destination-category">{destination.category}</p>
                                        {/* 제목 */}
                                        <p className="destination-title">{destination.name}</p>
                                        {/* 주소 */}
                                        <p className="destination-address">{destination.address}</p>
                                    </div>
                                </li>
                            </ul>
                        );
                    })
                ) : (
                    <p>등록된 여행지가 없습니다.</p>
                )}
            </div>
            <div id="main-map" className="destination-map"></div>
        </div>


    );
};

export default Destination;