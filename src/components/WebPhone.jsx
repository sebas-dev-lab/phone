import React, { useState, useEffect } from "react";
import useSound from "use-sound";
import ring from "../sound/ringing.mp3";
import "./style.scss";

import SipEvent from "./SipEvents";
import { userAgentSettings } from "../helpers/webphone";
import PhoneTags from "./PhoneTags";
import Events from "./EventsTimer";

const WebPhone = () => {
  const [phone, setPhone] = useState(null);
  const [session, setSession] = useState(null);
  const [inCall, setInCall] = useState(false);
  const [callState, setCallState] = useState("");
  const [ringing, setRinging] = useState(false);
  const [time, setTime] = useState({ ms: 0, s: 0, m: 0, h: 0 });
  const [interv, setInterv] = useState();
  const [number, setNumber] = useState("");
  const [play, { stop }] = useSound(ring);

  const { start, stopTime, reset } = Events({
    time,
    setTime,
    interv,
    setInterv,
  });

  const { createPhone, hang, dial, onConnect, onDial } = SipEvent({
    phone,
    session,
    setInCall,
    setCallState,
    start,
    stopTime,
    reset,
    setRinging,
    setSession
  });

  useEffect(() => {
    setPhone(createPhone(userAgentSettings));
  }, []);
  useEffect(() => {
    onDial();
  }, [session]);
  useEffect(() => {
    onConnect();
  }, [phone]);
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
