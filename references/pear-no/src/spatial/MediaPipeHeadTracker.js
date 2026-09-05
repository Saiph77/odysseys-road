import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

const clamp = (value, min = -1, max = 1) => Math.min(max, Math.max(min, value));

export default class MediaPipeHeadTracker {
  constructor(video) {
    this.video = video;
    this.landmarker = null;
    this.stream = null;
    this.sample = { x: 0, y: 0, z: 0, focusX: 0, detected: false };
    this.lastInference = -Infinity;
    this.baselineFaceWidth = 0;
    this.calibrationFrames = 0;
  }

  static async create(video) {
    const tracker = new MediaPipeHeadTracker(video);
    try {
      await tracker.initialize();
      return tracker;
    } catch (error) {
      tracker.stop();
      throw error;
    }
  }

  async initialize() {
    this.stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width: { ideal: 640 },
        height: { ideal: 480 },
        frameRate: { ideal: 30, max: 30 }
      },
      audio: false
    });
    this.video.srcObject = this.stream;
    this.video.muted = true;
    this.video.playsInline = true;
    await this.video.play();

    const base = import.meta.env.BASE_URL || '/';
    const vision = await FilesetResolver.forVisionTasks(`${base}mediapipe/wasm`);
    const options = {
      baseOptions: { modelAssetPath: `${base}models/face_landmarker.task`, delegate: 'GPU' },
      runningMode: 'VIDEO',
      numFaces: 1,
      minFaceDetectionConfidence: 0.55,
      minFacePresenceConfidence: 0.55,
      minTrackingConfidence: 0.55,
      outputFacialTransformationMatrixes: true
    };

    try {
      this.landmarker = await FaceLandmarker.createFromOptions(vision, options);
    } catch {
      this.landmarker = await FaceLandmarker.createFromOptions(vision, {
        ...options,
        baseOptions: { ...options.baseOptions, delegate: 'CPU' }
      });
    }
  }

  getSample(now) {
    if (!this.landmarker || this.video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return this.sample;
    if (now - this.lastInference < 1000 / 24) return this.sample;
    this.lastInference = now;

    const result = this.landmarker.detectForVideo(this.video, now);
    const landmarks = result.faceLandmarks[0];
    if (!landmarks) {
      this.sample.detected = false;
      return this.sample;
    }

    const leftTemple = landmarks[234];
    const rightTemple = landmarks[454];
    const forehead = landmarks[10];
    const chin = landmarks[152];
    const faceWidth = Math.abs(rightTemple.x - leftTemple.x);
    const centerX = (leftTemple.x + rightTemple.x) * 0.5;
    const centerY = (forehead.y + chin.y) * 0.5;

    if (this.calibrationFrames < 24) {
      this.baselineFaceWidth = (
        this.baselineFaceWidth * this.calibrationFrames + faceWidth
      ) / (this.calibrationFrames + 1);
      this.calibrationFrames += 1;
    }

    this.sample.x = clamp((0.5 - centerX) * 2.4);
    this.sample.y = clamp((0.5 - centerY) * 2.4);
    this.sample.z = clamp((faceWidth / Math.max(this.baselineFaceWidth, 0.001) - 1) * 2.8);

    const matrix = result.facialTransformationMatrixes[0]?.data;
    const yaw = matrix?.length >= 16 ? Math.atan2(matrix[8], matrix[10]) : 0;
    const normalizedYaw = clamp(-yaw / 0.48);
    this.sample.focusX = clamp(this.sample.x * 0.42 + normalizedYaw * 0.78);
    this.sample.detected = true;
    return this.sample;
  }

  stop() {
    this.landmarker?.close();
    this.landmarker = null;
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    this.video.srcObject = null;
  }
}

