
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import '../css/TravelCourseInfo.scss';

// Swiper 관련 CSS 및 컴포넌트 불러오기
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';

const TravelCourseInfo = () => {
    const location = useLocation();
    
    const { courseDetail } = location.state || {}; // state에서 데이터 가져오기

    // 상태 변수 설정
    const [detailCommon, setDetailCommon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [googleResult, setGoogleResult] = useState([]); // 구글 검색 결과 상태 (일반 검색도 포함한 상태)

    // UTF-8로 인코딩하는 함수
    const encodeUTF8 = (keyword) => encodeURIComponent(keyword.trim());

    useEffect(() => {
        if (!courseDetail) return;

        const contentId = courseDetail.items.item[0]?.contentid;
        console.log(contentId)

        // 공통 API 호출 (상세 정보)
        axios.post(`http://localhost:9000/travelcourse-info-detailCommon`, { contentId: contentId })
            .then((response) => {
                console.log(response)
                setDetailCommon(response.data.items.item[0]);
                setLoading(false);
            })
            .catch(() => {
                setError('데이터를 불러오는 데 실패했습니다.');
                setLoading(false);
            });

        // 각 관광지를 courseDetail의 subname으로 추출해서 구글 api로 검색 후 데이터가 있으면 그대로 추출하고 
        // 없으면 정보가 들어오지 않기 때문에 일반 데이터 호출해서 좌표를 얻어옴
        const googleKeywordSearch = courseDetail.items.item.map((el, index) => {
            const currentEncodedData = encodeUTF8(el.subname); // 관광지 이름 인코딩
            return axios.post("http://localhost:9000/google-search-places", { keyword: currentEncodedData })
                .then((response) => {
                    const { photoUrls, latitude, longitude } = response.data;
                    if (!photoUrls || photoUrls.length === 0) {
                        // 사진이 없을 경우 백업 API 호출
                        return axios.post(`http://localhost:9000/travelcourse-info-searchKeyword`, { keyword: currentEncodedData })
                            .then((backupResponse) => ({
                                longitude: Number(backupResponse.data.items.item[0].mapx),
                                latitude: Number(backupResponse.data.items.item[0].mapy),
                                photoUrls: null
                            }))
                            .catch(() => ({ index, photoUrls: null, latitude, longitude })); // 백업 API 호출 실패 처리
                    }
                    return { index, photoUrls, latitude, longitude };
                })
                .catch(() => ({ index, photoUrls: null, latitude: null, longitude: null })); // 구글 API 호출 실패 처리
        });

        // 구글 검색 결과 처리
        Promise.all(googleKeywordSearch)
            .then((results) => {
                const sortedResults = results.sort((a, b) => a.index - b.index); // 인덱스 기준으로 정렬
                setGoogleResult(sortedResults);
            })
            .catch((error) => {
                console.error('요청 중 오류 발생: ', error); // 에러 발생 시 로그 출력
            });


    }, [courseDetail]);

    // 로딩 상태 처리
    if (loading) return <p>로딩 중...</p>;
    if (error) return <p>{error}</p>;
    if (!detailCommon) return <p>여행 코스 정보가 없습니다.</p>;

    const sanitizedOverview = detailCommon.overview.replace(/<br\s*\/?>/g, ' '); // 개행 문자 처리

    return (
        <div className="TravelCourseInfo-wrapper">
            <h3>{detailCommon.title} 코스 설명 - <br />{sanitizedOverview}</h3>
            <MyComponent
                courseDetail={courseDetail}
                googleResult={googleResult}
                detailCommon={detailCommon}
            />
        </div>
    );
};

// 하위 컴포넌트
const MyComponent = ({ courseDetail, googleResult, detailCommon }) => {
    console.log('courseDetail : ', courseDetail); // 전체 코스 정보 출력
    console.log('googleResult : ', googleResult); // 구글 검색 결과 출력
    console.log('detailCommon : ', detailCommon); // 공통 상세 정보 출력

    const swiperRef = useRef(null); // Swiper 컴포넌트 참조
    const [totalDistance, setTotalDistance] = useState(0); // 총 거리 계산
    const [address, setAddress] = useState([]); // 각 장소의 주소 상태

    const goToSlide = (index) => {
        if (swiperRef.current) swiperRef.current.slideTo(index); // Swiper에서 특정 슬라이드로 이동
    };

    useEffect(() => {
        // 구글 주소 API를 호출하여 좌표를 주소로 변환
        const getGoogleAddress = async (latitude, longitude) => {
            const apiKey = 'AIzaSyAEae5uopEekuKilPCwWMsQS-M5JG8tTIk'; // 구글 API 키
            try {
                const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
                    params: { latlng: `${latitude},${longitude}`, key: apiKey },
                });
                const results = response.data.results;
                return results.length > 0 ? results[0].formatted_address : '주소를 찾을 수 없습니다';
            } catch (error) {
                console.error('주소 가져오기 실패:', error);
                return null;
            }
        };

        // 모든 구글 검색 결과에 대해 주소를 가져와서 상태 업데이트
        const fetchAddresses = async () => {
            const addresses = [];
            for (const result of googleResult) {
                if (result.latitude && result.longitude) {
                    const address = await getGoogleAddress(result.latitude, result.longitude);
                    addresses.push(address);
                } else {
                    addresses.push(null);
                }
            }
            setAddress(addresses); // 상태 업데이트
        };

        if (googleResult.length > 0) fetchAddresses();

        // 카카오 맵 API를 사용하여 지도 생성 및 마커 추가
        if (window.kakao && window.kakao.maps) {
            const container = document.getElementById('main-map'); // 지도 컨테이너
            const bounds = new window.kakao.maps.LatLngBounds(); // 지도의 경계 설정
            const options = { center: new window.kakao.maps.LatLng(googleResult[0]?.latitude, googleResult[0]?.longitude), level: 5 }; // 초기 지도 중심 설정
            const map = new window.kakao.maps.Map(container, options); // 지도 생성
            const positions = [];
            let calculatedDistance = 0;

            // 두 지점 사이의 거리 계산 함수
            const getDistance = (lat1, lon1, lat2, lon2) => {
                const R = 6371e3; // 지구 반지름 (미터)
                const toRad = (value) => (value * Math.PI) / 180; // 각도를 라디안으로 변환

                const φ1 = toRad(lat1);
                const φ2 = toRad(lat2);
                const Δφ = toRad(lat2 - lat1);
                const Δλ = toRad(lon2 - lon1);

                const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

                return R * c; // 거리를 미터 단위로 반환
            };

            googleResult.forEach((result, index) => {
                if (result.latitude && result.longitude) {
                    const position = new window.kakao.maps.LatLng(result.latitude, result.longitude); // 마커 위치
                    bounds.extend(position); // 지도 경계 확장
                    positions.push(position);

                    const marker = new window.kakao.maps.Marker({ position, map }); // 마커 생성
                    const customOverlayContent = `
                        <div style="position: absolute; left: -15px; top: -40px;
                            padding: 5px; font-size: 16px; font-weight: bold;
                            background-color: white; border-radius: 50%;
                            width: 30px; height: 30px; display: flex;
                            justify-content: center; align-items: center;
                            border: 2px solid blue; cursor: pointer; z-index: 100;">
                            ${index + 1}
                        </div>
                    `;
                    const customOverlay = new window.kakao.maps.CustomOverlay({
                        position, content: customOverlayContent, clickable: true
                    });
                    customOverlay.setMap(map); // 커스텀 오버레이 설정

                    const infowindow = new window.kakao.maps.InfoWindow({
                        content: `<div style="padding:5px; font-size:12px;">${courseDetail.items.item[index].subname}</div>`
                    });
                    infowindow.open(map, marker); // 인포윈도우 설정
                }
            });

            // 경로 그리기 (폴리라인)
            const polyline = new window.kakao.maps.Polyline({
                path: positions, strokeWeight: 5, strokeColor: '#FF0000', strokeOpacity: 0.7, strokeStyle: 'solid',
            });
            polyline.setMap(map);

            // 각 마커 간의 거리 계산하여 총 거리 업데이트
            for (let i = 0; i < positions.length - 1; i++) {
                const lat1 = positions[i].getLat();
                const lon1 = positions[i].getLng();
                const lat2 = positions[i + 1].getLat();
                const lon2 = positions[i + 1].getLng();
                calculatedDistance += getDistance(lat1, lon1, lat2, lon2);
            }

            setTotalDistance(calculatedDistance); // 총 거리 상태 업데이트
            map.setBounds(bounds); // 지도 범위 설정
        }
    }, [googleResult]);

    // HTML 태그에서 텍스트만 추출하는 함수
    const sanitizeText = (text) => {
        const doc = new DOMParser().parseFromString(text, 'text/html');
        return doc.body.textContent || "";
    };

    return (
        <>
            <div>
                <strong>코스 총 거리:</strong> {(totalDistance / 1000).toFixed(2)} km
            </div>
            {detailCommon.homepage && (
                <div>
                    <a href={detailCommon.homepage.match(/href="(.*?)"/)?.[1]}
                        target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'blue' }}>
                        홈페이지 바로가기
                    </a>
                </div>
            )}
            <div>
                <div id="main-map" style={{ width: '1200px', height: '400px' }}></div>
            </div>

            <ul className="Course-list-Numbox">
                {courseDetail.items.item.map((subItem, index) => (
                    <li key={index} onClick={() => goToSlide(index)}>
                        <em>{index + 1}</em>
                        <div>
                            {googleResult[index]?.photoUrls ? (
                                <div>
                                    <img src={googleResult[index].photoUrls[0]} alt={`Google Image ${index}`} style={{ width: '100px', height: '100px' }} />
                                    <span>{subItem.subname}</span>
                                </div>
                            ) : (
                                <span>{subItem.subname}</span>
                            )}
                        </div>
                    </li>
                ))}
            </ul>

            <Swiper pagination={{ type: 'progressbar' }} navigation={true} onSwiper={(swiper) => (swiperRef.current = swiper)} modules={[Pagination, Navigation]}>
                {courseDetail.items.item.map((subItem, index) => (
                    <SwiperSlide key={index}>
                        <div>
                            <h2>{subItem.subname}</h2>
                            {googleResult[index]?.photoUrls && googleResult[index]?.photoUrls.length > 0 ? (
                                <div className="photo-container">
                                    {googleResult[index].photoUrls.map((photo, i) => (
                                        <img key={i} src={photo} alt={`Google Image ${index}-${i}`} style={{ width: '100px', height: '100px', marginRight: '5px' }} />
                                    ))}
                                </div>
                            ) : (
                                <span>{subItem.subname}</span>
                            )}
                            <div>주소 : {address[index]}</div>
                            <span>{sanitizeText(courseDetail.items.item[index]?.subdetailoverview)}</span>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </>
    );
};

export default TravelCourseInfo;

