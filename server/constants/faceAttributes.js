const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'image/avif',
  'image/gif',
  'image/bmp',
  'image/x-ms-bmp',
];

const ACCEPTED_IMAGE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.heic',
  '.heif',
  '.avif',
  '.gif',
  '.bmp',
];

const FACE_DETECT_ATTRIBUTES = [
  'headPose',
  'glasses',
  'occlusion',
  'qualityForRecognition',
  'blur',
  'exposure',
  'noise',
];

module.exports = {
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_IMAGE_EXTENSIONS,
  FACE_DETECT_ATTRIBUTES,
};
