import { useCallback, useEffect, useState } from "react";

import { useAuth } from "../auth/AuthContext";
import LiveCameraFeed from "../components/LiveCameraFeed";

type Device = {
  id: number;
  device_uid: string;
  name: string;
  status?: string | null;
};

type Runtime = {
  edge_version?: string | null;
  current_mode?: string | null;

  cpu_usage?: number | null;
  memory_usage?: number | null;
  cpu_temperature?: number | null;

  camera_status?: string | null;
  camera_name?: string | null;
  camera_width?: number | null;
  camera_height?: number | null;
  camera_fps?: number | null;
  camera_frame_id?: number | null;

  coral_status?: string | null;
  pixhawk_status?: string | null;
  gps_status?: string | null;
};

type FocusCard = {
  title: string;
  value: string;
  detail: string;
};

type PipelineStep = {
  number: string;
  title: string;
  detail: string;
};

type OperationalPageProps = {
  eyebrow: string;
  title: string;
  description: string;

  focusTitle: string;
  focusCards: FocusCard[];

  pipelineTitle: string;
  pipeline: PipelineStep[];
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8765";

function formatStatus(value?: string | null) {
  if (!value) {
    return "Unknown";
  }

  return value
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function formatMode(value?: string | null) {
  if (!value) {
    return "Standby";
  }

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function StatusValue({
  value,
}: {
  value?: string | null;
}) {
  const normalized = String(value || "").toLowerCase();

  const online =
    normalized === "online" ||
    normalized === "connected" ||
    normalized === "ready" ||
    normalized === "running";

  return (
    <strong
      className={
        online
          ? "av-status online"
          : "av-status"
      }
    >
      <span className="av-status-dot" />

      {formatStatus(value)}
    </strong>
  );
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="av-metric-card">
      <span className="av-metric-label">
        {label}
      </span>

      <strong className="av-metric-value">
        {value}
      </strong>

      <span className="av-metric-detail">
        {detail}
      </span>
    </div>
  );
}

export default function OperationalPage({
  eyebrow,
  title,
  description,
  focusTitle,
  focusCards,
  pipelineTitle,
  pipeline,
}: OperationalPageProps) {
  const { token } = useAuth();

  const [device, setDevice] =
    useState<Device | null>(null);

  const [runtime, setRuntime] =
    useState<Runtime | null>(null);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const refresh = useCallback(
    async () => {
      if (!token) {
        return;
      }

      try {
        setError("");

        const response =
          await fetch(
            `${API_BASE_URL}/api/devices`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            },
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.detail ||
            "Failed to load devices.",
          );
        }

        const primaryDevice =
          data?.[0] || null;

        setDevice(primaryDevice);

        if (!primaryDevice) {
          setRuntime(null);
          return;
        }

        const runtimeResponse =
          await fetch(
            `${API_BASE_URL}/api/devices/${primaryDevice.id}/runtime`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            },
          );

        if (!runtimeResponse.ok) {
          setRuntime(null);
          return;
        }

        const runtimeData =
          await runtimeResponse.json();

        setRuntime(runtimeData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load AeroVision telemetry.",
        );
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    refresh();

    const timer =
      window.setInterval(
        refresh,
        5000,
      );

    return () =>
      window.clearInterval(timer);
  }, [refresh]);

  return (
    <div className="av-page">

      <div className="av-page-header">

        <div>
          <p className="av-eyebrow">
            {eyebrow}
          </p>

          <h1>
            {title}
          </h1>

          <p className="av-description">
            {description}
          </p>
        </div>

        <div className="av-operation-state">

          <span
            className={
              device?.status === "online"
                ? "av-live-dot online"
                : "av-live-dot"
            }
          />

          {device?.status === "online"
            ? "Operational"
            : "Waiting for edge"}

        </div>

      </div>

      {error && (
        <div className="av-page-error">
          {error}
        </div>
      )}

      <div className="av-metrics">

        <MetricCard
          label="EDGE DEVICE"
          value={
            device?.status
              ? formatStatus(
                  device.status,
                )
              : "Offline"
          }
          detail={
            device?.device_uid ||
            "No registered device"
          }
        />

        <MetricCard
          label="CAMERA"
          value={
            runtime?.camera_status
              ? formatStatus(
                  runtime.camera_status,
                )
              : "Offline"
          }
          detail={
            runtime?.camera_fps != null
              ? `${runtime.camera_fps.toFixed(1)} FPS`
              : "Waiting for telemetry"
          }
        />

        <MetricCard
          label="CORAL TPU"
          value={
            runtime?.coral_status
              ? formatStatus(
                  runtime.coral_status,
                )
              : "Unknown"
          }
          detail={
            runtime?.edge_version
              ? `Edge ${runtime.edge_version}`
              : "Edge hardware"
          }
        />

        <MetricCard
          label="CURRENT MODE"
          value={formatMode(
            runtime?.current_mode,
          )}
          detail={
            runtime?.camera_frame_id != null
              ? `Frame ${runtime.camera_frame_id}`
              : "No frame telemetry"
          }
        />

      </div>

      <div className="av-main-grid">

        <section className="av-panel">

          <div className="av-panel-header">

            <div>
              <span className="av-kicker">
                LIVE FEED
              </span>

              <h2>
                Camera Operations
              </h2>
            </div>

            <StatusValue
              value={
                runtime?.camera_status ||
                "offline"
              }
            />

          </div>

          <LiveCameraFeed
            title={title}
            cameraName={
              runtime?.camera_name ||
              "C270 Camera"
            }
            width={
              runtime?.camera_width ||
              640
            }
            height={
              runtime?.camera_height ||
              480
            }
            fps={
              runtime?.camera_fps ??
              null
            }
          />

        </section>

        <section className="av-panel">

          <div className="av-panel-header">

            <div>
              <span className="av-kicker">
                EDGE STATUS
              </span>

              <h2>
                System Operations
              </h2>
            </div>

          </div>

          <div className="av-device">

            <div className="av-device-icon">
              PI
            </div>

            <div>
              <strong>
                {device?.name ||
                  "No edge device"}
              </strong>

              <span>
                {device?.device_uid ||
                  "Not registered"}
              </span>
            </div>

          </div>

          <div className="av-status-list">

            <div className="av-status-row">
              <span>
                Edge Device
              </span>

              <StatusValue
                value={
                  device?.status ||
                  "offline"
                }
              />
            </div>

            <div className="av-status-row">
              <span>
                Camera
              </span>

              <StatusValue
                value={
                  runtime?.camera_status ||
                  "offline"
                }
              />
            </div>

            <div className="av-status-row">
              <span>
                Coral TPU
              </span>

              <StatusValue
                value={
                  runtime?.coral_status ||
                  "unknown"
                }
              />
            </div>

            <div className="av-status-row">
              <span>
                Pixhawk
              </span>

              <StatusValue
                value={
                  runtime?.pixhawk_status ||
                  "unknown"
                }
              />
            </div>

            <div className="av-status-row">
              <span>
                GPS
              </span>

              <StatusValue
                value={
                  runtime?.gps_status ||
                  "unknown"
                }
              />
            </div>

          </div>

        </section>

      </div>

      <section className="av-panel">

        <div className="av-panel-header">

          <div>
            <span className="av-kicker">
              {eyebrow}
            </span>

            <h2>
              {focusTitle}
            </h2>
          </div>

        </div>

        <div className="av-focus-grid">

          {focusCards.map((card) => (
            <div
              key={card.title}
              className="av-focus-card"
            >

              <span>
                {card.title}
              </span>

              <strong>
                {card.value}
              </strong>

              <small>
                {card.detail}
              </small>

            </div>
          ))}

        </div>

      </section>

      <div className="av-bottom-grid">

        <section className="av-panel">

          <div className="av-panel-header">

            <div>
              <span className="av-kicker">
                RUNTIME
              </span>

              <h2>
                Edge Telemetry
              </h2>
            </div>

          </div>

          <div className="av-runtime-grid">

            <div>
              <span>
                CPU Usage
              </span>

              <strong>
                {runtime?.cpu_usage != null
                  ? `${runtime.cpu_usage.toFixed(1)}%`
                  : "--"}
              </strong>
            </div>

            <div>
              <span>
                Memory
              </span>

              <strong>
                {runtime?.memory_usage != null
                  ? `${runtime.memory_usage.toFixed(1)}%`
                  : "--"}
              </strong>
            </div>

            <div>
              <span>
                Temperature
              </span>

              <strong>
                {runtime?.cpu_temperature != null
                  ? `${runtime.cpu_temperature.toFixed(1)}°C`
                  : "--"}
              </strong>
            </div>

            <div>
              <span>
                Frame ID
              </span>

              <strong>
                {runtime?.camera_frame_id != null
                  ? runtime.camera_frame_id
                  : "--"}
              </strong>
            </div>

          </div>

        </section>

        <section className="av-panel">

          <div className="av-panel-header">

            <div>
              <span className="av-kicker">
                WORKFLOW
              </span>

              <h2>
                {pipelineTitle}
              </h2>
            </div>

          </div>

          <div className="av-pipeline">

            {pipeline.map(
              (step, index) => (
                <div
                  className="av-pipeline-group"
                  key={step.number}
                >

                  <div className="av-pipeline-step">

                    <span>
                      {step.number}
                    </span>

                    <div>
                      <strong>
                        {step.title}
                      </strong>

                      <small>
                        {step.detail}
                      </small>
                    </div>

                  </div>

                  {index <
                    pipeline.length - 1 && (
                    <div className="av-pipeline-line" />
                  )}

                </div>
              ),
            )}

          </div>

          <div className="av-pipeline-footer">

            {loading
              ? "Loading edge telemetry..."
              : "Operational interface ready for live intelligence data."}

          </div>

        </section>

      </div>

    </div>
  );
}