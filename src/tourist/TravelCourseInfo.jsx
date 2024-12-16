import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import ReactDOMServer from 'react-dom/server';
import '../css/TravelCourseInfo.scss';

// Swiper 
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';

const TravelCourseInfo = () => {
    const location = useLocation();
    const { courseDetail } = location.state || {}; // state에서 데이터 가져오기

    const [detailCommon, setDetailCommon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [keywordResults, setKeywordResults] = useState([]); // 검색 결과 상태 추가
    const [googleResult, setGoogleResult] = useState([]);

    const encodeUTF8 = (keyword) => encodeURIComponent(keyword.trim());

    // useEffect는 courseDetail이 처음 로드될 때만 API를 호출하도록 설정
    useEffect(() => {
        if (!courseDetail) return; // courseDetail이 없으면 실행하지 않음
        console.log('courseDetail : ', courseDetail);
        const contentId = courseDetail.items.item[0]?.contentid;

        // 공통 API 호출
        axios.get(`http://localhost:9000/travelcourse-info-detailCommon`, { params: { id: contentId } })
            .then((response) => {
                setDetailCommon(response.data.items.item[0]);
                setLoading(false);
            })
            .catch(() => {
                setError('데이터를 불러오는 데 실패했습니다.');
                setLoading(false);
            });

        // 키워드 검색 API 호출
        const keywordRequests = courseDetail.items.item.map((el) => {
            const currentEncodedData = encodeUTF8(el.subname);
            return axios.get(`http://localhost:9000/travelcourse-info-searchKeywordd`, {
                params: { keyword: currentEncodedData }
            })
                .then((response) => ({ subname: el.subname, data: response.data.items }))
                .catch(() => ({ subname: el.subname, data: null }));
        });

        Promise.all(keywordRequests).then((results) => {
            console.log('keywordResults : ', results); // 결과 확인용
            setKeywordResults(results);
        });


        const googleKeywordSearch = courseDetail.items.item.map((el, index) => {
            const currentEncodedData = encodeUTF8(el.subname);

            return axios.get("http://localhost:9000/google-search-places", {
                params: {
                    keyword: currentEncodedData
                }
            }).then((response) => {
                console.log(`googleResponse for item ${index}: `, response.data);

                const { photoUrl, latitude, longitude } = response.data; // photoUrl, latitude, longitude 받기

                return { index, photoUrl, latitude, longitude }; // 사진 URL, 위도, 경도 반환
            }).catch((error) => {
                console.error(`구글 API 요청 중 오류 for item ${index}: `, error);
                return { index, photoUrl: null, latitude: null, longitude: null }; // 오류 시 null 반환
            });
        });

        // Promise.all로 모든 요청이 끝나기를 기다린 후
        Promise.all(googleKeywordSearch)
            .then((results) => {
                // 인덱스를 기준으로 결과를 정렬
                const sortedResults = results.sort((a, b) => a.index - b.index);
                setGoogleResult(sortedResults); // 사진 URL, 위도, 경도 포함한 결과 저장
            })
            .catch((error) => {
                console.error('요청 중 오류 발생: ', error);
            });



    }, []); // 빈 배열로 설정하여 처음 한 번만 실행되도록

    if (loading) return <p>로딩 중...</p>;
    if (error) return <p>{error}</p>;
    if (!detailCommon) return <p>여행 코스 정보가 없습니다.</p>;

    const sanitizedOverview = detailCommon.overview.replace(/<br\s*\/?>/g, ' ');

    return (
        <div className="TravelCourseInfo-wrapper">
            <h3>{detailCommon.title} 코스 설명 - <br />{sanitizedOverview}</h3>
            {/* keywordResults가 준비되었을 때만 MyComponent 렌더링 */}
            {keywordResults.length > 0 && <MyComponent courseDetail={courseDetail} keywordResults={keywordResults} googleResult={googleResult} detailCommon={detailCommon} />}
        </div>
    );
};

const MyComponent = ({ courseDetail, keywordResults, googleResult, detailCommon }) => {
    console.log('detailCommon : ', detailCommon)
    console.log('courseDetail : ', courseDetail);
    const swiperRef = useRef(null);

    const goToSlide = (index) => {
        if (swiperRef.current) swiperRef.current.slideTo(index);
    };

    console.log('MyComponents : googleResult : ', googleResult);
    useEffect(() => {
        if (!googleResult || googleResult.length === 0) return;

        if (window.kakao && window.kakao.maps) {
            const container = document.getElementById('main-map');
            const bounds = new window.kakao.maps.LatLngBounds();

            const options = {
                center: new window.kakao.maps.LatLng(googleResult[0]?.latitude, googleResult[0]?.longitude),
                level: 5,
            };

            const map = new window.kakao.maps.Map(container, options);

            googleResult.forEach((result, index) => {
                console.log('result : ', result);
                if (result.latitude && result.longitude) {
                    const position = new window.kakao.maps.LatLng(result.latitude, result.longitude);
                    bounds.extend(position);

                    // 1. 기본 마커 생성
                    const marker = new window.kakao.maps.Marker({
                        position,
                        map,
                    });
                    marker.setOpacity(0); // 마커를 투명하게 설정

                    // 2. 커스텀 오버레이 생성 (div)
                    const customOverlayContent = `
                        <div 
                            style="position: absolute; left: -15px; top: -40px; 
                                   padding: 5px; font-size: 16px; font-weight: bold; 
                                   background-color: white; border-radius: 50%; 
                                   width: 30px; height: 30px; display: flex; 
                                   justify-content: center; align-items: center; 
                                   border: 2px solid #000; cursor: pointer; z-index: 100;">
                                   ${index + 1}
                                   </div>
                                   `;
                    //    onMouseOver="showInfoWindow(${index}, ${result.latitude}, ${result.longitude}, '${index + 1}번')"
                    //    onMouseOut="hideInfoWindow()">

                    const customOverlay = new window.kakao.maps.CustomOverlay({
                        position,
                        content: customOverlayContent,
                        clickable: true,
                    });

                    // 3. 커스텀 오버레이를 맵에 추가
                    customOverlay.setMap(map);

                    // 4. 인포윈도우를 생성
                    const infowindow = new window.kakao.maps.InfoWindow({
                        content: `<div style="padding:5px; font-size:12px;">${keywordResults[index].subname}</div>`,
                    });

                    // 5. 인포윈도우를 항상 열리게 설정
                    infowindow.open(map, marker);
                }
            });

            // 지도 범위 설정
            map.setBounds(bounds);
        }
    }, [googleResult]);







    return (
        <>
            {detailCommon.homepage && (
                <div>
                    <a
                        href={detailCommon.homepage.match(/href="(.*?)"/)?.[1]}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none', color: 'blue' }}
                    >
                        홈페이지 바로가기
                    </a>
                </div>
            )}

            <div>
                <div id="main-map" style={{ width: '1200px', height: '400px' }}></div>

            </div>
            <ul className="Course-list-Numbox">
                {keywordResults.map((subItem, index) => (
                    <li key={index} onClick={() => goToSlide(index)}>
                        <em>{index + 1}</em>
                        <div>
                            {subItem?.data?.item[0]?.firstimage ? (
                                <div>
                                    <img
                                        src={subItem.data.item[0].firstimage}
                                        alt={`Slide ${index + 1}`}
                                        style={{ width: '120px', height: '120px' }}
                                    />
                                    <span>{subItem.subname}</span>
                                </div>
                            ) : (
                                <span>{subItem.subname}</span>
                            )}
                        </div>
                    </li>
                ))}
            </ul>

            {/* Swiper 슬라이드 */}
            <Swiper
                pagination={{ type: 'progressbar' }}
                navigation={true}
                onSwiper={(swiper) => (swiperRef.current = swiper)}
                modules={[Pagination, Navigation]}
                className="mySwiper"
            >
                {keywordResults.map((subItem, index) => (
                    <SwiperSlide key={index}>
                        <div>
                            <h2>{subItem.subname}</h2>
                            {/* 구글 이미지 표시 */}
                            {googleResult[index]?.photoUrl ? (
                                <div>
                                    <img src={googleResult[index].photoUrl} alt={`Google Image ${index}`} />
                                </div>
                            ) : (
                                <span>{subItem.subname}</span>
                            )}


                            {/* 상세 내용 */}
                            <span>{courseDetail.items.item[index]?.subdetailoverview}</span>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </>
    );
};

export default TravelCourseInfo;
