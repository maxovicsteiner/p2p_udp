const localFrame = document.getElementById("local");
const remoteFrame = document.getElementById("remote");

async function getLocalStream() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    return stream;
  } catch (error) {
    alert(`You need to grant permission`);
    return undefined;
  }
}

async function main() {
  try {
    const localStream = await getLocalStream();
    if (!localStream) throw new Error("Failed to get video stream");
    localFrame.srcObject = localStream;
  } catch (e) {
    alert(e.message);
  }
}

main();

ipc.onReady((_val) => {
  startStreaming();
});

ipc.onData((buf) => {
  remoteFrame.src = buf;
});

function startStreaming() {
  // capture
  const virtualCanvas = document.createElement("canvas");
  const virtualCtx = virtualCanvas.getContext("2d", {
    willReadFrequently: true,
  });
  const sendImageData = function () {
    virtualCtx.drawImage(
      localFrame,
      0,
      0,
      virtualCanvas.width,
      virtualCanvas.height
    );
    const imageData = virtualCanvas.toDataURL("image/jpeg");
    ipc.sendData(imageData);
    requestAnimationFrame(sendImageData);
  };
  requestAnimationFrame(sendImageData);
}
