document.addEventListener('DOMContentLoaded', () => {
  const homeBrand = document.querySelector('.home-tag');
  if (homeBrand) homeBrand.textContent = 'instant memory';

  const $ = id => document.getElementById(id);

  const video = $('camera');
  const upload = $('uploadPreview');
  const canvas = $('workCanvas');
  const ctx = canvas.getContext('2d');

  const params = new URLSearchParams(location.search);
  const shots = Math.min(4, Math.max(3, Number(params.get('shots')) || 3));
  const initialLayout = params.get('layout') === 'grid' ? 'grid' : 'strip';
  const frame = params.get('frame') || 'classic';

  const themes = {
    classic: { bg: '#ffffff', text: '#333333' },
    pink: { bg: '#f8dce6', text: '#7d3651' },
    hearts: { bg: '#ffd5e4', text: '#c3316c' },
    dog: { bg: '#fff3dc', text: '#6f4e2f' },
    vintage: { bg: '#d8c6aa', text: '#594936' }
  };

  const theme = themes[frame] || themes.classic;

  const state = {
    stream: null,
    source: null,
    photos: [],
    mirror: true,
    flash: true,
    filter: 'none',
    busy: false
  };

  const edit = {
    layout: initialLayout,
    filter: 'none',
    bg: theme.bg,
    bgImage: '',
    photoShape: 'none',
    logo: 'ENG',
    stickerPlacement: 'face',
    stickers: [],
    selectedSticker: '',
    images: []
  };

  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

  const capturedList = $('capturedList');
  const capturedCount = $('capturedCount');

  function getCountdownTime() {
    const timerFromWindow = Number(window.selectedCountdownTime);
    const timerFromStorage = Number(localStorage.getItem('instantMemoryTimer'));

    if ([3, 5, 10].includes(timerFromWindow)) return timerFromWindow;
    if ([3, 5, 10].includes(timerFromStorage)) return timerFromStorage;

    return 3;
  }

  function renderCapturedSidebar(photoArray) {
    if (!capturedList || !capturedCount) return;

    const photos = Array.isArray(photoArray) ? photoArray : [];

    capturedCount.textContent = `${photos.length} ảnh`;

    if (photos.length === 0) {
      capturedList.innerHTML = `
        <div class="captured-empty">
          Chưa có ảnh nào
        </div>
      `;
      return;
    }

    capturedList.innerHTML = photos
      .map((photo, index) => {
        return `
          <div class="captured-item">
            <span class="captured-index">${index + 1}</span>
            <img src="${photo}" alt="Ảnh đã chụp ${index + 1}">
          </div>
        `;
      })
      .join('');
  }

  async function runCountdown() {
    const countdownElement = $('studioCountdown');
    let countdown = getCountdownTime();

    countdownElement.classList.add('show');
    countdownElement.textContent = countdown;

    while (countdown > 0) {
      countdownElement.textContent = countdown;
      await wait(1000);
      countdown--;
    }

    countdownElement.textContent = '';
    countdownElement.classList.remove('show');
  }

  $('progressCounter').textContent = `0 / ${shots}`;

  const stickerLibrary = document.querySelector('.sticker-library');

  if (stickerLibrary?.parentNode) {
    const stickerPlacement = document.createElement('div');
    stickerPlacement.className = 'sticker-placement';
    stickerPlacement.innerHTML = '<button type="button" data-sticker-placement="face" class="selected">Đặt lên khuôn mặt</button><button type="button" data-sticker-placement="frame">Đặt lên khung</button>';

    const stickerHint = document.createElement('p');
    stickerHint.className = 'editor-hint';
    stickerHint.textContent = 'Chọn nhãn dán để thêm ngay, hoặc bấm lên ảnh xem trước để đặt thêm ở vị trí tùy ý.';

    stickerLibrary.parentNode.insertBefore(stickerPlacement, stickerLibrary);
    stickerLibrary.parentNode.insertBefore(stickerHint, stickerLibrary);
  }

  function error(message) {
    $('studioError').textContent = message;
    $('studioError').style.display = message ? 'block' : 'none';
  }

  function ready() {
    return state.source && (state.source !== video || video.readyState >= 2);
  }

  function show(source) {
    state.source = source;
    $('studioEmpty').style.display = 'none';
    video.style.display = source === video ? 'block' : 'none';
    upload.style.display = source === upload ? 'block' : 'none';
    $('startBtn').disabled = false;
    updateLivePreview();
  }

  function updateLivePreview() {
    [video, upload].forEach(element => {
      if (!element) return;
      element.style.filter = state.filter;
      element.classList.toggle('mirrored', state.mirror);
    });
  }

  async function stopCamera() {
    if (state.stream) {
      state.stream.getTracks().forEach(track => track.stop());
    }

    state.stream = null;
  }

  async function startCamera(deviceId = '') {
    error('');

    if (!navigator.mediaDevices?.getUserMedia) {
      error('Không thể dùng camera tại đây. Hãy mở bằng localhost hoặc tải ảnh lên.');
      return;
    }

    try {
      await stopCamera();

      state.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          facingMode: deviceId ? undefined : 'user',
          width: { ideal: 1280 },
          height: { ideal: 960 }
        },
        audio: false
      });

      video.srcObject = state.stream;
      await video.play();
      show(video);

      const devices = (await navigator.mediaDevices.enumerateDevices())
        .filter(device => device.kind === 'videoinput');

      const select = $('cameraSelect');
      const oldValue = select.value;

      select.innerHTML = '<option value="">Camera mặc định</option>';

      devices.forEach((device, index) => {
        const option = document.createElement('option');
        option.value = device.deviceId;
        option.textContent = device.label || `Camera ${index + 1}`;
        select.append(option);
      });

      select.value = oldValue;
    } catch (cameraError) {
      error(
        cameraError.name === 'NotAllowedError'
          ? 'Quyền camera đã bị từ chối. Hãy cho phép camera hoặc tải ảnh lên.'
          : 'Không thể mở camera này. Hãy thử camera khác hoặc tải ảnh lên.'
      );
    }
  }

  function drawSource(source, width, height) {
    const sourceWidth = source.videoWidth || source.naturalWidth;
    const sourceHeight = source.videoHeight || source.naturalHeight;

    const scale = Math.max(width / sourceWidth, height / sourceHeight);
    const drawWidth = sourceWidth * scale;
    const drawHeight = sourceHeight * scale;

    ctx.save();
    ctx.filter = state.filter;

    if (state.mirror) {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(
      source,
      (width - drawWidth) / 2,
      (height - drawHeight) / 2,
      drawWidth,
      drawHeight
    );

    ctx.restore();
  }

  async function captureSequence() {
    if (!ready() || state.busy || state.photos.length >= shots) return;

    state.busy = true;
    $('startBtn').disabled = true;
    $('startBtn').textContent = 'Đang chụp...';

    try {
      while (state.photos.length < shots) {
        await runCountdown();

        if (state.flash) {
          $('studioFlash').classList.remove('active');
          void $('studioFlash').offsetWidth;
          $('studioFlash').classList.add('active');
        }

        canvas.width = 960;
        canvas.height = 720;

        drawSource(state.source, 960, 720);

        state.photos.push(canvas.toDataURL('image/jpeg', 0.92));
        renderCapturedSidebar(state.photos);

        $('progressCounter').textContent = `${state.photos.length} / ${shots}`;

        if (state.photos.length < shots) {
          await wait(1200);
        }
      }

      await showResult();
    } finally {
      state.busy = false;
      $('startBtn').textContent = 'Chụp ảnh';

      if (state.photos.length < shots) {
        $('startBtn').disabled = !ready();
      }
    }
  }

  function loadImage(source) {
    return new Promise(resolve => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.src = source;
    });
  }

  function drawOutputPhoto(image, x, y, width, height) {
    ctx.save();

    if (edit.photoShape !== 'none') {
      ctx.beginPath();

      if (edit.photoShape === 'circle') {
        const radius = Math.min(width, height) * 0.46;
        ctx.arc(x + width / 2, y + height / 2, radius, 0, Math.PI * 2);
      } else if (edit.photoShape === 'heart') {
        ctx.moveTo(x + width * 0.5, y + height * 0.92);
        ctx.bezierCurveTo(x - width * 0.08, y + height * 0.58, x + width * 0.02, y + height * 0.16, x + width * 0.26, y + height * 0.18);
        ctx.bezierCurveTo(x + width * 0.42, y + height * 0.18, x + width * 0.5, y + height * 0.36, x + width * 0.5, y + height * 0.36);
        ctx.bezierCurveTo(x + width * 0.5, y + height * 0.36, x + width * 0.58, y + height * 0.18, x + width * 0.74, y + height * 0.18);
        ctx.bezierCurveTo(x + width * 0.98, y + height * 0.16, x + width * 1.08, y + height * 0.58, x + width * 0.5, y + height * 0.92);
      } else {
        const inset = 10;
        const radius = 28;

        x += inset;
        y += inset;
        width -= inset * 2;
        height -= inset * 2;

        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
      }

      ctx.closePath();
      ctx.clip();
    }

    ctx.drawImage(image, x, y, width, height);
    ctx.restore();
  }

  async function renderResult() {
    if (!edit.images.length) {
      edit.images = await Promise.all(state.photos.map(loadImage));
    }

    const padding = 40;
    const gap = 18;
    const imageWidth = 720;
    const imageHeight = 540;
    const isGrid = edit.layout === 'grid';
    const width = padding * 2 + imageWidth;
    const rows = Math.ceil(shots / 2);
    const height = isGrid
      ? padding * 2 + rows * imageHeight + (rows - 1) * gap + 95
      : padding * 2 + shots * imageHeight + (shots - 1) * gap + 95;

    canvas.width = width;
    canvas.height = height;
    ctx.filter = 'none';

    if (edit.bgImage) {
      const backgroundImage = await loadImage(edit.bgImage);
      ctx.fillStyle = ctx.createPattern(backgroundImage, 'repeat');
    } else {
      ctx.fillStyle = edit.bg;
    }

    ctx.fillRect(0, 0, width, height);
    ctx.filter = edit.filter;

    edit.images.forEach((image, index) => {
      if (isGrid) {
        const cellWidth = (imageWidth - gap) / 2;

        drawOutputPhoto(
          image,
          padding + (index % 2) * (cellWidth + gap),
          padding + Math.floor(index / 2) * (imageHeight + gap),
          cellWidth,
          imageHeight
        );
      } else {
        drawOutputPhoto(
          image,
          padding,
          padding + index * (imageHeight + gap),
          imageWidth,
          imageHeight
        );
      }
    });

    ctx.filter = 'none';
    ctx.fillStyle = theme.text;
    ctx.textAlign = 'center';
    ctx.font = 'italic 700 38px Georgia';

    const logos = {
      ENG: 'instant memory',
      KOR: '\uc778\uc2a4\ud134\ud2b8 \uba54\ubaa8\ub9ac',
    
    };

    ctx.fillText(logos[edit.logo] || logos.ENG, width / 2, height - 38);

    if (frame === 'hearts') {
      ctx.font = '30px Georgia';
      ctx.fillText('\u2661   \u2661   \u2661', width / 2, height - 75);
    }

    edit.stickers.forEach(sticker => {
      ctx.save();
      ctx.font = `700 ${Math.round(Math.min(width, height) * 0.07)}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
      ctx.fillStyle = '#fa1172';
      ctx.shadowColor = 'rgba(255,255,255,.9)';
      ctx.shadowBlur = 8;
      ctx.fillText(sticker.value, sticker.x * width, sticker.y * height);
      ctx.restore();
    });

    const previewCanvas = canvas.cloneNode();
    previewCanvas.getContext('2d').drawImage(canvas, 0, 0);

    previewCanvas.addEventListener('click', event => {
      if (!edit.selectedSticker) return;

      const rect = previewCanvas.getBoundingClientRect();

      edit.stickers.push({
        value: edit.selectedSticker,
        x: (event.clientX - rect.left) / rect.width,
        y: (event.clientY - rect.top) / rect.height
      });

      renderResult();
    });

    $('photoPreview').replaceChildren(previewCanvas);
  }

  function renderPhotoOrder() {
    const holder = $('photoOrder');
    holder.replaceChildren();

    state.photos.forEach((photo, index) => {
      const item = document.createElement('div');
      item.className = 'order-item';

      const image = document.createElement('img');
      image.src = photo;
      image.alt = `Ảnh ${index + 1}`;

      const label = document.createElement('span');
      label.textContent = `Ảnh ${index + 1}`;

      const left = document.createElement('button');
      left.type = 'button';
      left.textContent = '\u2190';
      left.title = 'Chuyển về trước';
      left.disabled = index === 0;

      const right = document.createElement('button');
      right.type = 'button';
      right.textContent = '\u2192';
      right.title = 'Chuyển về sau';
      right.disabled = index === state.photos.length - 1;

      left.onclick = () => movePhoto(index, -1);
      right.onclick = () => movePhoto(index, 1);

      item.append(image, label, left, right);
      holder.append(item);
    });
  }

  function movePhoto(index, direction) {
    const target = index + direction;

    if (target < 0 || target >= state.photos.length) return;

    [state.photos[index], state.photos[target]] = [state.photos[target], state.photos[index]];
    [edit.images[index], edit.images[target]] = [edit.images[target], edit.images[index]];

    renderCapturedSidebar(state.photos);
    renderPhotoOrder();
    renderResult();
  }

  async function showResult() {
    edit.images = await Promise.all(state.photos.map(loadImage));
    $('resultLayout').value = edit.layout;
    $('resultFrameColor').value = edit.bg;

    renderPhotoOrder();
    await renderResult();

    $('studioView').style.display = 'none';
    $('resultPanel').classList.add('visible');
  }

  $('enableCamera').onclick = () => startCamera();
  $('cameraSelect').onchange = event => startCamera(event.target.value);
  $('startBtn').onclick = captureSequence;

  $('mirrorBtn').onclick = event => {
    state.mirror = !state.mirror;
    event.currentTarget.setAttribute('aria-pressed', state.mirror);
    updateLivePreview();
  };

  $('flashBtn').onclick = event => {
    state.flash = !state.flash;
    event.currentTarget.setAttribute('aria-pressed', state.flash);
  };

  document.querySelectorAll('[data-filter]').forEach(button => {
    button.onclick = () => {
      document.querySelectorAll('[data-filter]').forEach(item => item.classList.remove('active'));
      button.classList.add('active');
      state.filter = button.dataset.filter;
      updateLivePreview();
    };
  });

  $('uploadInput').onchange = event => {
    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      upload.onload = () => show(upload);
      upload.src = reader.result;
    };

    reader.readAsDataURL(file);
  };

  $('resultLayout').onchange = event => {
    edit.layout = event.target.value;
    renderResult();
  };

  $('resultFilter').onchange = event => {
    edit.filter = event.target.value;
    renderResult();
  };

  $('resultFrameColor').oninput = event => {
    edit.bg = event.target.value;
    edit.bgImage = '';
    document.querySelectorAll('[data-frame-color],[data-frame-pattern]').forEach(item => item.classList.remove('selected'));
    renderResult();
  };

  document.querySelectorAll('[data-frame-color]').forEach(button => {
    button.onclick = () => {
      document.querySelectorAll('[data-frame-color],[data-frame-pattern]').forEach(item => item.classList.remove('selected'));
      button.classList.add('selected');
      edit.bg = button.dataset.frameColor;
      edit.bgImage = '';
      $('resultFrameColor').value = edit.bg;
      renderResult();
    };
  });

  document.querySelectorAll('[data-frame-pattern]').forEach(button => {
    button.onclick = () => {
      document.querySelectorAll('[data-frame-color],[data-frame-pattern]').forEach(item => item.classList.remove('selected'));
      button.classList.add('selected');
      edit.bgImage = button.dataset.framePattern;
      renderResult();
    };
  });

  document.querySelectorAll('[data-photo-shape]').forEach(button => {
    button.onclick = () => {
      document.querySelectorAll('[data-photo-shape]').forEach(item => item.classList.remove('selected'));
      button.classList.add('selected');
      edit.photoShape = button.dataset.photoShape;
      renderResult();
    };
  });

  document.querySelectorAll('[data-sticker]').forEach(button => {
    button.onclick = () => {
      document.querySelectorAll('[data-sticker]').forEach(item => item.classList.remove('selected'));
      edit.selectedSticker = button.dataset.sticker;
      button.classList.add('selected');

      const automaticPosition = edit.stickerPlacement === 'frame'
        ? { x: 0.86, y: 0.94 }
        : { x: edit.layout === 'grid' ? 0.25 : 0.5, y: 0.16 };

      edit.stickers.push({
        value: edit.selectedSticker,
        x: automaticPosition.x,
        y: automaticPosition.y
      });

      renderResult();
    };
  });

  document.querySelectorAll('[data-sticker-placement]').forEach(button => {
    button.onclick = () => {
      document.querySelectorAll('[data-sticker-placement]').forEach(item => item.classList.remove('selected'));
      button.classList.add('selected');
      edit.stickerPlacement = button.dataset.stickerPlacement;
    };
  });

  $('undoSticker').onclick = () => {
    edit.stickers.pop();
    renderResult();
  };

  $('clearStickers').onclick = () => {
    edit.stickers = [];
    renderResult();
  };

  document.querySelectorAll('[data-logo]').forEach(button => {
    button.onclick = () => {
      document.querySelectorAll('[data-logo]').forEach(item => item.classList.remove('selected'));
      button.classList.add('selected');
      edit.logo = button.dataset.logo;
      renderResult();
    };
  });

  $('retakeBtn').onclick = () => {
    state.photos = [];
    edit.images = [];
    edit.stickers = [];

    renderCapturedSidebar([]);

    $('progressCounter').textContent = `0 / ${shots}`;
    $('resultPanel').classList.remove('visible');
    $('studioView').style.display = '';
    $('startBtn').disabled = !ready();
  };

  async function canvasToBlob(type = 'image/png') {
  return new Promise(resolve => {
    canvas.toBlob(blob => resolve(blob), type);
  });
}

async function shareFinalImage() {
  if (!state.photos.length) {
    alert('Bạn cần chụp ảnh trước khi chia sẻ.');
    return;
  }

  await renderResult();

  const blob = await canvasToBlob('image/png');

  if (!blob) {
    alert('Không thể tạo ảnh để chia sẻ.');
    return;
  }

  const file = new File(
    [blob],
    `instant-memory-${new Date().toISOString().slice(0, 10)}.png`,
    { type: 'image/png' }
  );

  try {
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: 'Instant Memory',
        text: 'Ảnh photobooth của tôi từ Instant Memory ♡',
        files: [file]
      });
    } else if (navigator.share) {
      await navigator.share({
        title: 'Instant Memory',
        text: 'Instant Memory Photobooth ♡',
        url: window.location.href
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('Trình duyệt chưa hỗ trợ Share. Link trang đã được copy.');
    }
  } catch (shareError) {
    console.log(shareError);
  }
}

function drawGifFrame(targetCtx, image, width, height) {
  targetCtx.clearRect(0, 0, width, height);
  targetCtx.fillStyle = '#ffffff';
  targetCtx.fillRect(0, 0, width, height);

  const scale = Math.max(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;

  targetCtx.drawImage(
    image,
    (width - drawWidth) / 2,
    (height - drawHeight) / 2,
    drawWidth,
    drawHeight
  );
}

async function downloadGifImage() {
  if (!state.photos.length) {
    alert('Bạn cần chụp ảnh trước khi tải GIF.');
    return;
  }

  if (!window.GIF) {
    alert('Chưa tải được thư viện GIF. Hãy kiểm tra kết nối mạng hoặc đường dẫn CDN.');
    return;
  }

  const gifButton = $('downloadGifBtn');
  const oldText = gifButton ? gifButton.textContent : '';

  if (gifButton) {
    gifButton.disabled = true;
    gifButton.textContent = 'Đang tạo GIF...';
  }

  const gif = new GIF({
    workers: 2,
    quality: 10,
    width: 720,
    height: 540,
    workerScript: window.GIF_WORKER_SCRIPT
  });

  const gifCanvas = document.createElement('canvas');
  gifCanvas.width = 720;
  gifCanvas.height = 540;

  const gifCtx = gifCanvas.getContext('2d');
  const gifImages = await Promise.all(state.photos.map(loadImage));

  gifImages.forEach(image => {
    drawGifFrame(gifCtx, image, gifCanvas.width, gifCanvas.height);
    gif.addFrame(gifCtx, {
      copy: true,
      delay: 850
    });
  });

  gif.on('finished', blob => {
    const link = document.createElement('a');
    link.download = `instant-memory-${new Date().toISOString().slice(0, 10)}.gif`;
    link.href = URL.createObjectURL(blob);
    link.click();

    setTimeout(() => URL.revokeObjectURL(link.href), 1000);

    if (gifButton) {
      gifButton.disabled = false;
      gifButton.textContent = oldText || 'Tải GIF';
    }
  });

  gif.render();
}

async function uploadImageToCloudinary(blob) {
  const CLOUDINARY_CLOUD_NAME = "di5fc49d2";
  const CLOUDINARY_UPLOAD_PRESET = "photobooth_upload";

  const formData = new FormData();
  formData.append("file", blob);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", "instant-memory");

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("Cloudinary error:", data);
    throw new Error(data.error?.message || "Upload ảnh thất bại");
  }

  return data.secure_url;
}

async function createQrCode() {
  const qrBox = $('qrBox');
  const qrCode = $('qrCode');

  if (!qrBox || !qrCode) return;

  if (!state.photos.length) {
    alert('Bạn cần chụp ảnh trước khi tạo QR.');
    return;
  }

  if (!window.QRCode) {
    alert('Chưa tải được thư viện QR.');
    return;
  }

  try {
    await renderResult();

    qrBox.hidden = false;
    qrCode.innerHTML = '<p style="font-weight:800;color:#ff2f7d;">Đang upload ảnh...</p>';

    const blob = await new Promise(resolve => {
      canvas.toBlob(resolve, 'image/jpeg', 0.9);
    });

    if (!blob) {
      alert('Không thể tạo ảnh.');
      return;
    }

    const imageUrl = await uploadImageToCloudinary(blob);

    qrCode.innerHTML = '';

    new QRCode(qrCode, {
      text: imageUrl,
      width: 220,
      height: 220,
      colorDark: '#111111',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });

    const qrText = qrBox.querySelector('p');

    if (qrText) {
      qrText.innerHTML = `
        Quét mã QR để mở ảnh đã chụp.<br>
        Sau đó giữ ảnh để tải về máy.
      `;
    }

    qrBox.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  } catch (err) {
    console.error(err);
    alert('Không thể tạo QR tải ảnh. Kiểm tra lại Cloudinary upload preset.');
  }
}

const shareBtn = $('shareBtn');
const downloadGifBtn = $('downloadGifBtn');
const qrBtn = $('qrBtn');

if (shareBtn) {
  shareBtn.onclick = shareFinalImage;
}

if (downloadGifBtn) {
  downloadGifBtn.onclick = downloadGifImage;
}

if (qrBtn) {
  qrBtn.onclick = createQrCode;
}

$('downloadBtn').onclick = () => {
  const link = document.createElement('a');
  link.download = `instant-memory-${new Date().toISOString().slice(0, 10)}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
};

renderCapturedSidebar([]);

window.addEventListener('beforeunload', stopCamera);
});