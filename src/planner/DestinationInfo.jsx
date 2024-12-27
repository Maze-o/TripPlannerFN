
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/DestinationInfo.scss';

const DestinationInfo = () => {
    const dayColors = [
        "#FF5733", "#33FF57", "#3357FF", "#F0E68C", "#FF1493", "#8A2BE2", "#FFD700", "#FF6347", "#00FA9A", "#ADFF2F"
    ];

    const location = useLocation();
    const plannerID = new URLSearchParams(location.search).get("plannerID");

    const [destinations, setDestinations] = useState([]);
    const [username, setUsername] = useState('');
    const [shownDays, setShownDays] = useState([]);

    // 거리 계산 함수: 두 좌표 간의 거리 계산 (단위: km)
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // 지구 반경 (km)
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // km 단위 반환
    };

    // 카카오 지도로 길찾기 (새 페이지)
    const getDirections = (start, end) => {
        const endAddress = start.address; // 출발지 좌표
        const startAddress = end.address; // 도착지 좌표

        // 카카오 지도 경로 요청 URL 
        const url = `https://map.kakao.com/?sName=${endAddress}&eName=${startAddress}`
        return url;
    };

    // destination 데이터를 서버에서 가져오는 API 호출
    useEffect(() => {
        if (plannerID) {
            axios.get(`http://localhost:9000/planner/board/destination?plannerID=${plannerID}`)
                .then((response) => {
                    setUsername(response.data[0].username);
                    setDestinations(response.data);
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

                // Day별로 Polyline 색상 변경
                const currentDay = destination.day;
                const color = dayColors[(currentDay - 1) % dayColors.length];

                // Day별로 번호 초기화
                if (!dayCounters[currentDay]) {
                    dayCounters[currentDay] = 1; // 해당 Day에 대한 번호 초기화
                } else {
                    dayCounters[currentDay] += 1; // Day별로 번호 증가
                }

                // 마커 위에 커스텀 오버레이 생성
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
        console.log('destinations : ', destinations);
    }, [destinations]);

    const navigate = useNavigate();
    // 클릭 시 
    const desInfoClick = (item) => {

        axios.post(`http://localhost:9000/destination-to-tourist`, {
            mapX: item.x,
            mapY: item.y
        }).then((response) => {

            if (response.data.items.item[0].contentid) {
                const contentId = response.data.items.item[0].contentid;
                axios.get(`http://localhost:9000/tourist-info?id=${contentId}`)
                    .then((response) => {

                        const detailCommon = response.data;

                        navigate('/tourist-info', { state: { detailCommon } }); // 데이터와 함께 이동

                    })
                    .catch((error) => {
                        console.error('Error fetching course info:', error);

                    });

            }

            console.log(response.data.items.item[0]);
        }).catch(() => {
            // 데이터가 없으면 카카오지도에 장소 이름으로 검색
            const kakaoMapUrl = `https://map.kakao.com/link/search/${encodeURIComponent(item.name)}`;
            window.open(kakaoMapUrl, '_blank'); // 새 탭으로 카카오 지도 열기

        })

    }

    const addressClick = (item) => {
        const kakaoMapUrl = `https://map.kakao.com/link/search/${encodeURIComponent(item.address)}`;
        window.open(kakaoMapUrl, '_blank');
    }

    return (
        <div className="destination-wrapper">
            <div className="destination-content">
                <h3>{username}님의 여행지 코스입니다</h3>
                {destinations.length > 0 ? (
                    destinations.map((destination, index) => {
                        const isNewDay = index === 0 || destination.day !== destinations[index - 1].day;
                        const prevDestination = destinations[index - 1];
                        const distance = prevDestination ? calculateDistance(prevDestination.y, prevDestination.x, destination.y, destination.x) : 0;

                        return (
                            <ul key={index} className="destination-card">
                                {isNewDay && (
                                    <p className="destination-day" style={{ color: `${dayColors[(destination.day - 1) % dayColors.length]}` }}>
                                        Day {destination.day}
                                    </p>
                                )}

                                {/* 경로 보기 버튼을 Day가 넘어갔을 때 제외하고 생성 */}
                                {prevDestination && !isNewDay && (
                                    <div className="destination-distance">
                                        <span>{distance.toFixed(2)} km</span>
                                        <button onClick={() => window.open(getDirections(prevDestination, destination), '_blank')}>경로보기</button>
                                    </div>
                                )}

                                <li className="destination-info">
                                    <p className="destination-dayOrder">{destination.dayOrder}</p>
                                    <span className="destination-image">
                                        <img src={destination.image} alt="destination" />
                                    </span>
                                    <div className="destination-desc">
                                        <p className="destination-category">{destination.category}</p>
                                        <p className="destination-title" onClick={() => desInfoClick(destination, index)}>{destination.name}</p>
                                        <p className="destination-address" onClick={() => addressClick(destination, index)}>{destination.address}</p>
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

export default DestinationInfo;
