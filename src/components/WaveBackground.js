import React, { useRef, useEffect } from "react";

const WaveBackground = ({ audioDataURI }) => {
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const audioSourceRef = useRef(null);

  useEffect(() => {
    if (!audioDataURI) {
      return;
    }

    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    analyserRef.current = audioContextRef.current.createAnalyser();

    // Add a listener to the audio source from ElevenLabs
    const audioSource = new Audio(audioDataURI);
    audioSourceRef.current = audioSource;
    const source = audioContextRef.current.createMediaElementSource(audioSource);
    source.connect(analyserRef.current);
    analyserRef.current.connect(audioContextRef.current.destination);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const drawWave = () => {
      requestAnimationFrame(drawWave);

      analyserRef.current.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;
        ctx.fillStyle = "rgba(0, 255, 0, 0.5)";
        ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    drawWave();

    // Start audio playback
    audioSource.play();

    return () => {
      // Stop audio playback and disconnect the audio context
      if (audioSourceRef.current) {
        audioSourceRef.current.pause();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [audioDataURI]);

  return (
    <canvas ref={canvasRef} className="wave-background" />
  );
};

export default WaveBackground;
