import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import '../css/Board.scss';

const Board = () => {
    const [planners, setPlanners] = useState([]);

    const navigate = useNavigate();

    const handlePlannerClick = (plannerID) => {

        // let로 선언하여 plannerItem을 변경할 수 있도록 함
        let plannerItem = null;

        // find 메서드를 사용하여 조건에 맞는 첫 번째 아이템 찾기
        plannerItem = planners.find((item) => item.plannerID === plannerID);

        console.log('dd : ', plannerItem);

        // navigate(`destination/info?plannerID=${plannerID}`);
        navigate(`destination?plannerID=${plannerID}`, { state: { plannerItem } });
    };

    // API 호출
    useEffect(() => {
        axios.get("http://localhost:9000/planner/board")
            .then((response) => {
                console.log("response : ", response);
                setPlanners(response.data)
            })
            .catch((error) => {
                console.error("Error fetching planners:", error)
            });
    }, []);


    return (
        <div className="board">
            <div className="board-wrapper">
                <h1 className="board-title">다른 유저의 여행 계획을 확인해 보세요!</h1>

                <div className="planner-content">
                    {/* 플래너 리스트들이 담길 구역 */}
                    {planners.map(planner => (
                        <div
                            key={planner.plannerID}
                            className="planner-item"
                            onClick={() => handlePlannerClick(planner.plannerID)}
                        >
                            <div className="planner-thumbnail">
                                <img src={planner.thumbnailImage} alt="플래너 썸네일" />
                            </div>
                            <div className="planner-info">
                                <h3 className="planner-title">{planner.plannerTitle}</h3>
                                <p className="planner-username">작성자 : {planner.username}</p>
                                <p className="planner-duration">
                                    {/* 기간 : */}
                                    {planner.day === 1
                                        ? "당일"
                                        : `${planner.day - 1}박 ${planner.day}일`}
                                </p>
                                <p className="planner-created-at">작성일 {new Date(planner.createAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Board;
