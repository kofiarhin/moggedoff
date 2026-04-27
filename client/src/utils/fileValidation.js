import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_IMAGE_SIZE_MB,
} from '../constants/constants'

export function validateImageFile(file) {
  if (!file) {
    return {
      valid: false,
      code: 'REQUIRED',
      message: 'Choose an image before analyzing.',
    }
  }

  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      code: 'INVALID_FILE_TYPE',
      message: 'Use a JPEG, PNG, or WEBP image.',
    }
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      valid: false,
      code: 'FILE_TOO_LARGE',
      message: `Keep each image under ${MAX_IMAGE_SIZE_MB} MB.`,
    }
  }

  return {
    valid: true,
    code: null,
    message: '',
  }
}
