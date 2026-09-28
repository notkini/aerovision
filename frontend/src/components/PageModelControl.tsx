import {
  useEffect,
  useState,
} from "react";

import {
  useLocation,
} from "react-router-dom";

import {
  setDeviceMode,
  type DeviceModeResponse,
} from "../services/api";


type PageModelControlProps = {
  deviceId: number;
  token: string;
  mode: DeviceModeResponse | null;
  onModeChanged: (
    response: DeviceModeResponse,
  ) => void;
};


type PageModel = {
  key: string;
  label: string;
};


const PAGE_MODE_MAP: Array<{
  path: string;
  key: string;
  label: string;
}> = [
  // Overview
  {
    path: "/",
    key: "standby",
    label: "Standby",
  },

  // Traffic Intelligence
  {
    path: "/traffic",
    key: "traffic_overview",
    label: "Traffic Overview",
  },
  {
    path: "/traffic/no-parking",
    key: "traffic_no_parking",
    label: "No-Parking Zone",
  },
  {
    path: "/traffic/helmet",
    key: "traffic_helmet",
    label: "Helmet Compliance",
  },
  {
    path: "/traffic/wrong-way",
    key: "traffic_wrong_way",
    label: "Wrong-Way Monitoring",
  },
  {
    path: "/traffic/plates",
    key: "traffic_plates",
    label: "Plate Monitoring",
  },

  // Crowd & Mobility
  {
    path: "/crowd",
    key: "crowd_overview",
    label: "Crowd Overview",
  },
  {
    path: "/crowd/density",
    key: "crowd_density",
    label: "Crowd Density",
  },
  {
    path: "/crowd/surge",
    key: "crowd_surge",
    label: "Crowd Surge Detection",
  },
  {
    path: "/crowd/flow",
    key: "crowd_flow",
    label: "Crowd Flow",
  },
  {
    path: "/crowd/queues",
    key: "crowd_queues",
    label: "Queue Monitoring",
  },

  // Road Intelligence
  {
    path: "/road",
    key: "road_overview",
    label: "Road Overview",
  },
  {
    path: "/road/damage",
    key: "road_damage",
    label: "Surface Damage",
  },
  {
    path: "/road/potholes",
    key: "road_potholes",
    label: "Pothole Survey",
  },
  {
    path: "/road/condition",
    key: "road_condition",
    label: "Road Condition",
  },
  {
    path: "/road/missions",
    key: "road_missions",
    label: "Inspection Mission",
  },

  // Mobility Safety
  {
    path: "/safety",
    key: "safety_overview",
    label: "Safety Overview",
  },
  {
    path: "/safety/zones",
    key: "safety_zones",
    label: "Safety Zones",
  },
  {
    path: "/safety/emergency",
    key: "safety_emergency",
    label: "Emergency Access",
  },
];


function getPageModel(
  pathname: string,
): PageModel | null {
  const exact =
    PAGE_MODE_MAP.find(
      (item) =>
        item.path === pathname,
    );

  if (exact) {
    return {
      key: exact.key,
      label: exact.label,
    };
  }

  return null;
}


const MODE_LABELS: Record<string, string> = {
  standby: "Standby",

  traffic_overview:
    "Traffic Overview",

  traffic_no_parking:
    "No-Parking Zone",

  traffic_helmet:
    "Helmet Compliance",

  traffic_wrong_way:
    "Wrong-Way Monitoring",

  traffic_plates:
    "Plate Monitoring",

  crowd_overview:
    "Crowd Overview",

  crowd_density:
    "Crowd Density",

  crowd_surge:
    "Crowd Surge Detection",

  crowd_flow:
    "Crowd Flow",

  crowd_queues:
    "Queue Monitoring",

  road_overview:
    "Road Overview",

  road_damage:
    "Surface Damage",

  road_potholes:
    "Pothole Survey",

  road_condition:
    "Road Condition",

  road_missions:
    "Inspection Mission",

  safety_overview:
    "Safety Overview",

  safety_zones:
    "Safety Zones",

  safety_emergency:
    "Emergency Access",
};


function getModeLabel(
  modeKey:
    | string
    | null
    | undefined,
): string {
  if (!modeKey) {
    return "Unknown";
  }

  return (
    MODE_LABELS[modeKey] ||
    modeKey
      .replace(/_/g, " ")
      .replace(/\b\w/g, (character) =>
        character.toUpperCase(),
      )
  );
}


export default function PageModelControl({
  deviceId,
  token,
  mode,
  onModeChanged,
}: PageModelControlProps) {
  const location =
    useLocation();


  const [
    applying,
    setApplying,
  ] = useState(false);


  const [
    applied,
    setApplied,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  const pageModel =
    getPageModel(
      location.pathname,
    );


  const currentMode =
    mode?.current_mode ||
    mode?.desired_mode ||
    null;


  const desiredMode =
    mode?.desired_mode ||
    null;


  const currentModeLabel =
    getModeLabel(
      currentMode,
    );


  const pageModelIsActive =
    Boolean(
      pageModel &&
      (
        currentMode ===
          pageModel.key ||
        desiredMode ===
          pageModel.key
      ),
    );


  const edgeIsSwitching =
    Boolean(
      mode?.current_mode &&
      mode?.desired_mode &&
      mode.current_mode !==
        mode.desired_mode,
    );


  useEffect(() => {
    setApplied(false);
    setError("");
  }, [
    location.pathname,
  ]);


  async function handleApply() {
    if (
      !pageModel ||
      applying ||
      pageModelIsActive
    ) {
      return;
    }


    try {
      setApplying(true);
      setApplied(false);
      setError("");


      const response =
        await setDeviceMode(
          deviceId,
          pageModel.key,
          token,
        );


      onModeChanged(
        response,
      );


      setApplied(true);


      window.setTimeout(() => {
        setApplied(false);
      }, 2000);

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to apply model.",
      );
    } finally {
      setApplying(false);
    }
  }


  /*
   * Pages such as Missions, Map,
   * Reports and Administration do not
   * represent an edge AI model.
   *
   * They still show the current model,
   * but do not display an Apply button.
   */
  return (
    <section className="page-model-control">

      <div className="page-model-current">

        <span className="page-model-label">
          CURRENT ACTIVE MODEL
        </span>

        <strong className="page-model-value">
          {currentModeLabel}
        </strong>


        {edgeIsSwitching && (
          <span className="page-model-switching">
            Switching to{" "}
            {getModeLabel(
              desiredMode,
            )}
            ...
          </span>
        )}

      </div>


      {pageModel && (
        <div className="page-model-action">

          <div className="page-model-target">

            <span className="page-model-target-label">
              THIS PAGE MODEL
            </span>

            <strong className="page-model-target-value">
              {pageModel.label}
            </strong>

          </div>


          <button
            type="button"
            className={
              `page-model-apply-button ${
                pageModelIsActive
                  ? "is-active"
                  : ""
              }`
            }
            disabled={
              applying ||
              pageModelIsActive
            }
            onClick={handleApply}
          >
            {applying
              ? "Applying..."
              : pageModelIsActive
                ? `${pageModel.label} Active`
                : `Apply ${pageModel.label}`}
          </button>


          {applied && (
            <span className="page-model-success">
              Model applied.
            </span>
          )}


          {error && (
            <span className="page-model-error">
              {error}
            </span>
          )}

        </div>
      )}

    </section>
  );
}