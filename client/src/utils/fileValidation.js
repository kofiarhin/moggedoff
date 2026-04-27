import {
  ACCEPTED_IMAGE_EXTENSIONS,
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_IMAGE_SIZE_MB,
} from '../constants/constants'

function getExtension(fileName = '') {
  const dotIndex = fileName.lastIndexOf('.')
  return dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : ''
}

export function validateImageFile(file) {
  if (!file) {
    return {
      valid: false,
      code: 'REQUIRED',
      message: 'Choose an image before analyzing.',
    }
  }

  const fileType = file.type?.toLowerCase()
  const extension = getExtension(file.name)
  const hasAcceptedType = ACCEPTED_IMAGE_TYPES.includes(fileType)
  const hasAcceptedExtension = ACCEPTED_IMAGE_EXTENSIONS.includes(extension)
  const hasAmbiguousMobileType = !fileType || fileType === 'application/octet-stream'

  if (!hasAcceptedType && !hasAcceptedExtension && !hasAmbiguousMobileType) {
    return {
      valid: false,
      code: 'INVALID_FILE_TYPE',
      message: 'Use a valid image file.',
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
