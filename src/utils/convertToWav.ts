// src/utils/convertToWav.ts
import { WaveFile } from "wavefile";

export async function convertToWav(blob: Blob): Promise<Blob> {
  const arrayBuffer = await blob.arrayBuffer();

  // 🎧 Decode audio
  const audioContext = new AudioContext();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  // 🎵 Convert Float32 → Int16
  const float32Array = audioBuffer.getChannelData(0);
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }

  // 🧩 Build WAV file
  const wav = new WaveFile();
  wav.fromScratch(1, audioBuffer.sampleRate, "16", int16Array);

  // ✅ Convert Node-style buffer to ArrayBuffer safely
  const wavBuffer = wav.toBuffer();
  const uint8Array = new Uint8Array(wavBuffer.buffer, wavBuffer.byteOffset, wavBuffer.byteLength);

  return new Blob([uint8Array], { type: "audio/wav" });
}
