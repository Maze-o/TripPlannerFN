import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/Destination.scss';

const Destination = () => {
    const location = useLocation();
    const { plannerItem } = location.state || {}; // state에서 데이터 가져오기
    const plannerID = new URLSearchParams(location.search).get("plannerID");
    const [destinations, setDestinations] = useState([]);
    const [username, setUsername] = useState('');
    const [likes, setLikes] = useState(plannerItem ? plannerItem.likes : 0);  // 좋아요 상태
    const [commentText, setCommentText] = useState(''); // 댓글 입력 상태
    const [comments, setComments] = useState([]); // 댓글 목록 상태

    const navigate = useNavigate();

    // destination 데이터를 서버에서 가져오는 API 호출
    useEffect(() => {
        if (plannerID) {
            axios.get(`http://localhost:9000/planner/board/destination?plannerID=${plannerID}`)
                .then((response) => {
                    setUsername(response.data[0].username);
                    setDestinations(response.data);
                    setComments(response.data[0].comments || []);  // 서버에서 댓글 데이터 받기
                })
                .catch((error) => {
                    console.error("Error fetching destinations:", error);
                });
        }
    }, [plannerID]);

    // 자세히 보기 버튼 누르면 이동
    const linkToDestinationInfo = () => {
        navigate(`/planner/board/destination/info?plannerID=${plannerID}`);
    }

    // 좋아요 클릭 시 처리 함수
    const handleLikeClick = () => {
        axios.post(`http://localhost:9000/planner/like`, {
            plannerID,
            userID: 'currentUserID',  // 현재 로그인된 사용자 ID를 전달
        })
            .then((response) => {
                setLikes(response.data.likes); // 서버에서 반환한 좋아요 개수를 업데이트
            })
            .catch((error) => {
                console.error("Error updating like:", error);
            });
    };

    // 댓글 입력 처리 함수
    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (!commentText.trim()) {
            return;  // 빈 댓글은 전송하지 않음
        }

        axios.post(`http://localhost:9000/planner/board/comment`, {
            plannerID,
            userId: 'currentUserID',  // 현재 로그인된 사용자 ID
            comment: commentText,
        })
            .then((response) => {
                setComments((prevComments) => [...prevComments, response.data]); // 댓글 목록에 추가
                setCommentText(''); // 입력 필드 초기화
            })
            .catch((error) => {
                console.error("Error adding comment:", error);
            });
    };

    return (
        <div className="Destination-wrapper">
            <div className="Destination-desc">
                <img src={plannerItem.thumbnailImage} alt={plannerItem.plannerTitle} />
                <h2>{plannerItem.plannerTitle}</h2>
                <p>{plannerItem.day - 1}박 {plannerItem.day}일</p>
                <p>지역 : {plannerItem.area}</p>
                <p>코스 설명 : {plannerItem.description}</p>
                <p>좋아요: {likes}</p>
                <button onClick={handleLikeClick}>좋아요</button>
                <button onClick={linkToDestinationInfo}>코스 자세히 보기</button>
                {/* 수정 삭제는 로그인 기능 병합 후 진행 */}
                {/* <div>수정</div>
                <div>삭제</div> */}
            </div>

            <div className="Destination-comments">
                <h3>댓글</h3>
                <ul>
                    {comments.map((comment, index) => (
                        <li key={index}>
                            <p>{comment.username}: {comment.text}</p>
                        </li>
                    ))}
                </ul>

                <form onSubmit={handleCommentSubmit}>
                    <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="댓글을 입력하세요"
                    />
                    <button type="submit">댓글 작성</button>
                </form>
            </div>
        </div>
    );
};

export default Destination;
