import { UserAgent, Inviter, SessionState } from "sip.js";
import { SE_ST_ACCEPTED, SE_ST_TERMINATED } from "../helpers/webphone";
import { extractDomain, plugAudio } from "../helpers/webphone";
import env from "../config/config";

const SipEvents = ({
  phone,
  session,
  setInCall,
  setCallState,
  setRinging,
  start,
  stopTime,
  reset,
  setSession,
}) => {
  /**
 * SipEvente=> maneja la logica de sip.js. Para usarala es necesario pasar por props un objeto con las siguientes variables={
 *  phone, -> Se crea la el objeto UserAgent
    session, -> Maneja las sesiones de llamada
    setSession -> Setea la session
    setInCall, -> Booleano que establece el inicio de llamada
    setCallState, -> deprecado
    start, -> variable proveniente de Events (timer) - setea el inicio del cotador
    stopTime, -> Idem start - setea el fin del contador
    reset, -> Idem Start - resetea el contador al finalizar la llamada
    setRinging, -> Setea el inicio del sonido de llamada
 * }

    Retorna funciones={
      createPhone: Crea el objeto userAgent
      onConnect: Se connecta al crearse el objeto UserAgent y setear en phone
      onDial: Establece la coneccion al crearse la session
      dial: Da lugar al inicio de la llamada 
      hang: finaliza la session y la llamada
    }
*/

  return {
    createPhone(conf) {
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
    },
    onConnect() {
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
    },
    dial(e, dialCall) {
      e.preventDefault();
      phone.start().then(() => {
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
    },
    onDial() {
      session &&
        session.stateChange.addListener((newState) => {
          switch (newState) {
            case SessionState.Initial:

            case SessionState.Establishing:
              // Session is establishing
              setInCall(true);
              setRinging(true);
              setCallState("Calling");
              break;
            case SessionState.Established:
              // Session has been established
              start();
              setCallState(SE_ST_ACCEPTED);
              plugAudio(session.sessionDescriptionHandler.peerConnection);
              setRinging(false);
              break;
            case SessionState.Terminated:
              // Session has terminated
              setCallState(SE_ST_TERMINATED);
              setInCall(false);
              setRinging(false);
              setTimeout(() => {
                setCallState("");
              }, 3000);
              break;
            default:
              break;
          }
        });
    },
    hang(e) {
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
          stopTime();
          reset();
          session.bye();
          break;
        case SessionState.Terminating:
        case SessionState.Terminated:
          // Cannot terminate a session that is already terminated
          break;
      }
    },
  };
};

export default SipEvents;
