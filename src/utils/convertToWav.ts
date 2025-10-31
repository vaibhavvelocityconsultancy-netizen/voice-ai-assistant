import { WaveFile } from "wavefile";

export async function convertToWav(blob: Blob): Promise<Blob> {
  try {
    const arrayBuffer = await blob.arrayBuffer();

    // Decode audio using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    console.log("🎧 Decoded audio — channels:", audioBuffer.numberOfChannels);
    console.log("🎧 Sample rate:", audioBuffer.sampleRate);
    console.log("🎧 Duration:", audioBuffer.duration.toFixed(2), "s");

    // Merge all channels (in case stereo) → mono
    const numChannels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length;
    const mixed = new Float32Array(length);
    for (let c = 0; c < numChannels; c++) {
      const data = audioBuffer.getChannelData(c);
      for (let i = 0; i < length; i++) {
        mixed[i] += data[i] / numChannels;
      }
    }

    // Float32 → Int16 PCM
    const int16Array = new Int16Array(mixed.length);
    for (let i = 0; i < mixed.length; i++) {
      const s = Math.max(-1, Math.min(1, mixed[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }

    // Build proper WAV
    const wav = new WaveFile();
    wav.fromScratch(1, audioBuffer.sampleRate, "16", int16Array);

    const wavBytes = new Uint8Array(wav.toBuffer());
    return new Blob([wavBytes], { type: "audio/wav" });
  } catch (err) {
    console.error("❌ WAV conversion failed:", err);
    throw err;
  }
}
