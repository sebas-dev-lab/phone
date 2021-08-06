/*  
CONSTANTS

*/
export const PH_ST_DISCONNECTED = "disconnected";
export const PH_ST_REGISTRATIONFAILED = "registrationFailed";
export const PH_ST_UNREGISTERED = "unregistered";
export const PH_ST_CONNECTED = "connected";
export const PH_ST_REGISTERED = "registered";
/*  */
export const SE_ST_PROGRESS = "progress";
export const SE_ST_ACCEPTED = "accepted";
export const SE_ST_CANCELED = "canceled";
export const SE_ST_TERMINATED = "terminated";
export const SE_ST_FAILED = "failed";
export const SE_ST_REJECTED = "rejected";
export const SE_ST_BYE = "bye";
export const SE_ST_DTMF = "dtmf";

/*
    AUXILIAR FUNCTIONS
*/
export const extractDomain = function (url) {
  let domain;
  if (url.indexOf("://") > -1) {
    domain = url.split("/")[2];
  } else {
    domain = url.split("/")[0];
  }
  return domain.split(":")[0];
};

export const plugAudio = function (pc) {
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
};
