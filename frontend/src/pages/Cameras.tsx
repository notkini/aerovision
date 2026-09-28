import { useEffect, useState } from "react";

import { useAuth } from "../auth/AuthContext";


type Device = {
  id: number;
  device_uid: string;
  name: string;
};


type Camera = {
  id: number;
  device_id: number;
  name: string;
  source: string;
  status: string;
  width: number | null;
  height: number | null;
};


const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8765";


export default function Cameras() {
  const { token } = useAuth();


  const [devices, setDevices] =
    useState<Device[]>([]);

  const [cameras, setCameras] =
    useState<Camera[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [deviceId, setDeviceId] =
    useState("");

  const [name, setName] =
    useState("");

  const [source, setSource] =
    useState("/dev/video0");

  const [width, setWidth] =
    useState("640");

  const [height, setHeight] =
    useState("480");

  const [creating, setCreating] =
    useState(false);


  async function loadData() {
    if (!token) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const authHeaders = {
        Authorization: `Bearer ${token}`,
      };


      const [
        devicesResponse,
        camerasResponse,
      ] = await Promise.all([
        fetch(
          `${API_BASE_URL}/api/devices`,
          {
            headers: authHeaders,
          },
        ),

        fetch(
          `${API_BASE_URL}/api/cameras`,
          {
            headers: authHeaders,
          },
        ),
      ]);


      const devicesData =
        await devicesResponse.json();

      const camerasData =
        await camerasResponse.json();


      if (!devicesResponse.ok) {
        throw new Error(
          devicesData?.detail ||
          "Failed to load devices.",
        );
      }


      if (!camerasResponse.ok) {
        throw new Error(
          camerasData?.detail ||
          "Failed to load cameras.",
        );
      }


      setDevices(devicesData);
      setCameras(camerasData);


      if (
        devicesData.length > 0 &&
        !deviceId
      ) {
        setDeviceId(
          String(devicesData[0].id),
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load camera data.",
      );
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadData();
  }, [token]);


  async function createCamera(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    if (!token) {
      return;
    }


    if (!deviceId) {
      setError(
        "Register a device before adding a camera.",
      );
      return;
    }


    try {
      setCreating(true);
      setError("");


      const response =
        await fetch(
          `${API_BASE_URL}/api/cameras`,
          {
            method: "POST",
            headers: {
              Authorization:
                `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              device_id: Number(deviceId),
              name,
              source,
              width: Number(width),
              height: Number(height),
            }),
          },
        );


      const data =
        await response.json();


      if (!response.ok) {
        throw new Error(
          data?.detail ||
          "Failed to create camera.",
        );
      }


      setName("");
      setSource("/dev/video0");
      setWidth("640");
      setHeight("480");

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create camera.",
      );
    } finally {
      setCreating(false);
    }
  }


  function getDeviceName(
    deviceId: number,
  ) {
    return (
      devices.find(
        (device) =>
          device.id === deviceId,
      )?.name ||
      `Device ${deviceId}`
    );
  }


  return (
    <div className="page-content">

      <div className="page-header">
        <p className="eyebrow">
          ADMINISTRATION
        </p>

        <h1>
          Camera Management
        </h1>

        <p className="page-description">
          Configure cameras connected to
          AeroVision edge devices.
        </p>
      </div>


      <div className="device-layout">

        <section className="admin-card">

          <div className="admin-card-header">
            <div>
              <p className="card-label">
                REGISTER CAMERA
              </p>

              <h2>
                New camera
              </h2>
            </div>
          </div>


          <form
            className="admin-form"
            onSubmit={createCamera}
          >

            <label>
              <span>
                Edge device
              </span>

              <select
                value={deviceId}
                onChange={(event) =>
                  setDeviceId(
                    event.target.value,
                  )
                }
                required
              >
                {devices.length === 0 ? (
                  <option value="">
                    No devices available
                  </option>
                ) : (
                  devices.map((device) => (
                    <option
                      value={device.id}
                      key={device.id}
                    >
                      {device.name}
                    </option>
                  ))
                )}
              </select>
            </label>


            <label>
              <span>
                Camera name
              </span>

              <input
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value,
                  )
                }
                placeholder="C270 Front Camera"
                required
              />
            </label>


            <label>
              <span>
                Source
              </span>

              <input
                value={source}
                onChange={(event) =>
                  setSource(
                    event.target.value,
                  )
                }
                placeholder="/dev/video0"
                required
              />
            </label>


            <div className="camera-resolution">
              <label>
                <span>
                  Width
                </span>

                <input
                  type="number"
                  value={width}
                  onChange={(event) =>
                    setWidth(
                      event.target.value,
                    )
                  }
                  min="1"
                  required
                />
              </label>

              <label>
                <span>
                  Height
                </span>

                <input
                  type="number"
                  value={height}
                  onChange={(event) =>
                    setHeight(
                      event.target.value,
                    )
                  }
                  min="1"
                  required
                />
              </label>
            </div>


            {error && (
              <div className="admin-error">
                {error}
              </div>
            )}


            <button
              className="admin-primary-button"
              type="submit"
              disabled={
                creating ||
                devices.length === 0
              }
            >
              {creating
                ? "Registering..."
                : "Register camera"}
            </button>

          </form>
        </section>


        <section className="admin-card">

          <div className="admin-card-header">

            <div>
              <p className="card-label">
                CAMERAS
              </p>

              <h2>
                Registered cameras
              </h2>
            </div>

            <span className="user-count">
              {cameras.length}
            </span>

          </div>


          {loading ? (
            <div className="admin-empty">
              Loading cameras...
            </div>
          ) : cameras.length === 0 ? (
            <div className="admin-empty">
              No cameras registered.
            </div>
          ) : (
            <div className="users-table">

              <div className="users-row camera-row users-header">
                <span>
                  Camera
                </span>

                <span>
                  Device
                </span>

                <span>
                  Status
                </span>

                <span>
                  Resolution
                </span>
              </div>


              {cameras.map((camera) => (
                <div
                  className="users-row camera-row"
                  key={camera.id}
                >

                  <div>
                    <strong>
                      {camera.name}
                    </strong>

                    <span>
                      {camera.source}
                    </span>
                  </div>


                  <span className="role-badge">
                    {getDeviceName(
                      camera.device_id,
                    )}
                  </span>


                  <span
                    className={
                      `status-badge ${
                        camera.status ===
                        "online"
                          ? "active"
                          : "inactive"
                      }`
                    }
                  >
                    {camera.status}
                  </span>


                  <span className="device-ip">
                    {camera.width &&
                    camera.height
                      ? `${camera.width} × ${camera.height}`
                      : "Not configured"}
                  </span>

                </div>
              ))}

            </div>
          )}

        </section>

      </div>

    </div>
  );
}