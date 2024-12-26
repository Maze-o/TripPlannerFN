import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation, Link } from 'react-router-dom';
import '../css/TouristInfo.scss';
import homepageIcon from '../images/homepageIcon.png'
import favIcon from '../images/favIcon.png'
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import DOMPurify from 'dompurify';

// swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { EffectFade, Navigation, Pagination } from 'swiper/modules';

// detailIntro 정보 띄워줄 때 사용할 변수
const details = [
    { key: 'infocenter', label: '문의 및 안내 :' },
    { key: 'parking', label: '주차 :' },
    { key: 'opendate', label: '오픈일 :' },
    { key: 'restdate', label: '휴무일 :' },
    { key: 'usetime', label: '이용시간 :' },
    { key: 'chkcreditcard', label: '신용카드 :' },
    { key: 'chkbabycarriage', label: '아기 동반 :' },
    { key: 'chkpet', label: '펫 동반 :' },
    { key: 'expguide', label: '체험코스 :' },
];

const TouristInfo = () => {

    const location = useLocation();
    const { detailCommon } = location.state || {}; // state에서 데이터 가져오기
    const detail = detailCommon.items.item[0]; // 상세정보 데이터 가공
    const [detailInfo, setDetailInfo] = useState('');
    const [detailIntro, setDetailIntro] = useState('');
    const [photoUrls, setPhotoUrls] = useState([]); // 이미지 URL 리스트 상태 추가
    const mapContainer = useRef(null); // 지도 컨테이너 ref

    const openMapDetail = (lat, lng) => {
        const kakaoMapUrl = `https://map.kakao.com/link/map/${lat},${lng}`;
        window.open(kakaoMapUrl);
    };

    useEffect(() => {
        if (!window.kakao || !window.kakao.maps) {
            console.error("Kakao Maps API가 로드되지 않았습니다.");
            return;
        }

        const mapOption = {
            center: new window.kakao.maps.LatLng(detail.mapy, detail.mapx),
            level: 3,
            draggable: false,
            disableDoubleClickZoom: false,
        };

        const map = new window.kakao.maps.Map(mapContainer.current, mapOption);
        const markerPosition = new window.kakao.maps.LatLng(detail.mapy, detail.mapx);
        const marker = new window.kakao.maps.Marker({ position: markerPosition });
        marker.setMap(map);

        if (detailCommon) {

            // 관광지 상세정보 추가 API 호출
            axios.post(`http://localhost:9000/tourist-detailInfo`, { contentId: detail.contentid })
                .then((response) => {
                    console.log('detailInfo : ', response);
                    setDetailInfo(response.data.items);
                })
                .catch((error) => {
                    console.log(error);
                });

            // 소개정보 조회 API 호출
            axios.post('http://localhost:9000/tourist-detailIntro', { contentId: detail.contentid })
                .then((response) => {
                    console.log('detailIntro : ', response);
                    setDetailIntro(response.data.items.item[0]);
                })
                .catch((error) => {
                    console.log(error);
                });

            // 구글 API로 이미지 URL 리스트 받기
            axios.post('http://localhost:9000/google-search-places', {
                keyword: encodeURIComponent(detail.title) // 키워드 인코딩
            })
                .then((response) => {
                    console.log('google response : ', response);
                    setPhotoUrls(response.data.photoUrls); // 이미지 URL 리스트 업데이트
                })
                .catch((error) => {
                    console.log(error);
                });

        }
    }, [detailCommon]);

    return (
        <div className="touristInfo-wrapper">
            <div className="desc-content">
                <div className="desc__link-container">
                    <Link to="/tourist"><p>관광지</p></Link>
                </div>
                <h2 className="desc__title">{detail.title}</h2>
                <div className="desc__address-container">
                    <span>{detail.addr1}</span>
                </div>
                <div className="desc__homepage">
                    <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip id="tooltip" className="custom-tooltip">즐겨찾기</Tooltip>}
                    >
                        <img className="favIcon" src={favIcon} />
                    </OverlayTrigger>
                    {detail.homepage ? (
                        <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id="tooltip" className="custom-tooltip">홈페이지</Tooltip>}
                        >
                            <a href={detail.homepage.match(/href="(.*?)"/)?.[1]} target="_blank" rel="noopener noreferrer">
                                <img className="homepageIcon" src={homepageIcon} />
                            </a>
                        </OverlayTrigger>
                    ) : <span></span>}
                </div>
            </div>

            <div className="image-block">
                <Swiper
                    spaceBetween={30}
                    effect={'fade'}
                    navigation={true}
                    pagination={{ clickable: true }}
                    modules={[EffectFade, Navigation, Pagination]}
                    className="mySwiper"
                >
                    {/* 항상 첫 번째 이미지는 detail.firstImage로 고정 */}
                    <SwiperSlide>
                        <img src={detail.firstimage} alt="First Image" />
                    </SwiperSlide>

                    {/* Google에서 받아온 이미지들 */}
                    {photoUrls.length > 0 &&
                        photoUrls.map((url, index) => (
                            <SwiperSlide key={index}>
                                <img src={url} alt={`Tourist Image ${index}`} />
                            </SwiperSlide>
                        ))
                    }
                </Swiper>
            </div>

            <div className="overview-content">
                <h2 className="overview__title">상세정보</h2>
                <p className="overview-detail" >{detail.overview}</p>
            </div>

            {/* Kakao 지도 표시 */}
            <div
                ref={mapContainer}
                style={{ width: '100%', height: '400px', margin: '20px 0', position: 'relative' }}

            >
                {/* "자세히 보기" 버튼 */}
                <button
                    className="map-detail-btn"
                    onClick={() => openMapDetail(detail.mapy, detail.mapx)}
                    style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: '10px',
                        backgroundColor: '#007bff',
                        color: '#fff',
                        padding: '10px 15px',
                        borderRadius: '5px',
                        border: 'none',
                        cursor: 'pointer',
                        zIndex: '20',
                    }}
                >
                    자세히 보기
                </button>
            </div>

            <div className="detail-content">

                <ul className="detailInfo-ul">
                
                    {detailInfo?.item?.map((subItem, index) => (
                        <li key={index} className="detail_items">
                            <strong className="detail_items-title">{subItem.infoname} : </strong>
                            <span className="detail_items-text"
                                dangerouslySetInnerHTML={{
                                    __html: DOMPurify.sanitize(subItem.infotext),
                                }}
                            ></span>
                        </li>
                    ))}

                </ul>



                <ul className="detailInfo-ul">
                    {details.map(({ key, label }) => {
                        const value = detailIntro[key]; // detailIntro에서 값 가져오기
                        return (
                            value && value !== '없음' && ( // 값이 존재할 때만 렌더링
                                <li className="detail_items" key={key}>
                                    <strong className="detail_items-title">{label}</strong>
                                    <span
                                        className="detail_items-text"
                                        dangerouslySetInnerHTML={{
                                            __html: DOMPurify.sanitize(value),
                                        }}
                                    ></span>
                                </li>
                            )
                        );
                    })}
                </ul>


            </div>
        </div >
    );
};

export default TouristInfo;
