import React from "react";
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
  SE_ST_FAILED,
  SE_ST_REJECTED,
  SE_ST_BYE,
  SE_ST_DTMF,
} from "../../helpers/phone";

class ClassPhone extends React.Component {
  audioRef = React.createRef();

  constructor({
    sipServer,
    authorizationUser,
    password,
    displayName,
    userAgentString,
    stunServers,
    logLevel,
    avatar,
    number,
  }) {
    super({
      sipServer,
      authorizationUser,
      password,
      displayName,
      userAgentString,
      stunServers,
      logLevel,
      avatar,
      number,
    });
    this.phone = null;
    this.session = null;
    this.inCall = false;
    this.state = "Iniciando";
    this.callState = "";
    this.original_avatar = "";

    this.createPhone = this.createPhone.bind(this);
    this.dial = this.dial.bind(this);
    this.dial = this.dial.bind(this);
    this.hang = this.hang.bind(this);
    this.extractDomain = this.extractDomain.bind(this);
    this.plugAudio = this.plugAudio.bind(this);
    this.log = this.log.bind(this);
  }

  focus() {
    this.audioRef.current.focus();
  }

  componentDidMount() {
    this.original_avatar = this.avatar;
    // this.audioRef.loop = true;

    this.phone = this.createPhone({
      sipServer: this.sipServer,
      authorizationUser: this.authorizationUser,
      password: this.password,
      displayName: this.displayName,
      userAgentString: this.userAgentString,
      stunServers: this.stunServers,
      logLevel: this.logLevel,
    });

    this.phone.on(PH_ST_CONNECTED, (e) => {
      this.log(PH_ST_CONNECTED, e);
      this.setState(PH_ST_CONNECTED);
    });

    this.phone.on(PH_ST_DISCONNECTED, (e) => {
      this.log(PH_ST_CONNECTED, e);
      this.setState(PH_ST_DISCONNECTED);
    });

    this.phone.on(PH_ST_REGISTRATIONFAILED, (e) => {
      this.log(PH_ST_CONNECTED, e);
      this.setState(PH_ST_REGISTRATIONFAILED);
    });

    this.phone.on(PH_ST_UNREGISTERED, (e) => {
      this.log(PH_ST_CONNECTED, e);
      this.setState(PH_ST_UNREGISTERED);
    });

    this.phone.on(PH_ST_REGISTERED, (e) => {
      this.log(PH_ST_CONNECTED, e);
      this.setState(PH_ST_REGISTERED);
    });
  }

  componentWillUnmount() {
    // this.phone.unregister();
  }

  dial(dialCall) {
    this.log("Dial", dialCall);

    this.session = this.phone.invite(dialCall);
    this.inCall = true;
    this.callState = "Calling";
    this.audioRef.play();

    this.session.on(SE_ST_PROGRESS, (e) => {
      this.log(SE_ST_PROGRESS, e);
    });

    this.session.on(SE_ST_ACCEPTED, (e) => {
      this.log(SE_ST_ACCEPTED, e);
      this.plugAudio(this.session.sessionDescriptionHandler.peerConnection);
      this.callState = SE_ST_ACCEPTED;
      this.audioRef.pause();
    });

    this.session.on(SE_ST_CANCELED, (e) => {
      this.log(SE_ST_CANCELED, e);
      this.inCall = false;
      this.callState = SE_ST_CANCELED;
      this.audioRef.pause();
      this.setOriginalAvatar();
    });

    this.session.on(SE_ST_TERMINATED, () => {
      this.log(SE_ST_TERMINATED);
      this.inCall = false;
      this.callState = SE_ST_TERMINATED;
      this.audioRef.pause();
      setTimeout(() => {
        this.callState = "";
      }, 3000);
    });

    this.session.on(SE_ST_FAILED, (e) => {
      this.log(SE_ST_FAILED, e);
      this.inCall = false;
      this.callState = SE_ST_FAILED;
      this.setOriginalAvatar();
    });

    this.session.on(SE_ST_REJECTED, (e) => {
      this.log(SE_ST_REJECTED, e);
      this.inCall = false;
      this.callState = SE_ST_REJECTED;
      this.setOriginalAvatar();
    });

    this.session.on(SE_ST_BYE, (e) => {
      this.log(SE_ST_BYE, e);
    });

    this.session.on(SE_ST_DTMF, (e) => {
      this.log(SE_ST_DTMF, e);
    });
  }

  hang() {
    this.session.terminate();
  }

  extractDomain(url) {
    let domain;
    if (url.indexOf("://") > -1) {
      domain = url.split("/")[2];
    } else {
      domain = url.split("/")[0];
    }
    return domain.split(":")[0];
  }

  plugAudio(pc) {
    const voice = new Audio();
    if (pc.getReceivers) {
      const stream = new window.MediaStream();
      pc.getReceivers().forEach(function (receiver) {
        if (receiver.track) {
          stream.addTrack(receiver.track);
        }
      });
      voice.srcObject = stream;
    } else {
      voice.srcObject = pc.getRemoteStreams()[0];
    }
    voice.play();
  }

  log(...args) {
    if (this.logLevel > 0) console.log(args);
  }

  createPhone(conf) {
    /* eslint-disable */
    return new SIP.UA({
      password: conf.password,
      authorizationUser: conf.authorizationUser,
      displayName: conf.displayName,
      userAgentString: conf.userAgentString,
      uri:
        "sip:" +
        conf.authorizationUser +
        "@" +
        this.extractDomain(conf.sipServer),
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
  }

  render() {
    return (
      <div>
        {this.inCall ? (
          <button
            onClick={(e) => hang(e)}
            className={
              this.inCall ? "call-hang-active" : "SocialSharing__link call-hang"
            }
          >
            <i className="fas fa-phone"></i>
          </button>
        ) : (
          <button
            onClick={(e) => dial()}
            className="SocialSharing__link call-dial is-animating"
          >
            <i className="fas fa-phone"></i>
          </button>
        )}

        <audio
          src="@/assets/sounds/ringing.mp3"
          ref={(input) => {
            this.audioRef = input;
          }}
          style={{ display: "none" }}
        ></audio>
      </div>
    );
  }
}

export default ClassPhone;
