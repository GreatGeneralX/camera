const preview = document.querySelector('#preview');
const canvas = document.querySelector('#canvas');
const permission = document.querySelector('#permission');
const message = document.querySelector('#message');
const topbar = document.querySelector('.topbar');
const controls = document.querySelector('.controls');
const cameraName = document.querySelector('#camera-name');
const gallery = document.querySelector('#gallery');
const dialog = document.querySelector('#photo-dialog');
const photo = document.querySelector('#captured-photo');

let stream;
let facingMode = 'environment';
let imageBlob;
let imageUrl;

async function startCamera() {
  stopCamera();
  message.textContent = '';
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: facingMode }, width: { ideal: 4032 }, height: { ideal: 3024 } },
      audio: false,
    });
    preview.srcObject = stream;
    permission.hidden = true;
    topbar.hidden = controls.hidden = false;
    cameraName.textContent = facingMode === 'environment' ? '背面カメラ' : '前面カメラ';
  } catch (error) {
    message.textContent = 'カメラを利用できません。ブラウザの権限を確認してください。';
    console.error(error);
  }
}

function stopCamera() {
  stream?.getTracks().forEach((track) => track.stop());
  stream = undefined;
}

function capture() {
  if (!preview.videoWidth) return;
  canvas.width = preview.videoWidth;
  canvas.height = preview.videoHeight;
  canvas.getContext('2d').drawImage(preview, 0, 0);
  canvas.toBlob((blob) => {
    if (!blob) return;
    imageBlob = blob;
    URL.revokeObjectURL(imageUrl);
    imageUrl = URL.createObjectURL(blob);
    photo.src = imageUrl;
    gallery.style.backgroundImage = `url(${imageUrl})`;
    gallery.disabled = false;
    dialog.showModal();
  }, 'image/jpeg', .95);
}

async function savePhoto() {
  const file = new File([imageBlob], `photo-${new Date().toISOString().replace(/[:.]/g, '-')}.jpg`, { type: 'image/jpeg' });
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: '写真' });
  } else {
    const link = Object.assign(document.createElement('a'), { href: imageUrl, download: file.name });
    link.click();
  }
}

document.querySelector('#start').addEventListener('click', startCamera);
document.querySelector('#flip').addEventListener('click', () => { facingMode = facingMode === 'environment' ? 'user' : 'environment'; startCamera(); });
document.querySelector('#close').addEventListener('click', () => { stopCamera(); permission.hidden = false; topbar.hidden = controls.hidden = true; });
document.querySelector('#shutter').addEventListener('click', capture);
gallery.addEventListener('click', () => dialog.showModal());
document.querySelector('#retake').addEventListener('click', () => dialog.close());
document.querySelector('#save').addEventListener('click', savePhoto);
window.addEventListener('pagehide', stopCamera);
