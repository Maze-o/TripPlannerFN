import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 지역 및 해시태그 필터 옵션
const regionOptions = [
    { value: '', label: '전체' },
    { value: '1', label: '서울' },
    { value: '6', label: '부산' },
    { value: '4', label: '대구' },
    { value: '2', label: '인천' },
    { value: '5', label: '광주' },
    { value: '3', label: '대전' },
    { value: '7', label: '울산' },
    { value: '8', label: '세종' },
    { value: '31', label: '경기' },
    { value: '32', label: '강원' },
    { value: '33', label: '충북' },
    { value: '34', label: '충남' },
    { value: '35', label: '경북' },
    { value: '36', label: '경남' },
    { value: '37', label: '전북' },
    { value: '38', label: '전남' },
    { value: '39', label: '제주' },
];

const hashtagOptions = [
    { value: '', label: '전체' },
    { value: 'C0112', label: '#가족코스' },
    { value: 'C0113', label: '#나홀로코스' },
    { value: 'C0114', label: '#힐링코스' },
    { value: 'C0115', label: '#도보코스' },
    { value: 'C0116', label: '#캠핑코스' },
    { value: 'C0117', label: '#맛코스' },
];

// 해시태그를 반환하는 함수
function getHashtag(category) {
    switch (category) {
        case 'C0112': return '#가족코스';
        case 'C0113': return '#나홀로코스';
        case 'C0114': return '#힐링코스';
        case 'C0115': return '#도보코스';
        case 'C0116': return '#캠핑코스';
        case 'C0117': return '#맛코스';
        default: return '#추천코스';
    }
}

const TravelSearch = () => {
    const [searchKeyword, setSearchKeyword] = useState('');
    const [regionFilter, setRegionFilter] = useState('');
    const [hashtagFilter, setHashtagFilter] = useState('');
    const [courseData, setCourseData] = useState([]); // 초기값을 빈 배열로 설정
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false); // 로딩 상태 추가
    const pageSize = 10;  // 페이지당 항목 수

    const regionMap = {
        "1": "서울",
        "2": "인천",
        "3": "대전",
        "4": "대구",
        "5": "광주",
        "6": "부산",
        "7": "울산",
        "8": "세종",
        "31": "경기",
        "32": "강원",
        "33": "충북",
        "34": "충남",
        "35": "경북",
        "36": "경남",
        "37": "전북",
        "38": "전남",
        "39": "제주"
    };

    // 검색어를 URL 인코딩하는 함수
    const encodeUTF8 = () => {
        return encodeURIComponent(searchKeyword.trim());
    };

    // 여행 코스 검색 함수
    const handleSearch = () => {
        setLoading(true); // 검색 시작 시 로딩 상태 true로 설정
        const currentEncodedData = encodeUTF8();
        const data = {
            keyword: currentEncodedData,
            pageNo: currentPage,
            hashtag: hashtagFilter,
            regionCode: regionFilter,
        };

        axios.post('http://localhost:9000/api/getSearchKeyword', data, {
            headers: {
                'Content-Type': 'application/json',  // Content-Type을 JSON으로 설정
                // 'Accept': 'application/json'
            }
        })
            .then((response) => {
                console.log('response : ', response)
                setCourseData(response.data.items.item || []); // 빈 배열로 안전하게 설정
                setTotalCount(response.data.totalCount);
                setLoading(false); // 로딩 상태 false로 설정
            })
            .catch((error) => {
                console.error('Error fetching courses:', error);
                setLoading(false); // 에러가 나도 로딩 상태 false로 설정
            });
    };

    // 페이지네이션 버튼 생성 함수
    const createPageButtons = (totalPages) => {
        const maxVisibleButtons = 5; // 한 번에 보이는 최대 버튼 수
        const currentBlock = Math.floor((currentPage - 1) / maxVisibleButtons); // 현재 블록 계산
        const startPage = currentBlock * maxVisibleButtons + 1; // 현재 블록의 시작 페이지
        const endPage = Math.min(startPage + maxVisibleButtons - 1, totalPages); // 현재 블록의 마지막 페이지

        const buttons = [];

        // '처음' 버튼
        if (currentPage > 1) {
            buttons.push(
                <button key="first" onClick={() => handlePageChange(1)}>처음</button>
            );
        }

        // '이전' 버튼
        if (currentBlock > 0) {
            buttons.push(
                <button key="prev" onClick={() => handlePageChange(startPage - 1)}>이전</button>
            );
        }

        // 현재 블록 기준으로 버튼 생성
        for (let i = startPage; i <= endPage; i++) {
            buttons.push(
                <button
                    key={i}
                    className={i === currentPage ? 'active' : ''}
                    onClick={() => handlePageChange(i)}
                >
                    {i}
                </button>
            );
        }

        // '다음' 버튼
        if (endPage < totalPages) {
            buttons.push(
                <button key="next" onClick={() => handlePageChange(endPage + 1)}>다음</button>
            );
        }

        // '끝' 버튼
        if (currentPage < totalPages) {
            buttons.push(
                <button key="last" onClick={() => handlePageChange(totalPages)}>끝</button>
            );
        }

        return buttons;
    };

    // 페이지 버튼 누를 시 페이지 변경 처리 함수 (axios 다시 요청)
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);  // 페이지 상태 변경
        handleSearch();
    };

    // 최초 로딩 시에는 데이터를 요청하지 않고 검색 버튼을 누를 때만 요청
    useEffect(() => {
        handleSearch();
    }, []);

    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <div>
            <h1>여행 코스 검색</h1>

            {/* 지역 필터 */}
            <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
            >
                {regionOptions.map((region) => (
                    <option key={region.value} value={region.value}>
                        {region.label}
                    </option>
                ))}
            </select>

            {/* 해시태그 필터 */}
            <select
                value={hashtagFilter}
                onChange={(e) => setHashtagFilter(e.target.value)}
            >
                {hashtagOptions.map((hashtag) => (
                    <option key={hashtag.value} value={hashtag.value}>
                        {hashtag.label}
                    </option>
                ))}
            </select>

            {/* 키워드 입력 */}
            <input
                type="text"
                placeholder="검색어를 입력하세요"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
            />
            <button onClick={handleSearch}>검색</button>

            {/* 로딩 상태 처리 */}
            {loading ? (
                <div>로딩 중...</div>
            ) : (
                <>
                    <div>
                        총 {totalCount}개 코스
                    </div>

                    {/* 데이터가 비어있을 때 "결과가 없습니다" 메시지 */}
                    {courseData.length === 0 ? (
                        <div>결과가 없습니다.</div>
                    ) : (
                        <div>
                            {courseData.map((course) => {
                                const regionName = regionMap[course.areacode] || '알 수 없음';
                                const hashtag = getHashtag(course.cat2); // 해시태그 가져오기
                                
                                return (
                                    <div key={course.contentid}>
                                        <img src={course.firstimage || 'https://example.com/default-image.jpg'} alt={course.title} />
                                        <h4>{course.title}</h4>
                                        <p>{regionName}</p>
                                        <p>{hashtag}</p> {/* 해시태그 표시 */}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* 페이지네이션 버튼들 */}
                    <div className="pagination">
                        {createPageButtons(totalPages)}
                    </div>
                </>
            )}
        </div>
    );
};

export default TravelSearch;
