export type VideoFacts = {
  // A JPEG of one frame, so the editor can show the film without downloading it (D30).
  still: Blob | null;
  durationSeconds: number | null;
};

const STILL_AT_SECONDS = 3;
const STILL_WIDTH = 640;
// A browser that can't decode the film may never answer; the upload goes on without facts.
const GIVE_UP_AFTER_MS = 10_000;

function nextEvent(video: HTMLVideoElement, event: "loadedmetadata" | "seeked"): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), GIVE_UP_AFTER_MS);
    const settle = (done: () => void) => () => {
      clearTimeout(timer);
      done();
    };
    video.addEventListener(event, settle(resolve), { once: true });
    video.addEventListener("error", settle(() => reject(new Error("unreadable"))), { once: true });
  });
}

function drawStill(video: HTMLVideoElement): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = Math.min(STILL_WIDTH, video.videoWidth);
  canvas.height = Math.round((canvas.width / video.videoWidth) * video.videoHeight);
  const context = canvas.getContext("2d");
  if (!context || canvas.width === 0) return Promise.resolve(null);
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.8));
}

async function readStill(video: HTMLVideoElement, durationSeconds: number): Promise<Blob | null> {
  try {
    video.currentTime = Math.min(STILL_AT_SECONDS, durationSeconds / 2);
    await nextEvent(video, "seeked");
    return await drawStill(video);
  } catch {
    return null;
  }
}

// Reads a film's length and a still from the host's own file, before it is uploaded.
export async function readVideoFacts(file: Blob): Promise<VideoFacts> {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.preload = "auto";
  video.src = url;
  try {
    await nextEvent(video, "loadedmetadata");
    const durationSeconds = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : null;
    return { durationSeconds, still: durationSeconds === null ? null : await readStill(video, durationSeconds) };
  } catch {
    return { durationSeconds: null, still: null };
  } finally {
    // Detaching the source and reloading lets the browser free the decoded film at once.
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(url);
  }
}
