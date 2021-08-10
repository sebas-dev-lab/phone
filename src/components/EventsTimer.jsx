import { useState } from "react";

const Events = ({ time, setTime, interv, setInterv }) => {
  var updateMs = time.ms,
    updateS = parseInt(time.s),
    updateM = parseInt(time.m),
    updateH = parseInt(time.h);

  const run = () => {
    if (updateM === 60) {
      updateH++;
      updateM = 0;
    }
    if (updateS === 60) {
      updateM++;
      updateS = 0;
    }
    if (updateMs === 100) {
      updateS++;
      updateMs = 0;
    }
    updateMs++;
    return setTime({ ms: updateMs, s: updateS, m: updateM, h: updateH });
  };

  return {
    start: () => {
      run();
      setInterv(setInterval(run, 10));
    },
    stopTime: () => {
      clearInterval(interv);
    },
    reset: () => {
      clearInterval(interv);
      return setTime({ ms: 0, s: 0, m: 0, h: 0 });
    },
  };
};

export default Events;
