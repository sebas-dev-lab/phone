import React, { useEffect, useState } from "react";

const Timer = () => {
  const [time, setTime] = useState("");
  const [seconds, setSeconds] = useState(0);
  let start = true;

  function updateTimer() {
    let newSecond = seconds + 1;
    let callduration = pad(newSecond % 60);
    let minutes = pad(parseInt(newSecond / 60));
    let final_output = minutes + ":" + callduration;
    setTime(final_output);
    // return final_output
  }

  function pad(val) {
    var valString = val + "";
    if (valString.length < 2) {
      return "0" + valString;
    } else {
      return valString;
    }
  }

  useEffect(() => {
      while (start) {
        updateTimer();
      }
},seconds);

  return <div>{start && time} </div>;
};

export default Timer;
