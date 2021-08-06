import React, { useState, useRef, useEffect } from "react";
import env from "../../config/config";
// import { Web, Inviter, SessionState, UserAgent } from "sip.js";
import { UserAgent, Inviter, SessionState, Web } from "sip.js";
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

const Phone = () => {
  const [phone, setPhone] = useState(null);
  const [state, setState] = useState("Iniciando");
  const [session, setSession] = useState(null);
  const [inCall, setInCall] = useState(false);
  const [callState, setCallState] = useState("");
  const [original_avatar, setOriginalAvatar] = useState("");
  const [number, setNumber] = useState("");
  const [play, setPlay] = useState(true);
  let audioRef = useRef();
  let audio = new Audio("./ringing.mp3");
  function focusAudio() {
    audioRef.current.focus();
  }
  console.log(audio);

  /*
    createPhone \\funcion usada en phone
    var phone-> createPhone # crea las condiciones de llamada. \\use=Effect

  */

  /*  Configuracion inicial  */
  function createPhone(conf) {
    const userAgent = new UserAgent({
      password: conf.password,
      authorizationUser: conf.authorizationUser,
      displayName: conf.displayName,
      userAgentString: conf.userAgentString,
      uri: UserAgent.makeURI(
        `sip:${conf.authorizationUser}@${extractDomain(conf.sipServer)}`
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
    session.terminate();
  }

  let togglePlay = () => {
    const audioEl = document.getElementsByClassName("audio-element")[0];
    if (play) {
      audioEl
        .play()
        .then(() => {})
        .catch((e) => {
          console.log(e);
        });

      // audio.play().catch((error) => {
      //  when an exception is played, the exception flow is followed
      // });
    } else {
      // audio.pause();
      audioEl.pause();
    }
  };

  function dial(e, dialCall) {
    e.preventDefault();
    phone.start().then(() => {
      // Set target destination (callee)

      const target = UserAgent.makeURI(
        `sip:${env.AUTHORIZATION_USER}@${extractDomain(env.SIP_SERVER)}`
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
      console.log(session);
      // Handle outgoing session state changes
      session &&
        session.stateChange.addListener((newState) => {
          console.log(newState);
          // let audio = audioRef.current;
          switch (newState) {
            case SessionState.Establishing:
              // Session is establishing
              setInCall(true);
              setCallState("Calling");
              setPlay(true);
              togglePlay();
              console.log(play);
              alert("stop");
              break;
            case SessionState.Established:
              // Session has been established
              plugAudio(session.sessionDescriptionHandler.peerConnection);
              setCallState(SE_ST_ACCEPTED);
              setPlay(false);
              togglePlay();
              break;
            case SessionState.Terminated:
              // Session has terminated
              setInCall(false);
              setCallState(SE_ST_TERMINATED);
              setPlay(false);
              togglePlay();
              setTimeout(() => {
                setCallState("");
              }, 3000);
              break;
            default:
              break;
          }
        });

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
    togglePlay();
    if (phone) {
      // Connect the user agent
    }
  }, []);

  useEffect(() => {
    audio.addEventListener("ended", () => setPlay(false));

    return () => audio.removeEventListener("ended", () => setPlay(false));
  }, []);

  console.log(phone);

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
          C<i className="fas fa-phone"></i>
        </button>
      ) : (
        <button
          className="SocialSharing__link call-dial is-animating"
          onClick={(e) => dial(e, number)}
        >
          LL
          <i className="fas fa-phone"></i>
        </button>
      )}
      <audio className="audio-element">
        <source src="webphone_react/src/components/phone/ringing.mp3"></source>
      </audio>
      {/* <audio
        style={{ display: "none !important" }}
        ref={audioRef}
        src="./ringing.mp3"
      ></audio> */}
    </div>
  );
};

export default Phone;
