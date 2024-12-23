
const Board = () => {
    return (
        
        <div className="board-wrapper">

            <h1>게시판</h1>

            {/* 플래너 리스트들이 담길 구역 */}
            <div className="planner-list">
                <ul>
                    <li>
                        <p>몇박 몇일</p>
                        <div>이미지 띄우기</div>
                        <p>플래너 이름</p>    
                        <p>주소</p>
                        <p>생성일 or 수정일</p>
                        <p>별점 , 댓글</p>
                    </li>  
                </ul>
            </div>

        </div>
    )
}   

export default Board