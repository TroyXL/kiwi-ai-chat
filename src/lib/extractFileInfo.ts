import { nanoid } from 'nanoid'

const MIME_TYPE_MAP: Record<string, string> = {
  txt: 'text/plain',
  pdf: 'application/pdf',
  rtf: 'application/rtf',
  csv: 'text/csv',
  html: 'text/html',
  css: 'text/css',
  md: 'text/markdown',
  markdown: 'text/markdown',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  odt: 'application/vnd.oasis.opendocument.text',
  ods: 'application/vnd.oasis.opendocument.spreadsheet',
  odp: 'application/vnd.oasis.opendocument.presentation',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  bmp: 'image/bmp',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  ico: 'image/vnd.microsoft.icon',
  tif: 'image/tiff',
  tiff: 'image/tiff',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  aac: 'audio/aac',
  weba: 'audio/webm',
  flac: 'audio/flac',
  mp4: 'video/mp4',
  mov: 'video/quicktime',
  avi: 'video/x-msvideo',
  wmv: 'video/x-ms-wmv',
  webm: 'video/webm',
  mkv: 'video/x-matroska',
  zip: 'application/zip',
  rar: 'application/vnd.rar',
  '7z': 'application/x-7z-compressed',
  tar: 'application/x-tar',
  gz: 'application/gzip',
  json: 'application/json',
  xml: 'application/xml',
  js: 'text/javascript',
  ts: 'text/typescript',
  ttf: 'font/ttf',
  otf: 'font/otf',
  woff: 'font/woff',
  woff2: 'font/woff2',
  ics: 'text/calendar',
  vcf: 'text/vcard',
  epub: 'application/epub+zip',
  key: 'application/vnd.apple.keynote',
  pages: 'application/vnd.apple.pages',
  numbers: 'application/vnd.apple.numbers',
}

const UNIQUE_ID_LENGTH = 32
const HEX_ID_REGEX = /^[a-f0-9]{32}$/i

export default function extractFileInfo(fileUrlOrPath: string): FileInfo {
  const id = nanoid()
  const url = new URL(fileUrlOrPath, import.meta.env.VITE_API_BASE_URL)
  try {
    const storedFileName = url.pathname.split('/').pop()

    if (storedFileName) {
      const lastDotIndex = storedFileName.lastIndexOf('.')

      if (lastDotIndex > 0) {
        const nameAndId = storedFileName.substring(0, lastDotIndex)
        const extension = storedFileName.substring(lastDotIndex + 1)

        if (nameAndId.length > UNIQUE_ID_LENGTH) {
          const potentialId = nameAndId.substring(
            nameAndId.length - UNIQUE_ID_LENGTH
          )
          const separator = nameAndId.charAt(
            nameAndId.length - UNIQUE_ID_LENGTH - 1
          )

          if (separator === '-' && HEX_ID_REGEX.test(potentialId)) {
            const sanitizedBaseName = nameAndId.substring(
              0,
              nameAndId.length - UNIQUE_ID_LENGTH - 1
            )

            const fileName = `${sanitizedBaseName}.${extension}`
            const contentType =
              MIME_TYPE_MAP[extension.toLowerCase()] ||
              'application/octet-stream'

            return { id, fileName, contentType, url: url.href }
          }
        }
      }
    }
  } catch {
    //
  }

  let lastSegment = fileUrlOrPath.substring(fileUrlOrPath.lastIndexOf('/') + 1)
  const queryIndex = lastSegment.indexOf('?')
  if (queryIndex > -1) {
    lastSegment = lastSegment.substring(0, queryIndex)
  }

  return {
    id,
    fileName: lastSegment,
    contentType: 'application/octet-stream',
    url: url.toString(),
  }
}
