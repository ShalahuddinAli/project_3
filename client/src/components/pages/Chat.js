import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Container, Col, Row } from "react-bootstrap";
import { Redirect } from "react-router-dom";
import Navbar from "../functions/Navbar";
import { Link } from "react-router-dom";

import io from "socket.io-client";
import "../styles/chat.css";
import StyledBadge from "../styles/onlinelight";
const socket = io();

const Chat = () => {
  useEffect(() => {
    document.title = "Chatrooms";
  }, []);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const boards = useSelector((state) => state.board.boards);
  const board = useSelector((state) => state.board.board);

  const [chatUsers, setChatUsers] = useState([]);
  const [chatMessage, setchatMessage] = useState({
    name: "",
    msg: "",
    room: "",
    isPM: false,
  });
  const [msgList, setMsgList] = useState([]);
  const [currentRoom, setCurrentRoom] = useState("General");

  useEffect(() => {
    socket.emit("userJoin", user.name);
  }, []);

  socket.on("newMessage", (newMessage) => {
    // return message
    setMsgList([
      ...msgList,
      { name: newMessage.name, msg: newMessage.msg, isPM: newMessage.isPM },
    ]);
  });

  // whenever send from server and set it
  socket.on("listOfUsers", (listOfUsers) => {
    setChatUsers(listOfUsers);
    setchatMessage({ name: user.name, msg: chatMessage.msg });
  });

  const handleChange = (e) => {
    setchatMessage({ ...chatMessage, [e.target.name]: e.target.value });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const newMessage = {
      name: chatMessage.name,
      msg: chatMessage.msg,
      room: currentRoom,
      isPM: checkPM(currentRoom, chatUsers),
    };

    //console.log("Just Sent: ", newMessage);

    // Once confirm sent out need to check backend
    socket.emit("newMessage", newMessage);

    setchatMessage({
      name: user.name,
      msg: "",
    });
  };
  const enterRoom = (e) => {
    let oldRoom = currentRoom;
    let newRoom = e.target.textContent;
    setCurrentRoom(newRoom);
    socket.emit("roomEntered", { oldRoom, newRoom });

    // to empty out chat or it will bring over
    setMsgList([]);
  };

  const checkPM = (roomName, userList) => {
    let isPM = false;
    userList.forEach((userName) => {
      if (userName === roomName) {
        isPM = true;
      }
    });
    return isPM;
  };

  if (!isAuthenticated) {
    return <Redirect to="/" />;
  }

  return (
    <Container className="chat clearfix">
      <Navbar />
      <nav className="backpage">
        <Link to={`/board/${board._id}/`}>Board</Link>
      </nav>
      <div id="user-list">
        <h4>
          <b>Project Chatrooms</b>
        </h4>
        <ul style={{ listStyleType: "none" }} className="clearfix">
          {boards.map((board) => {
            return (
              <li
                onClick={enterRoom}
                style={{ cursor: "pointer" }}
                key={board._id}
              >
                <h4>{board.title}</h4>
                <hr className="line" size="8" width="100%"></hr>
              </li>
            );
          })}
        </ul>

        <h4 className="name">
          <b>Online Users: </b>
        </h4>
        <ul style={{ listStyleType: "none" }} className="clearfix">
          {chatUsers.map((user) => {
            return (
              <li onClick={enterRoom} style={{ cursor: "pointer" }} key={user}>
                <span className=" onlineStatus">
                  {" "}
                  <h4>{user}</h4>
                  <StyledBadge
                    className="light"
                    overlap="circle"
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "right",
                    }}
                    variant="dot"
                    marginLeft="20rem"
                  ></StyledBadge>
                </span>
                <hr className="line" size="8" width="100%"></hr>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="messages">
        <h4 className="room"> Chat Messages ({currentRoom}) Room </h4>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            name="msg"
            value={chatMessage.msg}
            onChange={handleChange}
            required
            style={{ width: "80%" }}
          />
          <input className="msgSendBtn" type="submit" value="Send" />
        </form>
        <div id="chatMessages" style={{ border: "1px solid black" }}>
          Messages
          <ul style={{ listStyle: "none" }}>
            {msgList.map((msgList, index) => {
              return (
                <li key={index}>
                  <b>
                    {msgList.isPM
                      ? `PM from ${msgList.name}: `
                      : `${msgList.name}: `}
                  </b>

                  <i>
                    <span style={{ color: msgList.isPM ? "red" : "black" }}>
                      {""}
                      {msgList.msg}
                    </span>
                  </i>
                </li>
              );
            })}
          </ul>
        </div>{" "}
      </div>
    </Container>
  );
};

export default Chat;
