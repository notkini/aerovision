import { useState } from "react";

type LiveCameraFeedProps = {
  title?: string;
  streamUrl?: string;
  cameraName?: string | null;
  width?: number | null;
  height?: number | null;
  fps?: number | null;
};

const DEFAULT_STREAM_URL =
  import.meta.env.VITE_CAMERA_STREAM_URL ||
  "http://192.168.29.20:5001/stream";

export default function LiveCameraFeed({
  title = "Live camera",
  streamUrl = DEFAULT_STREAM_URL,
  cameraName = "C270 Camera",
  width = 640,
  height = 480,
  fps = null,
}: LiveCameraFeedProps) {
  const [streamError, setStreamError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const handleLoad = () => {
    setStreamError(false);
    setLoaded(true);
  };

  const handleError = () => {
    setStreamError(true);
    setLoaded(false);
  };

  return (
    <div className="av-camera">

      {!streamError && (
        <img
          key={streamUrl}
          src={streamUrl}
          alt={`${title} live camera`}
          className="av-camera-stream"
          onLoad={handleLoad}
          onError={handleError}
        />
      )}

      {streamError && (
        <div className="av-camera-empty">

          <div className="av-camera-mark">
            AV
          </div>

          <strong>
            Camera stream unavailable
          </strong>

          <span>
            Unable to connect to the Raspberry Pi
            camera stream.
          </span>

          <span>
            {streamUrl}
          </span>

        </div>
      )}

      {!streamError && !loaded && (
        <div className="av-camera-loading">
          Connecting to camera...
        </div>
      )}

      <div className="av-camera-bar">

        <span>
          {cameraName || "C270 Camera"}
        </span>

        <span>
          {width && height
            ? `${width} × ${height}`
            : "640 × 480"}
        </span>

        <span>
          {fps != null
            ? `${fps.toFixed(1)} FPS`
            : "-- FPS"}
        </span>

        <span
          className={
            loaded && !streamError
              ? "av-stream-state online"
              : "av-stream-state"
          }
        >
          <span className="av-status-dot" />

          {streamError
            ? "Disconnected"
            : loaded
              ? "Live"
              : "Connecting"}
        </span>

      </div>

    </div>
  );
}