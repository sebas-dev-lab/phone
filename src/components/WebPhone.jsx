import React, { useState, useEffect } from "react";

// Libs
import useSound from "use-sound";

// Logics imports
import PhoneTags from "./PhoneTags";
import Events from "./EventsTimer";
import SipEvent from "./SipEvents";

// Helpers
import { userAgentSettings } from "../helpers/webphone";

// Styles and sound files
import ring from "../sound/ringing.mp3";
import "./style.scss";

const WebPhone = () => {
  /* MORE INFO IN EACH FILES */

  /* LOGIC STATES */
  const [phone, setPhone] = useState(null);
  const [session, setSession] = useState(null);
  const [inCall, setInCall] = useState(false);
  const [callState, setCallState] = useState(""); //DEPRECATED
  const [ringing, setRinging] = useState(false);
  const [time, setTime] = useState({ ms: 0, s: 0, m: 0, h: 0 });
  const [interv, setInterv] = useState();
  const [number, setNumber] = useState("");
  const [play, { stop }] = useSound(ring);

  /* TIMER CALL EVENTS */
  const { start, stopTime, reset } = Events({
    time,
    setTime,
    interv,
    setInterv,
  });

  /* SIP LOGIC */
  const { createPhone, hang, dial, onConnect, onDial } = SipEvent({
    phone,
    session,
    setInCall,
    setCallState,
    start,
    stopTime,
    reset,
    setRinging,
    setSession,
  });

  /* USER AGENT CREATE AND SET TO PHONE */
  useEffect(() => {
    setPhone(createPhone(userAgentSettings));
  }, []);

  /* CONNECTION WHEN SET PHONE */
  useEffect(() => {
    onConnect();
  }, [phone]);

  /* LOGIC STAGES WHEN YOU CALL */
  useEffect(() => {
    onDial();
  }, [session]);

  /* SOUND WHEN YOU START A NEW CALL */
  useEffect(() => {
    if (ringing) {
      play();
    } else {
      stop();
    }
  }, [ringing]);

  return (
    <PhoneTags
      dial={dial}
      hang={hang}
      time={time}
      number={number}
      inCall={inCall}
      setNumber={setNumber}
    />
  );
};

export default WebPhone;
