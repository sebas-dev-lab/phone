import React, { useState, useRef, useEffect } from "react";
import env from "../../config/config";
import {
  UserAgent,
  Inviter,
  SessionState,
  Web,
  Registerer,
  Session,
} from "sip.js";
import { extractDomain, plugAudio } from "../../helpers/phoneSip";
import {
  PH_ST_DISCONNECTED,
  PH_ST_REGISTRATIONFAILED,
  PH_ST_UNREGISTERED,
  PH_ST_CONNECTED,
  PH_ST_REGISTERED,
  SE_ST_PROGRESS,
  SE_ST_ACCEPTED,
  SE_ST_CANCELED,
  SE_ST_TERMINATED,
  SE_ST_BYE,
  SE_ST_FAILED,
  SE_ST_REJECTED,
  SE_ST_DTMF,
} from "../../helpers/phoneSip";
import "./style.scss";
import useSound from "use-sound";
import ring from "../../sound/ringing.mp3";
import { PhoneOutlined, CloseOutlined } from "@ant-design/icons";
import Timer from "./timer";

const Phone = () => {
  const [phone, setPhone] = useState(null);
  const [state, setState] = useState("Iniciando");
  const [session, setSession] = useState(null);
  const [inCall, setInCall] = useState(false);
  const [callState, setCallState] = useState("");
  const [original_avatar, setOriginalAvatar] = useState("");
  const [number, setNumber] = useState("");
  const [ringing, setRinging] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [time, setTime] = useState({});
  const [play, { stop }] = useSound(ring);

  /*
    createPhone \\funcion usada en phone
    var phone-> createPhone # crea las condiciones de llamada. \\use=Effect

  */

  /*  Configuracion inicial  */
  function createPhone(conf) {
    const userAgent = new UserAgent({
      authorizationPassword: conf.password,
      authorizationUser: conf.authorizationUser,
      displayName: conf.displayName,
      userAgentString: conf.userAgentString,
      uri: UserAgent.makeURI(
        `sip:${conf.authorizationUser}@${extractDomain(conf.sipServer)}:8089`
      ),
      transportOptions: {
        wsServers: [conf.sipServer],
        traceSip: false,
        maxReconnectionAttempts: 30,
        reconnectionTimeout: 5,
      },
      hackWssInTransport: true,
      registerExpires: 30,
      hackIpInContact: true,
      log: {
        level: conf.logLevel,
      },
      stunServers: conf.stunServers,
      sessionDescriptionHandlerFactoryOptions: {
        constraints: {
          audio: true,
          video: false,
        },
      },
    });

    return userAgent;
  }

  function hang(e) {
    e.preventDefault();
    switch (session.state) {
      case SessionState.Initial:
      case SessionState.Establishing:
        if (session) {
          // An unestablished outgoing session
          session.cancel();
        } else {
          // An unestablished incoming session
          session.reject();
        }
        break;
      case SessionState.Established:
        // An established session
        session.bye();
        break;
      case SessionState.Terminating:
      case SessionState.Terminated:
        // Cannot terminate a session that is already terminated
        break;
    }
  }

  function dial(e, dialCall) {
    // setPlay(true);
    e.preventDefault();

    phone.start().then(() => {
      // Set target destination (callee)

      // Handle outgoing session state changes

      // Send initial INVITE request
      session &&
        session
          .invite()
          .then((e) => {
            // INVITE sent
            console.log(e);
          })
          .catch((error) => {
            // INVITE did not send
          });
    });
  }

  useEffect(() => {
    setPhone(
      createPhone({
        sipServer: env.SIP_SERVER,
        authorizationUser: env.AUTHORIZATION_USER,
        password: env.AUTHORIZATION_PASSWORD,
        displayName: env.DISPLAY_NAME,
        userAgentString: env.USER_AGENT,
        stunServers: env.STUN_SERVERS,
        logLevel: env.LOG_LEVEL,
      })
    );
    // Connect the user agent
  }, []);

  useEffect(() => {
    session &&
      session.stateChange.addListener((newState) => {
        switch (newState) {
          case SessionState.Initial:

          case SessionState.Establishing:
            // Session is establishing
            setInCall(true);
            setRinging(true);
            setCallState("Calling");
            // togglePlay();
            console.log(inCall);
            alert("stop");
            break;
          case SessionState.Established:
            // Session has been established
            setCallState(SE_ST_ACCEPTED);
            plugAudio(session.sessionDescriptionHandler.peerConnection);
            // togglePlay();
            setRinging(false);
            break;
          case SessionState.Terminated:
            // Session has terminated
            setCallState(SE_ST_TERMINATED);
            setInCall(false);
            setRinging(false);
            // togglePlay();
            setTimeout(() => {
              setCallState("");
            }, 3000);
            break;
          default:
            break;
        }
      });
  }, [session]);

  useEffect(() => {
    if (phone) {
      const target = UserAgent.makeURI(
        `sip:*600@${extractDomain(env.SIP_SERVER)}:8089`
      );
      if (!target) {
        throw new Error("Failed to create target URI.");
      }
      // Create a user agent client to establish a session
      const inviter = new Inviter(phone, target, {
        sessionDescriptionHandlerOptions: {
          constraints: { audio: true, video: false },
        },
      });
      setSession(inviter);
    }
  }, [phone]);

  useEffect(() => {
    if (ringing) {
      play();
    } else {
      stop();
    }
  }, [ringing]);

  function countTime() {
    if (SessionState.Established === '"Established"') {
      alert("entro");
      let seconds = callDuration + 1;
      setTime(timer(seconds));
    } else {
      setCallDuration(0);
      setTime(timer(callDuration));
    }
  }
  function timer() {
    let divisor = callDuration % (60 * 60);
    let minutes = Math.floor(divisor / 60);
    let seconds_divisor = divisor % 60;
    let seconds = Math.ceil(seconds_divisor);
    let obj = {
      m: minutes,
      s: seconds,
    };
    return obj;
  }

  useEffect(() => {
    countTime();
  }, [SessionState]);

  return (
    <div>
      <input
        type="text"
        value={number}
        onChange={(e) => {
          setNumber(e.target.value);
        }}
      />
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
      {/* <p>{`${time.m}:${time.s}`}</p> */}
      <Timer />

      {/* <audio className="audio-element">
        <source src="https://www.elongsound.com/images/mp3/triangulol_loop_140_2.mp3"></source>
      </audio> */}
      {/* <audio
        style={{ display: "none !important" }}
        ref={audioRef}
        src="./ringing.mp3"
      ></audio> */}
    </div>
  );
};

export default Phone;
