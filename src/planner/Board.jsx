
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const Board = () => {
    const [planners, setPlanners] = useState([]);

    const navigate = useNavigate();

    const handlePlannerClick = (plannerID) => {
        navigate(`destination?plannerID=${plannerID}`);
    };

    // API 호출
    useEffect(() => {
        axios.get("http://localhost:9000/planner/board")
            .then((response) => {
                console.log("reponse : ", response);
                setPlanners(response.data)
            })
            .catch((error) => {
                console.error("Error fetching planners:", error)
            });
    }, []);


    return (

        <div className="board-wrapper">

            <h1>게시판</h1>

            {/* 플래너 리스트들이 담길 구역 */}
            {planners.map(planner => (
                <div
                    key={planner.plannerID}
                    className="planner-item"
                    onClick={() => handlePlannerClick(planner.plannerID)}
                >
                    <div>   
                        <img src={planner.thumbnailImage}></img>
                    </div>
                    <h3>{planner.plannerTitle}</h3>
                    <p>작성자 : {planner.username}</p>
                    <p>
                        기간 :
                        {planner.day === 1
                            ? "당일"
                            : `${planner.day - 1}박 ${planner.day}일`}
                    </p>
                    <p>작성일: {new Date(planner.createAt).toLocaleDateString()}</p>
                </div>
            ))}


        </div>
    )
}

export default Board