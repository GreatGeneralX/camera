const preview = document.querySelector('#preview');
const canvas = document.querySelector('#canvas');
const message = document.querySelector('#message');
const controls = document.querySelector('.controls');
const gallery = document.querySelector('#gallery');
const dialog = document.querySelector('#photo-dialog');
const photo = document.querySelector('#captured-photo');
const installButton = document.querySelector('#install');
const installDialog = document.querySelector('#install-dialog');
const installInstructions = document.querySelector('#install-instructions');

let stream;
let facingMode = 'environment';
let imageBlob;
let imageUrl;
let deferredInstallPrompt;

const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

installButton.hidden = isStandalone;
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
});
window.addEventListener('appinstalled', () => { installButton.hidden = true; });

async function installApp() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    const choice = await deferredInstallPrompt.userChoice;
    if (choice.outcome === 'accepted') installButton.hidden = true;
    deferredInstallPrompt = undefined;
    return;
  }
  installInstructions.textContent = isIOS
    ? 'Safari下部の共有ボタンを押し、「ホーム画面に追加」を選んでください。'
    : 'ブラウザのメニューから「ホーム画面に追加」または「アプリをインストール」を選んでください。';
  installDialog.showModal();
}

async function startCamera() {
  stopCamera();
  message.textContent = '';
  message.hidden = true;
  controls.hidden = false;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: facingMode } },
      audio: false,
    });
    preview.srcObject = stream;
    preview.classList.toggle('is-selfie', facingMode === 'user');
    await preview.play();
  } catch (error) {
    controls.hidden = true;
    message.hidden = false;
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
  // Match the saved frame to the visible `object-fit: cover` preview.
  const scale = Math.max(
    preview.clientWidth / preview.videoWidth,
    preview.clientHeight / preview.videoHeight,
  );
  const sourceWidth = preview.clientWidth / scale;
  const sourceHeight = preview.clientHeight / scale;
  const sourceX = (preview.videoWidth - sourceWidth) / 2;
  const sourceY = (preview.videoHeight - sourceHeight) / 2;
  canvas.width = Math.round(sourceWidth);
  canvas.height = Math.round(sourceHeight);
  const context = canvas.getContext('2d');
  if (facingMode === 'user') {
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
  }
  context.drawImage(
    preview,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    canvas.width,
    canvas.height,
  );
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

document.querySelector('#flip').addEventListener('click', () => { facingMode = facingMode === 'environment' ? 'user' : 'environment'; startCamera(); });
document.querySelector('#shutter').addEventListener('click', capture);
gallery.addEventListener('click', () => dialog.showModal());
document.querySelector('#retake').addEventListener('click', () => dialog.close());
document.querySelector('#save').addEventListener('click', savePhoto);
installButton.addEventListener('click', installApp);
document.querySelector('#close-install').addEventListener('click', () => installDialog.close());
window.addEventListener('pagehide', stopCamera);
startCamera();
