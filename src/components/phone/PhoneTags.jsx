import React from "react";
import { PhoneOutlined, CloseOutlined } from "@ant-design/icons";

const PhoneTags = ({ dial, hang, time, number, inCall, setNumber }) => {
  return (
    <div>
      <input
        type="text"
        value={number}
        onChange={(e) => {
          setNumber(e.target.value);
        }}
      />
      <span>{time.m >= 10 ? time.m : "0" + time.m}</span>&nbsp;:&nbsp;
      <span>{time.s >= 10 ? time.s : "0" + time.s}</span>&nbsp;
      {inCall ? (
        <button
          className={
            inCall ? "SocialSharing__link call-hang" : "call-hang-active"
          }
          onClick={(e) => hang(e)}
        >
          <CloseOutlined />
        </button>
      ) : (
        <button
          className="SocialSharing__link call-dial is-animating"
          onClick={(e) => dial(e, number)}
        >
          <PhoneOutlined />
        </button>
      )}
    </div>
  );
};

export default PhoneTags;
