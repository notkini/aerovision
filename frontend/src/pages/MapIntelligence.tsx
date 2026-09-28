import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import L from "leaflet";

import { useAuth } from "../auth/AuthContext";

import "./MapIntelligence.css";


// ============================================================
// TYPES
// ============================================================


type PixhawkTelemetry = {
  device_id: number;
  device_uid: string;
  device_name: string;

  device_status?: string | null;

  pixhawk_status?: string | null;

  gps_status?: string | null;

  gps_fix?: number | null;

  satellites?: number | null;

  latitude?: number | null;

  longitude?: number | null;

  altitude?: number | null;

  heading?: number | null;

  updated_at?: string | null;
};


type MapDetection = {
  id: number;

  device_id: number;

  camera_id?: number | null;

  mode_id?: number | null;

  object_type: string;

  confidence?: number | null;

  frame_id?: number | null;

  model_name?: string | null;

  inference_ms?: number | null;

  bbox?: string | null;

  latitude?: number | null;

  longitude?: number | null;

  detected_at?: string | null;
};


type TelemetryResponse = {
  status: string;

  received_at?: string;

  devices: PixhawkTelemetry[];
};


type DetectionResponse = {
  status: string;

  count: number;

  detections: MapDetection[];
};


// ============================================================
// CONFIG
// ============================================================


const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8765";


const DEFAULT_CENTER: L.LatLngTuple = [
  18.5204,
  73.8567,
];


// ============================================================
// HELPERS
// ============================================================


function formatNumber(
  value: number | null | undefined,
  digits = 5,
) {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return "--";
  }

  return value.toFixed(digits);
}


function formatAltitude(
  value: number | null | undefined,
) {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return "--";
  }

  return `${value.toFixed(1)} m`;
}


function formatStatus(
  value?: string | null,
) {
  if (!value) {
    return "Unknown";
  }

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}


function isConnected(
  value?: string | null,
) {
  const normalized =
    String(value || "")
      .toLowerCase();

  return (
    normalized === "connected" ||
    normalized === "online" ||
    normalized === "ready" ||
    normalized === "3d_fix"
  );
}


// ============================================================
// MAP AUTO CENTER
// ============================================================


function MapViewport({
  latitude,
  longitude,
}: {
  latitude: number | null;
  longitude: number | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (
      latitude === null ||
      longitude === null
    ) {
      return;
    }

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return;
    }

    map.setView(
      [latitude, longitude],
      Math.max(
        map.getZoom(),
        15,
      ),
      {
        animate: true,
      },
    );
  }, [
    latitude,
    longitude,
    map,
  ]);

  return null;
}


// ============================================================
// PIXHAWK ICON
// ============================================================


const pixhawkIcon =
  L.divIcon({
    className:
      "av-pixhawk-marker",

    html: `
      <div class="av-pixhawk-marker-core">
        <span></span>
      </div>
    `,

    iconSize: [
      28,
      28,
    ],

    iconAnchor: [
      14,
      14,
    ],
  });


// ============================================================
// DETECTION ICON
// ============================================================


function createDetectionIcon(
  label: string,
) {
  return L.divIcon({
    className:
      "av-detection-marker",

    html: `
      <div class="av-detection-marker-core">
        ${label.slice(0, 1).toUpperCase()}
      </div>
    `,

    iconSize: [
      24,
      24,
    ],

    iconAnchor: [
      12,
      12,
    ],
  });
}


// ============================================================
// TELEMETRY CARD
// ============================================================


function TelemetryCard({
  telemetry,
}: {
  telemetry:
    | PixhawkTelemetry
    | null;
}) {
  const connected =
    isConnected(
      telemetry?.pixhawk_status,
    );

  const gpsReady =
    isConnected(
      telemetry?.gps_status,
    );

  return (
    <section className="av-map-panel av-telemetry-panel">

      <div className="av-panel-header">

        <div>
          <span className="av-panel-eyebrow">
            EDGE TELEMETRY
          </span>

          <h2>
            Pixhawk
          </h2>
        </div>

        <span
          className={
            connected
              ? "av-telemetry-status connected"
              : "av-telemetry-status"
          }
        >
          <span className="av-status-dot" />

          {connected
            ? "Connected"
            : "Disconnected"}
        </span>

      </div>


      <div className="av-telemetry-grid">

        <TelemetryItem
          label="GPS"
          value={
            telemetry?.gps_status
              ? formatStatus(
                  telemetry.gps_status,
                )
              : "--"
          }
          detail={
            gpsReady
              ? "Position available"
              : "Waiting for fix"
          }
        />


        <TelemetryItem
          label="SATELLITES"
          value={
            telemetry?.satellites != null
              ? String(
                  telemetry.satellites,
                )
              : "--"
          }
          detail="Visible satellites"
        />


        <TelemetryItem
          label="LATITUDE"
          value={formatNumber(
            telemetry?.latitude,
          )}
          detail="Degrees"
        />


        <TelemetryItem
          label="LONGITUDE"
          value={formatNumber(
            telemetry?.longitude,
          )}
          detail="Degrees"
        />


        <TelemetryItem
          label="ALTITUDE"
          value={formatAltitude(
            telemetry?.altitude,
          )}
          detail="Relative altitude"
        />


        <TelemetryItem
          label="GPS FIX"
          value={
            telemetry?.gps_fix != null
              ? String(
                  telemetry.gps_fix,
                )
              : "--"
          }
          detail="MAVLink fix type"
        />


        <TelemetryItem
          label="HEADING"
          value={
            telemetry?.heading != null
              ? `${telemetry.heading.toFixed(1)}°`
              : "--"
          }
          detail="Vehicle heading"
        />


        <TelemetryItem
          label="DEVICE"
          value={
            telemetry?.device_uid ||
            "rpi-01"
          }
          detail={
            telemetry?.device_name ||
            "Edge device"
          }
        />

      </div>

    </section>
  );
}


// ============================================================
// TELEMETRY ITEM
// ============================================================


function TelemetryItem({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="av-telemetry-item">

      <span className="av-telemetry-label">
        {label}
      </span>

      <strong className="av-telemetry-value">
        {value}
      </strong>

      <span className="av-telemetry-detail">
        {detail}
      </span>

    </div>
  );
}


// ============================================================
// MAIN PAGE
// ============================================================


export default function MapIntelligence() {

  const { token } = useAuth();

  const [
    telemetry,
    setTelemetry,
  ] = useState<
    PixhawkTelemetry[]
  >([]);

  const [
    detections,
    setDetections,
  ] = useState<
    MapDetection[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  // ==========================================================
  // REFRESH
  // ==========================================================

  const refresh = useCallback(
    async () => {

      if (!token) {
        return;
      }

      try {

        setError("");

        const [
          telemetryResponse,
          detectionResponse,
        ] = await Promise.all([

          fetch(
            `${API_BASE_URL}/api/map/telemetry`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            },
          ),

          fetch(
            `${API_BASE_URL}/api/map/detections?limit=1000`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            },
          ),

        ]);


        const telemetryData =
          (await telemetryResponse.json()) as
            TelemetryResponse;


        const detectionData =
          (await detectionResponse.json()) as
            DetectionResponse;


        if (!telemetryResponse.ok) {

          throw new Error(
            "Unable to load Pixhawk telemetry.",
          );
        }


        if (!detectionResponse.ok) {

          throw new Error(
            "Unable to load map detections.",
          );
        }


        setTelemetry(
          telemetryData.devices || [],
        );


        setDetections(
          detectionData.detections || [],
        );

      } catch (err) {

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load map intelligence.",
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
      window.clearInterval(
        timer,
      );

  }, [refresh]);


  // ==========================================================
  // PRIMARY DEVICE
  // ==========================================================

  const primaryTelemetry =
    telemetry.find(
      (item) =>
        item.device_uid ===
        "rpi-01",
    ) ||
    telemetry[0] ||
    null;


  // ==========================================================
  // VALID DETECTIONS
  // ==========================================================

  const mappedDetections =
    useMemo(
      () =>
        detections.filter(
          (detection) =>
            detection.latitude !=
              null &&
            detection.longitude !=
              null &&
            Number.isFinite(
              Number(
                detection.latitude,
              ),
            ) &&
            Number.isFinite(
              Number(
                detection.longitude,
              ),
            ),
        ),
      [detections],
    );


  // ==========================================================
  // POSITION
  // ==========================================================

  const hasPosition =
    primaryTelemetry?.latitude !=
      null &&
    primaryTelemetry?.longitude !=
      null;


  const mapCenter: L.LatLngTuple =
    hasPosition
      ? [
          Number(
            primaryTelemetry!.latitude,
          ),
          Number(
            primaryTelemetry!.longitude,
          ),
        ]
      : DEFAULT_CENTER;


  return (
    <div className="av-map-page">

      <header className="av-map-header">

        <div>

          <span className="av-map-eyebrow">
            MAP INTELLIGENCE
          </span>

          <h1>
            Geospatial Operations
          </h1>

          <p>
            Live Pixhawk position,
            GPS telemetry and
            AI detections from the
            AeroVision edge device.
          </p>

        </div>


        <div className="av-map-live-state">

          <span
            className={
              primaryTelemetry &&
              isConnected(
                primaryTelemetry.pixhawk_status,
              )
                ? "av-live-indicator online"
                : "av-live-indicator"
            }
          />

          {primaryTelemetry &&
          isConnected(
            primaryTelemetry.pixhawk_status,
          )
            ? "Live telemetry"
            : "Waiting for Pixhawk"}

        </div>

      </header>


      {error && (
        <div className="av-map-error">
          {error}
        </div>
      )}


      <TelemetryCard
        telemetry={
          primaryTelemetry
        }
      />


      <section className="av-map-stat-row">

        <div className="av-map-stat">

          <span>
            MAPPED DETECTIONS
          </span>

          <strong>
            {mappedDetections.length}
          </strong>

        </div>


        <div className="av-map-stat">

          <span>
            TOTAL DETECTIONS
          </span>

          <strong>
            {detections.length}
          </strong>

        </div>


        <div className="av-map-stat">

          <span>
            GPS STATUS
          </span>

          <strong>
            {formatStatus(
              primaryTelemetry?.gps_status,
            )}
          </strong>

        </div>


        <div className="av-map-stat">

          <span>
            EDGE DEVICE
          </span>

          <strong>
            {primaryTelemetry?.device_uid ||
              "rpi-01"}
          </strong>

        </div>

      </section>


      <section className="av-map-layout">

        <div className="av-map-container">

          <MapContainer
            center={mapCenter}
            zoom={
              hasPosition
                ? 15
                : 5
            }
            scrollWheelZoom
            className="av-leaflet-map"
          >

            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />


            <MapViewport
              latitude={
                primaryTelemetry?.latitude ??
                null
              }
              longitude={
                primaryTelemetry?.longitude ??
                null
              }
            />


            {hasPosition && (

              <Marker
                position={[
                  Number(
                    primaryTelemetry!.latitude,
                  ),
                  Number(
                    primaryTelemetry!.longitude,
                  ),
                ]}
                icon={pixhawkIcon}
              >

                <Popup>

                  <div className="av-map-popup">

                    <strong>
                      Pixhawk
                    </strong>

                    <span>
                      Device:{" "}
                      {primaryTelemetry.device_uid}
                    </span>

                    <span>
                      GPS:{" "}
                      {formatStatus(
                        primaryTelemetry.gps_status,
                      )}
                    </span>

                    <span>
                      Latitude:{" "}
                      {formatNumber(
                        primaryTelemetry.latitude,
                        7,
                      )}
                    </span>

                    <span>
                      Longitude:{" "}
                      {formatNumber(
                        primaryTelemetry.longitude,
                        7,
                      )}
                    </span>

                    <span>
                      Altitude:{" "}
                      {formatAltitude(
                        primaryTelemetry.altitude,
                      )}
                    </span>

                  </div>

                </Popup>

              </Marker>

            )}


            {mappedDetections.map(
              (detection) => (

                <Marker
                  key={detection.id}
                  position={[
                    Number(
                      detection.latitude,
                    ),
                    Number(
                      detection.longitude,
                    ),
                  ]}
                  icon={
                    createDetectionIcon(
                      detection.object_type,
                    )
                  }
                >

                  <Popup>

                    <div className="av-map-popup">

                      <strong>
                        {detection.object_type}
                      </strong>

                      <span>
                        Confidence:{" "}
                        {detection.confidence !=
                        null
                          ? `${(
                              detection.confidence *
                              100
                            ).toFixed(1)}%`
                          : "--"}
                      </span>

                      <span>
                        Model:{" "}
                        {detection.model_name ||
                          "--"}
                      </span>

                      <span>
                        Frame:{" "}
                        {detection.frame_id ??
                          "--"}
                      </span>

                      <span>
                        Latitude:{" "}
                        {formatNumber(
                          detection.latitude,
                          7,
                        )}
                      </span>

                      <span>
                        Longitude:{" "}
                        {formatNumber(
                          detection.longitude,
                          7,
                        )}
                      </span>

                    </div>

                  </Popup>

                </Marker>

              ),
            )}

          </MapContainer>


          {!hasPosition && (
            <div className="av-map-overlay">

              <strong>
                Waiting for Pixhawk GPS
              </strong>

              <span>
                The map will center on the
                aircraft once valid
                latitude and longitude
                arrive.
              </span>

            </div>
          )}

        </div>


        <aside className="av-map-side-panel">

          <div className="av-map-side-header">

            <span className="av-map-eyebrow">
              LIVE DATA
            </span>

            <h2>
              Detection Feed
            </h2>

          </div>


          {loading ? (

            <div className="av-map-empty">
              Loading telemetry...
            </div>

          ) : mappedDetections.length === 0 ? (

            <div className="av-map-empty">

              <strong>
                No mapped detections
              </strong>

              <span>
                AI detections will appear
                here once they have valid
                Pixhawk coordinates.
              </span>

            </div>

          ) : (

            <div className="av-detection-list">

              {mappedDetections
                .slice(0, 20)
                .map(
                  (detection) => (

                    <div
                      key={detection.id}
                      className="av-detection-row"
                    >

                      <div>

                        <strong>
                          {detection.object_type}
                        </strong>

                        <span>
                          {detection.model_name ||
                            "AI detection"}
                        </span>

                      </div>


                      <div className="av-detection-confidence">

                        {detection.confidence !=
                        null
                          ? `${(
                              detection.confidence *
                              100
                            ).toFixed(0)}%`
                          : "--"}

                      </div>

                    </div>

                  ),
                )}

            </div>

          )}

        </aside>

      </section>

    </div>
  );
} 