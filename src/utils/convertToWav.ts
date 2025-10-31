import { WaveFile } from "wavefile";

/**
 * Converts a recorded audio blob (usually WebM) into WAV (PCM 16-bit)
 * so it can be sent to backend APIs that expect .wav format.
 */
export async function convertToWav(audioBlob: Blob): Promise<Blob> {
  // Step 1. Convert Blob → ArrayBuffer
  const arrayBuffer = await audioBlob.arrayBuffer();

  // Step 2. Decode using Web Audio API
  const audioContext = new AudioContext();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  // Step 3. Get channel PCM data
  const pcmData = audioBuffer.getChannelData(0);

  // Step 4. Build WAV file (mono, 16-bit PCM)
  const wav = new WaveFile();
  wav.fromScratch(1, audioBuffer.sampleRate, "16", pcmData);

  // Step 5. Return as Blob
  const wavBytes = new Uint8Array(wav.toBuffer());
  return new Blob([wavBytes], { type: "audio/wav" });
}
