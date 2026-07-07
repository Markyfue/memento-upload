const CLOUD_NAME    = 'fn6bhpgq';
const UPLOAD_PRESET = 'Memento';

const fileInput  = document.getElementById('fileInput');
const selectBtn  = document.getElementById('selectBtn');
const uploadBtn  = document.getElementById('uploadBtn');
const previewImg = document.getElementById('previewImg');
const placeholder = document.getElementById('placeholder');
const status     = document.getElementById('status');
const successBox = document.getElementById('successBox');
const anotherBtn = document.getElementById('anotherBtn');

let selectedFile = null;

selectBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (!file) return;
  selectedFile = file;

  const reader = new FileReader();
  reader.onload = (e) => {
    previewImg.src = e.target.result;
    previewImg.style.display = 'block';
    placeholder.style.display = 'none';
  };
  reader.readAsDataURL(file);

  uploadBtn.disabled = false;
  status.textContent = '';
  status.className = 'status';
});

uploadBtn.addEventListener('click', async () => {
  if (!selectedFile) return;

  uploadBtn.disabled = true;
  uploadBtn.textContent = 'Uploading...';
  status.textContent = '';

  const formData = new FormData();
  formData.append('file', selectedFile);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', 'memento-photos');

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

    if (data.secure_url) {
      document.getElementById('uploadBox').style.display = 'none';
      successBox.style.display = 'flex';
      successBox.style.flexDirection = 'column';
      successBox.style.alignItems = 'center';
    } else {
      throw new Error(data.error?.message || 'Upload failed');
    }
  } catch (err) {
    status.textContent = 'Upload failed. Please try again.';
    status.className = 'status error';
    uploadBtn.disabled = false;
    uploadBtn.textContent = 'Upload to Memento';
  }
});

anotherBtn.addEventListener('click', () => {
  selectedFile = null;
  fileInput.value = '';
  previewImg.style.display = 'none';
  previewImg.src = '';
  placeholder.style.display = 'flex';
  uploadBtn.disabled = true;
  uploadBtn.textContent = 'Upload to Memento';
  status.textContent = '';
  status.className = 'status';
  successBox.style.display = 'none';
  document.getElementById('uploadBox').style.display = 'flex';
});