import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { FETCH } from "../../../utils";

export default function UserRollCall({ room_id, user_token, setRollCall }) {
  const [scanning, setScanning] = useState("SCANNING FROM VIDEO STREAM");
  const video = useRef();

  function getQrFromElement(element, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(element, 0, 0, width, height);
    const imgData = ctx.getImageData(0, 0, width, height);
    const code = jsQR(imgData.data, imgData.width, imgData.height, { inversionAttempts: "dontInvert" });
    return code;
  }

  function scanQrFromVideo() {
    if (!video.current) return requestAnimationFrame(scanQrFromVideo);
    const code = getQrFromElement(video.current, video.current.videoWidth, video.current.videoHeight);
    if (!code || !code.data) return requestAnimationFrame(scanQrFromVideo);
    sendQrCheck(code.data)
      .then(res => {
        if (res.response === "fail") throw res.message;
        setRollCall(pre => {
          pre.attended = true;
          return { ...pre };
        })
      })
      .catch(err => {
        setScanning(err);
        requestAnimationFrame(scanQrFromVideo);
      })
  }

  function scanQrFromFile(e) {
    const input = e.target;
    input.disabled = true;
    const img = new Image();
    img.src = URL.createObjectURL(e.target.files[0]);
    setScanning("SCANNING FOR QR IN IMAGE");
    img.onload = () => {
      const code = getQrFromElement(img, img.width, img.height);
      if (!code) {
        setScanning("QRCODE NOT FOUND IN IMAGE");
        input.disabled = false;
        return;
      }
      input.disabled = false;
      sendQrCheck(code.data)
        .then(res => {
          if (res.response === "fail") throw res.message;
          setRollCall(pre => {
            pre.attended = true;
            return { ...pre };
          })
        })
        .catch(err => {
          setScanning(err);
          input.disabled = false;
        })
    }
  }

  function sendQrCheck(code) {
    setScanning("SENDING CODE TO SERVER");
    return FETCH(`/rollcall/scan/${room_id}/${code}`, "GET", user_token, null);
  }


  useEffect(() => {
    let video_stream = null;
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        video_stream = stream;
        video.current.srcObject = stream;
        video.current.onloadedmetadata = () => {
          video.current.play();
          window.requestAnimationFrame(scanQrFromVideo);
        }
      })

    return () => {
      video_stream?.getTracks().forEach(track => track.stop())
      const number = window.requestAnimationFrame(() => { });
      window.cancelAnimationFrame(number);
    }
  }, [])


  return (
    <>
      <p className='scanned-text' >{scanning} &nbsp;</p>
      <video src="" className='video-scanning-stream' ref={video}></video>
      <p className='video-or-image'>or</p>
      <label className='default-button choose-image' placeholder='Choose image' >
        <p>Scan from Image</p>
        <input className='input-file-for-qr' onChange={scanQrFromFile} type="file" />
      </label>
    </>
  )
}