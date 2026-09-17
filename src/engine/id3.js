/**
 * ID3 Metadata Parser and Dynamic Track Discovery
 * Extracts Title (TIT2/TT2) and Artist (TPE1/TP1) from MP3 files.
 */

export function parseID3FromBytes(bytes) {
  if (!bytes || bytes.length < 10) return {};

  // Check ID3v2 header
  if (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
    const version = bytes[3]; // 2 = 2.2, 3 = 2.3, 4 = 2.4
    const tagSize = (bytes[6] << 21) | (bytes[7] << 14) | (bytes[8] << 7) | bytes[9];
    let pos = 10;
    let title = null;
    let author = null;

    function decodeText(sub, encoding) {
      try {
        if (encoding === 0) {
          return new TextDecoder("latin1").decode(sub).replace(/\0/g, "").trim();
        } else if (encoding === 1 || encoding === 2) {
          return new TextDecoder("utf-16").decode(sub).replace(/\0/g, "").trim();
        } else if (encoding === 3) {
          return new TextDecoder("utf-8").decode(sub).replace(/\0/g, "").trim();
        }
      } catch (e) {}
      return "";
    }

    if (version === 2) {
      // ID3v2.2
      while (pos < tagSize + 10 && pos < bytes.length - 6) {
        const id = String.fromCharCode(bytes[pos], bytes[pos + 1], bytes[pos + 2]);
        if (!/^[A-Z0-9]{3}$/.test(id)) break;
        const size = (bytes[pos + 3] << 16) | (bytes[pos + 4] << 8) | bytes[pos + 5];
        if (size <= 0 || pos + 6 + size > bytes.length) break;
        const encoding = bytes[pos + 6];
        const val = decodeText(bytes.subarray(pos + 7, pos + 6 + size), encoding);
        if (id === "TT2" && val) title = val;
        if (id === "TP1" && val) author = val;
        pos += 6 + size;
      }
    } else {
      // ID3v2.3 / ID3v2.4
      while (pos < tagSize + 10 && pos < bytes.length - 10) {
        const id = String.fromCharCode(bytes[pos], bytes[pos + 1], bytes[pos + 2], bytes[pos + 3]);
        if (!/^[A-Z0-9]{4}$/.test(id)) break;
        let size;
        if (version === 4) {
          size = (bytes[pos + 4] << 21) | (bytes[pos + 5] << 14) | (bytes[pos + 6] << 7) | bytes[pos + 7];
        } else {
          size = (bytes[pos + 4] << 24) | (bytes[pos + 5] << 16) | (bytes[pos + 6] << 8) | bytes[pos + 7];
        }
        if (size <= 0 || pos + 10 + size > bytes.length) break;
        const encoding = bytes[pos + 10];
        const val = decodeText(bytes.subarray(pos + 11, pos + 10 + size), encoding);
        if (id === "TIT2" && val) title = val;
        if (id === "TPE1" && val) author = val;
        pos += 10 + size;
      }
    }

    if (title || author) {
      return { title, author };
    }
  }

  // Fallback ID3v1 check at end if buffer >= 128 bytes
  if (bytes.length >= 128) {
    const end = bytes.subarray(bytes.length - 128);
    if (end[0] === 0x54 && end[1] === 0x41 && end[2] === 0x47) { // 'TAG'
      const title = new TextDecoder("latin1").decode(end.subarray(3, 33)).replace(/\0/g, "").trim();
      const author = new TextDecoder("latin1").decode(end.subarray(33, 63)).replace(/\0/g, "").trim();
      return { title: title || null, author: author || null };
    }
  }

  return {};
}

/**
 * Fetch and extract metadata from an MP3 track source URL.
 * Only reads the first chunk (up to 64KB) to avoid downloading full audio.
 */
export async function enrichTrackMetadata(track) {
  if (!track.src || track.type !== "mp3") return track;

  try {
    const res = await fetch(track.src);
    if (!res.ok) {
      track.unavailable = true;
      return track;
    }

    const reader = res.body.getReader();
    const { value } = await reader.read();
    reader.cancel(); // Abort downloading remaining stream

    if (value) {
      const meta = parseID3FromBytes(value);
      if (meta.title) track.title = meta.title;
      if (meta.author) track.author = meta.author;
    }
  } catch (err) {
    // Network or static offline fetch
  }

  return track;
}
