import type { DeviceModeResponse } from "../services/api";


type ActiveModeBarProps = {
  mode: DeviceModeResponse | null;
  loading?: boolean;
};


const MODE_LABELS: Record<string, string> = {
  standby: "Standby",
  traffic_overview: "Traffic Vision",
  crowd_overview: "Crowd & Mobility",
  road_overview: "Road Intelligence",
  safety_overview: "Mobility Safety",
};


function getModeLabel(
  modeKey: string | null | undefined,
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


export default function ActiveModeBar({
  mode,
  loading = false,
}: ActiveModeBarProps) {
  if (loading) {
    return (
      <div className="active-mode-bar">
        <div className="active-mode-copy">
          <span className="active-mode-label">
            CURRENT ACTIVE MODEL
          </span>

          <span className="active-mode-value">
            Loading...
          </span>
        </div>
      </div>
    );
  }


  const activeModeKey =
    mode?.current_mode ||
    mode?.desired_mode;


  const activeModeLabel =
    getModeLabel(activeModeKey);


  return (
    <div className="active-mode-bar">

      <div className="active-mode-copy">

        <span className="active-mode-label">
          CURRENT ACTIVE MODEL
        </span>

        <span className="active-mode-value">
          {activeModeLabel}
        </span>

      </div>

    </div>
  );
}