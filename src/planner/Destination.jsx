// import { useEffect, useState } from 'react';
// import { useLocation, useNavigate, Link } from 'react-router-dom';
// import axios from 'axios';
// import '../css/Destination.scss';

// const Destination = () => {

//     // Day별로 지도에 그을 라인의 색상 (10일이 최대)
//     const dayColors = [
//         "#FF5733", // Red-Orange
//         "#33FF57", // Lime Green
//         "#3357FF", // Bright Blue
//         "#F0E68C", // Khaki
//         "#FF1493", // Deep Pink
//         "#8A2BE2", // Blue Violet
//         "#FFD700", // Gold
//         "#FF6347", // Tomato
//         "#00FA9A", // Medium Spring Green
//         "#ADFF2F"  // Green Yellow
//     ];

//     const location = useLocation();
//     const plannerID = new URLSearchParams(location.search).get("plannerID");
//     const navigate = useNavigate();

//     const [destinations, setDestinations] = useState([]);
//     const [username, setUsername] = useState('');
//     // 몇일차 인지 담음
//     const [shownDays, setShownDays] = useState([]);



//     // 클릭 시 
//     const desInfoClick = (item) => {

//         axios.post(`http://localhost:9000/destination-to-tourist`, {
//             mapX: item.x,
//             mapY: item.y
//         }).then((response) => {

//             if (response.data.items.item[0].contentid) {
//                 const contentId = response.data.items.item[0].contentid;
//                 axios.get(`http://localhost:9000/tourist-info?id=${contentId}`)
//                     .then((response) => {

//                         const detailCommon = response.data;

//                         navigate('/tourist-info', { state: { detailCommon } }); // 데이터와 함께 이동

//                     })
//                     .catch((error) => {
//                         console.error('Error fetching course info:', error);

//                     });

//             }

//             console.log(response.data.items.item[0]);
//         }).catch((error) => {
//             // 데이터가 없으면 카카오지도에 장소 이름으로 검색
//             const kakaoMapUrl = `https://map.kakao.com/link/search/${encodeURIComponent(item.name)}`;
//             window.open(kakaoMapUrl, '_blank'); // 새 탭으로 카카오 지도 열기

//         })



//         console.log('destination 몇번째 클릭 : ', item);

//     }

//     // destination 데이터를 서버에서 가져오는 API 호출
//     useEffect(() => {
//         if (plannerID) {
//             axios.get(`http://localhost:9000/planner/board/destination?plannerID=${plannerID}`)
//                 .then((response) => {
//                     console.log('response : ', response);
//                     setUsername(response.data[0].username);
//                     setDestinations(response.data); // 받아온 destination 데이터를 state에 저장
//                 })
//                 .catch((error) => {
//                     console.error("Error fetching destinations:", error);
//                 });
//         }


//     }, [plannerID]);


//     useEffect(() => {


//         const uniqueDays = destinations.reduce((acc, destination) => {
//             if (!acc.includes(destination.day)) acc.push(destination.day);
//             return acc;
//         }, []);

//         setShownDays(uniqueDays);

//         if (destinations.length > 0) {
//             const container = document.getElementById('main-map');
//             const options = {
//                 center: new window.kakao.maps.LatLng(destinations[0].y, destinations[0].x),
//                 level: 5
//             };
//             const map = new window.kakao.maps.Map(container, options);
//             const bounds = new window.kakao.maps.LatLngBounds();
//             let dayMarkers = {}; // Day별로 마커 그룹화
//             let dayPolylines = {}; // Day별 Polyline 그룹화
//             let dayCounters = {}; // 각 Day별로 커스텀 오버레이 번호 초기화

//             destinations.forEach((destination, index) => {
//                 const position = new window.kakao.maps.LatLng(destination.y, destination.x);
//                 bounds.extend(position);

//                 // 마커 생성
//                 // const marker = new window.kakao.maps.Marker({
//                 //     position: position,
//                 //     map: map,
//                 // });

//                 // Day별로 Polyline 색상 변경
//                 const currentDay = destination.day;
//                 const color = dayColors[(currentDay - 1) % dayColors.length];
//                 console.log(index, '번째의 ', 'color : ', color)
//                 // Day별로 번호 초기화
//                 if (!dayCounters[currentDay]) {
//                     dayCounters[currentDay] = 1; // 해당 Day에 대한 번호 초기화
//                 } else {
//                     dayCounters[currentDay] += 1; // Day별로 번호 증가
//                 }

//                 console.log('dayCounters[currentDay] : ', dayCounters[currentDay])
//                 // 마커 위에 커스텀 오버레이 생성
//                 // <div style="position: absolute; left: -15px; top: -40px; padding: 5px; font-size: 16px; font-weight: bold; background-color: ${dayColors[(destination.day - 1) % dayColors.length]}; border-radius: 50%; width: 30px; height: 30px; display: flex; justify-content: center; align-items: center; border: 2px solid blue; cursor: pointer; z-index: 100;">
//                 const customOverlayContent = `
//                     <div style="font-size: 16px; font-weight: bold; background-color: ${dayColors[(destination.day - 1) % dayColors.length]}; border-radius: 50%; width: 30px; height: 30px; display: flex; justify-content: center; align-items: center; cursor: pointer; z-index: 100; color: white;">
//                         ${dayCounters[currentDay]}
//                     </div>
//                 `;
//                 const customOverlay = new window.kakao.maps.CustomOverlay({
//                     position, content: customOverlayContent, clickable: true
//                 });
//                 customOverlay.setMap(map);

//                 // Day별 Polyline 그리기
//                 if (!dayMarkers[currentDay]) {
//                     dayMarkers[currentDay] = []; // 새로운 Day에 대해서 Polyline을 초기화
//                 }
//                 dayMarkers[currentDay].push(position);

//                 if (dayMarkers[currentDay].length > 1) {
//                     if (!dayPolylines[currentDay]) {
//                         dayPolylines[currentDay] = new window.kakao.maps.Polyline({
//                             path: dayMarkers[currentDay],
//                             strokeWeight: 5,
//                             strokeColor: color, // Day별 색상
//                             strokeOpacity: 0.7,
//                             strokeStyle: 'solid',
//                         });
//                         dayPolylines[currentDay].setMap(map);
//                     } else {
//                         dayPolylines[currentDay].setPath(dayMarkers[currentDay]);
//                     }
//                 }
//             });

//             map.setBounds(bounds); // 경계에 맞게 지도 중심 및 확대 조정
//         }
//     }, [destinations]);


//     return (

//         <div className="destination-wrapper">
//             <div className="destination-content">
//                 <h3>{username}님의 여행지 코스입니다</h3>
//                 {destinations.length > 0 ? (
//                     destinations.map((destination, index) => {
//                         // 이전 day와 비교하여 새로운 day일 때만 출력
//                         const isNewDay = index === 0 || destination.day !== destinations[index - 1].day;

//                         return (

//                             <ul key={index} className="destination-card">
//                                 {/* 몇일차 */}
//                                 {isNewDay && (


//                                     // <p className="destination-day" style={{ borderBottom: `1px solid ${dayColors[(destination.day - 1) % dayColors.length]}` }}>
//                                     <p className="destination-day" style={{ color: `${dayColors[(destination.day - 1) % dayColors.length]}` }}>
//                                         Day {destination.day}
//                                     </p>
//                                 )}
//                                 {/* 각각 내용 리스트 */}
//                                 <li className="destination-info">
//                                     {/*  몇번째 내용인지 숫자 */}
//                                     <p className="destination-dayOrder">{destination.dayOrder}</p>
//                                     {/* 이미지가 들어갈 구역 */}
//                                     <span className="destination-image" >
//                                         <img src={destination.image} />
//                                     </span>
//                                     {/* 상세정보가 들어갈 구역 */}
//                                     <div className="destination-desc">
//                                         {/* 카테고리 */}
//                                         <p className="destination-category">{destination.category}</p>
//                                         {/* 제목 */}
//                                         <p className="destination-title"  onClick={() => (desInfoClick(destinations[index]))}>{destination.name}</p>
//                                         {/* 주소 */}
//                                         <p className="destination-address">{destination.address}</p>
//                                     </div>
//                                 </li>
//                             </ul>
//                         );
//                     })
//                 ) : (
//                     <p>등록된 여행지가 없습니다.</p>
//                 )}
//             </div>
//             <div id="main-map" className="destination-map"></div>

//         </div>


//     );
// };

// export default Destination;
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import '../css/Destination.scss';

const Destination = () => {
    const dayColors = [
        "#FF5733", "#33FF57", "#3357FF", "#F0E68C", "#FF1493", "#8A2BE2", "#FFD700", "#FF6347", "#00FA9A", "#ADFF2F"
    ];

    const location = useLocation();
    const plannerID = new URLSearchParams(location.search).get("plannerID");

    const [destinations, setDestinations] = useState([]);
    const [username, setUsername] = useState('');
    const [shownDays, setShownDays] = useState([]);
    const [addressCache, setAddressCache] = useState({}); // 캐시 추가

    // 카카오 Geocoding API 호출 함수 (위도, 경도 -> 주소 변환)
    const getAddressFromCoordinates = (latitude, longitude) => {
        const kakaoKey = "baf28066bec405f72b0b235e8940b5b0"; // 카카오 API 키
        const url = `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${longitude}&y=${latitude}`;

        return axios.get(url, {
            headers: {
                Authorization: `KakaoAK ${kakaoKey}`
            }
        });
    };

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

    // 카카오 지도에서 자동차 경로 요청 URL 생성
    const getCarRouteUrl = (start, end) => {
        const origin = `${start.y},${start.x}`; // 출발지 좌표
        const destination = `${end.y},${end.x}`; // 도착지 좌표

        // 카카오 지도 경로 요청 URL
        const url = `https://map.kakao.com/?map_type=TYPE_MAP&target=car&rt=${origin}&rt1=${destination}`;
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
        console.log('destinations : ', destinations);
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
    }, [destinations]);

    // 목적지 클릭 시 거리 계산 및 길찾기 링크 제공
    const desInfoClick = (item, index) => {
        const prevDestination = destinations[index - 1];
        if (prevDestination) {
            // 자동차 경로 링크 생성 후 새로운 탭으로 열기
            const carRouteUrl = getCarRouteUrl(prevDestination, item);
            window.open(carRouteUrl, '_blank');
        }
    };

    // 좌표로 주소를 가져오는 함수 호출
    const fetchAddress = (latitude, longitude) => {
        // 이미 캐시에 주소가 있으면 반환
        const cacheKey = `${latitude},${longitude}`;
        if (addressCache[cacheKey]) {
            return Promise.resolve(addressCache[cacheKey]);
        }

        return getAddressFromCoordinates(latitude, longitude)
            .then(response => {
                const address = response.data.documents[0].address.address_name;
                // 주소 캐시 저장
                setAddressCache(prev => ({ ...prev, [cacheKey]: address }));
                return address;
            })
            .catch(error => {
                console.error("Error fetching address:", error);
                return null;
            });
    };

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
                                        <button onClick={() => window.open(getCarRouteUrl(prevDestination, destination), '_blank')}>경로보기</button>
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
