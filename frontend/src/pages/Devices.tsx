import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { FormEvent } from "react";

import { useAuth } from "../auth/AuthContext";


type Device = {
  id: number;
  device_uid: string;
  name: string;
  device_type: string;
  status: string;
  ip_address: string | null;
  last_seen_at: string | null;
  created_at: string;
};


type DeviceRuntime = {
  id: number;
  device_id: number;

  edge_version: string | null;

  current_mode: string | null;
  current_mission_id: number | null;

  camera_status: string;
  camera_name: string | null;
  camera_source: string | null;
  camera_width: number | null;
  camera_height: number | null;
  camera_fps: number | null;
  camera_frame_id: number | null;

  coral_status: string;
  pixhawk_status: string;
  gps_status: string;

  gps_fix: number | null;
  satellites: number | null;

  latitude: number | null;
  longitude: number | null;
  altitude: number | null;

  cpu_usage: number | null;
  memory_usage: number | null;
  cpu_temperature: number | null;

  updated_at: string;
};


const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8765";


function StatusPill({
  status,
}: {
  status: string;
}) {
  const normalized = status.toLowerCase();

  const online =
    normalized === "online" ||
    normalized === "available" ||
    normalized === "active";

  return (
    <span
      className={
        `device-status-pill ${
          online ? "online" : "offline"
        }`
      }
    >
      <span className="device-status-dot" />
      {status}
    </span>
  );
}


function Metric({
  label,
  value,
  unit = "",
}: {
  label: string;
  value: string | number;
  unit?: string;
}) {
  return (
    <div className="device-metric">
      <span>{label}</span>

      <strong>
        {value}

        {unit && (
          <small>
            {unit}
          </small>
        )}
      </strong>
    </div>
  );
}


function formatNumber(
  value: number | null | undefined,
  decimals = 1,
) {
  if (value === null || value === undefined) {
    return "--";
  }

  return value.toFixed(decimals);
}


export default function Devices() {
  const { token } = useAuth();

  const [devices, setDevices] =
    useState<Device[]>([]);

  const [runtime, setRuntime] =
    useState<Record<number, DeviceRuntime>>({});

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [selectedDeviceId, setSelectedDeviceId] =
    useState<number | null>(null);

  const [name, setName] =
    useState("");

  const [deviceUid, setDeviceUid] =
    useState("");

  const [deviceType, setDeviceType] =
    useState("raspberry_pi");

  const [ipAddress, setIpAddress] =
    useState("");

  const [creating, setCreating] =
    useState(false);


  const loadRuntime = useCallback(
    async (deviceList: Device[]) => {
      if (!token) {
        return;
      }

      const results: Record<
        number,
        DeviceRuntime
      > = {};

      await Promise.all(
        deviceList.map(
          async (device) => {
            try {
              const response =
                await fetch(
                  `${API_BASE_URL}/api/devices/${device.id}/runtime`,
                  {
                    headers: {
                      Authorization:
                        `Bearer ${token}`,
                    },
                  },
                );

              if (!response.ok) {
                return;
              }

              const data =
                await response.json();

              results[device.id] =
                data;
            } catch {
              // Runtime data may not exist yet.
            }
          },
        ),
      );

      setRuntime(results);
    },
    [token],
  );


  const refresh =
    useCallback(async () => {
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

        setDevices(data);

        if (
          selectedDeviceId === null &&
          data.length > 0
        ) {
          setSelectedDeviceId(
            data[0].id,
          );
        }

        await loadRuntime(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load devices.",
        );
      } finally {
        setLoading(false);
      }
    }, [
      token,
      selectedDeviceId,
      loadRuntime,
    ]);


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


  async function createDevice(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!token) {
      return;
    }

    try {
      setCreating(true);
      setError("");

      const response =
        await fetch(
          `${API_BASE_URL}/api/devices`,
          {
            method: "POST",
            headers: {
              Authorization:
                `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              device_uid:
                deviceUid.trim(),
              name:
                name.trim(),
              device_type:
                deviceType,
              ip_address:
                ipAddress.trim() ||
                null,
            }),
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
          "Failed to create device.",
        );
      }

      setName("");
      setDeviceUid("");
      setDeviceType("raspberry_pi");
      setIpAddress("");

      await refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create device.",
      );
    } finally {
      setCreating(false);
    }
  }


  const selectedDevice =
    devices.find(
      (device) =>
        device.id ===
        selectedDeviceId,
    ) || null;


  const selectedRuntime =
    selectedDevice
      ? runtime[selectedDevice.id]
      : null;


  const streamUrl = useMemo(() => {
    if (
      !selectedDevice?.ip_address
    ) {
      return null;
    }

    return `http://${selectedDevice.ip_address}:5001/stream`;
  }, [
    selectedDevice,
  ]);


  const cameraStatus =
    selectedRuntime?.camera_status ||
    "unknown";


  const cameraOnline =
    cameraStatus.toLowerCase() ===
    "online";


  return (
    <div className="page-content">

      <div className="page-header">
        <p className="eyebrow">
          ADMINISTRATION
        </p>

        <h1>
          Device Management
        </h1>

        <p className="page-description">
          Monitor AeroVision edge devices
          and their live hardware state.
        </p>
      </div>


      <div className="device-layout">

        {/* REGISTER DEVICE */}

        <section className="admin-card">

          <div className="admin-card-header">
            <div>
              <p className="card-label">
                REGISTER DEVICE
              </p>

              <h2>
                New device
              </h2>
            </div>
          </div>


          <form
            className="admin-form"
            onSubmit={createDevice}
          >

            <label>
              <span>
                Device name
              </span>

              <input
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value,
                  )
                }
                placeholder="AeroVision Edge 01"
                required
              />
            </label>


            <label>
              <span>
                Device UID
              </span>

              <input
                value={deviceUid}
                onChange={(event) =>
                  setDeviceUid(
                    event.target.value,
                  )
                }
                placeholder="rpi-01"
                required
              />
            </label>


            <label>
              <span>
                Device type
              </span>

              <select
                value={deviceType}
                onChange={(event) =>
                  setDeviceType(
                    event.target.value,
                  )
                }
              >
                <option value="raspberry_pi">
                  Raspberry Pi
                </option>

                <option value="drone">
                  Drone
                </option>

                <option value="vehicle">
                  Vehicle Unit
                </option>
              </select>
            </label>


            <label>
              <span>
                IP address
              </span>

              <input
                value={ipAddress}
                onChange={(event) =>
                  setIpAddress(
                    event.target.value,
                  )
                }
                placeholder="192.168.29.20"
              />
            </label>


            {error && (
              <div className="admin-error">
                {error}
              </div>
            )}


            <button
              className="admin-primary-button"
              type="submit"
              disabled={creating}
            >
              {creating
                ? "Registering..."
                : "Register device"}
            </button>

          </form>

        </section>


        {/* DEVICE MONITOR */}

        <section className="admin-card device-monitor-card">

          <div className="admin-card-header">

            <div>
              <p className="card-label">
                EDGE DEVICES
              </p>

              <h2>
                Live device status
              </h2>
            </div>

            <span className="user-count">
              {devices.length}
            </span>

          </div>


          {loading ? (
            <div className="admin-empty">
              Loading devices...
            </div>
          ) : devices.length === 0 ? (
            <div className="admin-empty">
              No devices registered.
            </div>
          ) : (
            <div className="device-monitor">

              {/* DEVICE SELECTOR */}

              <div className="device-selector-list">

                {devices.map(
                  (device) => (
                    <button
                      key={device.id}
                      type="button"
                      className={
                        `device-selector ${
                          device.id ===
                          selectedDeviceId
                            ? "selected"
                            : ""
                        }`
                      }
                      onClick={() =>
                        setSelectedDeviceId(
                          device.id,
                        )
                      }
                    >

                      <div>
                        <strong>
                          {device.name}
                        </strong>

                        <span>
                          {device.device_uid}
                        </span>
                      </div>

                      <StatusPill
                        status={
                          device.status
                        }
                      />

                    </button>
                  ),
                )}

              </div>


              {selectedDevice && (
                <div className="device-detail">

                  {/* HEADER */}

                  <div className="device-detail-header">

                    <div>
                      <p className="card-label">
                        {selectedDevice.device_uid}
                      </p>

                      <h3>
                        {selectedDevice.name}
                      </h3>
                    </div>

                    <StatusPill
                      status={
                        selectedDevice.status
                      }
                    />

                  </div>


                  {/* DEVICE INFO */}

                  <div className="device-info-grid">

                    <div className="device-info-card">
                      <span>
                        DEVICE TYPE
                      </span>

                      <strong>
                        {selectedDevice.device_type}
                      </strong>
                    </div>


                    <div className="device-info-card">
                      <span>
                        IP ADDRESS
                      </span>

                      <strong>
                        {selectedDevice.ip_address ||
                          "Not available"}
                      </strong>
                    </div>


                    <div className="device-info-card">
                      <span>
                        EDGE VERSION
                      </span>

                      <strong>
                        {selectedRuntime?.edge_version ||
                          "Not reported"}
                      </strong>
                    </div>


                    <div className="device-info-card">
                      <span>
                        LAST SEEN
                      </span>

                      <strong>
                        {selectedDevice.last_seen_at
                          ? new Date(
                              selectedDevice.last_seen_at,
                            ).toLocaleTimeString()
                          : "Never"}
                      </strong>
                    </div>

                  </div>


                  {/* LIVE CAMERA */}

                  <div className="device-section">

                    <div className="device-section-title">
                      LIVE CAMERA
                    </div>


                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "minmax(0, 2fr) minmax(260px, 1fr)",
                        gap: "20px",
                        alignItems: "stretch",
                      }}
                    >

                      {/* VIDEO */}

                      <div
                        style={{
                          position: "relative",
                          width: "100%",
                          minHeight: "360px",
                          background:
                            "#101418",
                          borderRadius:
                            "14px",
                          overflow: "hidden",
                          border:
                            "1px solid #dfe3e8",
                          display: "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                        }}
                      >

                        {streamUrl &&
                        cameraOnline ? (
                          <img
                            src={streamUrl}
                            alt={`${selectedDevice.name} live camera`}
                            style={{
                              display:
                                "block",
                              width: "100%",
                              height: "100%",
                              minHeight:
                                "360px",
                              objectFit:
                                "contain",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              textAlign:
                                "center",
                              padding:
                                "32px",
                              color:
                                "#9aa3ad",
                            }}
                          >
                            <div
                              style={{
                                fontSize:
                                  "15px",
                                fontWeight:
                                  600,
                                marginBottom:
                                  "8px",
                              }}
                            >
                              Camera stream unavailable
                            </div>

                            <div
                              style={{
                                fontSize:
                                  "13px",
                              }}
                            >
                              {!selectedDevice.ip_address
                                ? "No device IP address reported."
                                : !cameraOnline
                                  ? `Camera status: ${cameraStatus}`
                                  : "Waiting for camera stream..."}
                            </div>
                          </div>
                        )}

                        {cameraOnline &&
                          streamUrl && (
                            <div
                              style={{
                                position:
                                  "absolute",
                                top: "14px",
                                left: "14px",
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                gap: "7px",
                                padding:
                                  "6px 10px",
                                borderRadius:
                                  "999px",
                                background:
                                  "rgba(15, 20, 24, 0.82)",
                                color:
                                  "#ffffff",
                                fontSize:
                                  "12px",
                                fontWeight:
                                  600,
                              }}
                            >
                              <span
                                style={{
                                  width:
                                    "7px",
                                  height:
                                    "7px",
                                  borderRadius:
                                    "50%",
                                  background:
                                    "#35b86f",
                                }}
                              />

                              LIVE
                            </div>
                          )}

                      </div>


                      {/* CAMERA TELEMETRY */}

                      <div
                        style={{
                          display:
                            "flex",
                          flexDirection:
                            "column",
                          gap: "10px",
                        }}
                      >

                        <div
                          className="device-info-card"
                          style={{
                            minHeight:
                              "72px",
                          }}
                        >
                          <span>
                            CAMERA
                          </span>

                          <strong>
                            {selectedRuntime?.camera_name ||
                              "C270 Front Camera"}
                          </strong>
                        </div>


                        <div
                          className="device-info-card"
                          style={{
                            minHeight:
                              "72px",
                          }}
                        >
                          <span>
                            STATUS
                          </span>

                          <div
                            style={{
                              marginTop:
                                "6px",
                            }}
                          >
                            <StatusPill
                              status={
                                cameraStatus
                              }
                            />
                          </div>
                        </div>


                        <div
                          className="device-info-card"
                          style={{
                            minHeight:
                              "72px",
                          }}
                        >
                          <span>
                            RESOLUTION
                          </span>

                          <strong>
                            {selectedRuntime?.camera_width &&
                            selectedRuntime?.camera_height
                              ? `${selectedRuntime.camera_width} × ${selectedRuntime.camera_height}`
                              : "--"}
                          </strong>
                        </div>


                        <div
                          className="device-info-card"
                          style={{
                            minHeight:
                              "72px",
                          }}
                        >
                          <span>
                            FPS
                          </span>

                          <strong>
                            {selectedRuntime?.camera_fps !==
                            null &&
                            selectedRuntime?.camera_fps !==
                            undefined
                              ? `${formatNumber(
                                  selectedRuntime.camera_fps,
                                )} FPS`
                              : "--"}
                          </strong>
                        </div>


                        <div
                          className="device-info-card"
                          style={{
                            minHeight:
                              "72px",
                          }}
                        >
                          <span>
                            FRAME ID
                          </span>

                          <strong>
                            {selectedRuntime?.camera_frame_id ??
                              "--"}
                          </strong>
                        </div>


                        <div
                          className="device-info-card"
                          style={{
                            minHeight:
                              "72px",
                          }}
                        >
                          <span>
                            SOURCE
                          </span>

                          <strong>
                            {selectedRuntime?.camera_source ||
                              "/dev/video0"}
                          </strong>
                        </div>

                      </div>

                    </div>

                  </div>


                  {/* HARDWARE */}

                  <div className="device-section">

                    <div className="device-section-title">
                      HARDWARE
                    </div>


                    <div className="device-hardware-grid">

                      <div className="hardware-card">
                        <div>
                          <span>
                            CAMERA
                          </span>

                          <strong>
                            {selectedRuntime?.camera_name ||
                              "C270"}
                          </strong>
                        </div>

                        <StatusPill
                          status={
                            selectedRuntime?.camera_status ||
                            "unknown"
                          }
                        />
                      </div>


                      <div className="hardware-card">
                        <div>
                          <span>
                            CORAL TPU
                          </span>

                          <strong>
                            Edge TPU
                          </strong>
                        </div>

                        <StatusPill
                          status={
                            selectedRuntime?.coral_status ||
                            "unknown"
                          }
                        />
                      </div>


                      <div className="hardware-card">
                        <div>
                          <span>
                            PIXHAWK
                          </span>

                          <strong>
                            Flight Controller
                          </strong>
                        </div>

                        <StatusPill
                          status={
                            selectedRuntime?.pixhawk_status ||
                            "unknown"
                          }
                        />
                      </div>


                      <div className="hardware-card">
                        <div>
                          <span>
                            GPS
                          </span>

                          <strong>
                            Navigation
                          </strong>
                        </div>

                        <StatusPill
                          status={
                            selectedRuntime?.gps_status ||
                            "unknown"
                          }
                        />
                      </div>

                    </div>

                  </div>


                  {/* SYSTEM */}

                  <div className="device-section">

                    <div className="device-section-title">
                      SYSTEM
                    </div>


                    <div className="device-metrics">

                      <Metric
                        label="CPU"
                        value={
                          selectedRuntime?.cpu_usage !==
                          null &&
                          selectedRuntime?.cpu_usage !==
                          undefined
                            ? formatNumber(
                                selectedRuntime.cpu_usage,
                              )
                            : "--"
                        }
                        unit="%"
                      />


                      <Metric
                        label="MEMORY"
                        value={
                          selectedRuntime?.memory_usage !==
                          null &&
                          selectedRuntime?.memory_usage !==
                          undefined
                            ? formatNumber(
                                selectedRuntime.memory_usage,
                              )
                            : "--"
                        }
                        unit="%"
                      />


                      <Metric
                        label="TEMPERATURE"
                        value={
                          selectedRuntime?.cpu_temperature !==
                          null &&
                          selectedRuntime?.cpu_temperature !==
                          undefined
                            ? formatNumber(
                                selectedRuntime.cpu_temperature,
                              )
                            : "--"
                        }
                        unit="°C"
                      />


                      <Metric
                        label="MISSION"
                        value={
                          selectedRuntime?.current_mission_id ??
                          "None"
                        }
                      />

                    </div>

                  </div>


                  {/* POSITION */}

                  <div className="device-section">

                    <div className="device-section-title">
                      POSITION
                    </div>


                    <div className="device-info-grid">

                      <div className="device-info-card">
                        <span>
                          LATITUDE
                        </span>

                        <strong>
                          {selectedRuntime?.latitude ??
                            "--"}
                        </strong>
                      </div>


                      <div className="device-info-card">
                        <span>
                          LONGITUDE
                        </span>

                        <strong>
                          {selectedRuntime?.longitude ??
                            "--"}
                        </strong>
                      </div>


                      <div className="device-info-card">
                        <span>
                          ALTITUDE
                        </span>

                        <strong>
                          {selectedRuntime?.altitude ??
                            "--"}
                        </strong>
                      </div>


                      <div className="device-info-card">
                        <span>
                          SATELLITES
                        </span>

                        <strong>
                          {selectedRuntime?.satellites ??
                            "--"}
                        </strong>
                      </div>

                    </div>

                  </div>


                  {/* RUNTIME UPDATE */}

                  <div
                    style={{
                      marginTop:
                        "18px",
                      fontSize:
                        "12px",
                      color:
                        "#8b949e",
                    }}
                  >
                    Runtime last updated:{" "}
                    {selectedRuntime?.updated_at
                      ? new Date(
                          selectedRuntime.updated_at,
                        ).toLocaleTimeString()
                      : "Not available"}
                  </div>

                </div>
              )}

            </div>
          )}

        </section>

      </div>

    </div>
  );
}