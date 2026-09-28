import OperationalPage from "./OperationalPage";


export default function CrowdDensity() {
  return (
    <OperationalPage
      eyebrow="CROWD & MOBILITY"
      title="Crowd Density"
      description="Estimate crowd concentration and scene occupancy from edge-based vision."

      focusTitle="Density Analysis"

      focusCards={[
        {
          title: "People Count",
          value: "--",
          detail: "Awaiting detections",
        },
        {
          title: "Density",
          value: "--",
          detail: "Calculated from scene data",
        },
        {
          title: "Zone Occupancy",
          value: "--",
          detail: "Configured monitoring area",
        },
        {
          title: "Status",
          value: "Monitoring",
          detail: "Density engine ready",
        },
      ]}

      pipelineTitle="Density Processing"

      pipeline={[
        {
          number: "01",
          title: "Capture",
          detail: "Read live frame",
        },
        {
          number: "02",
          title: "People",
          detail: "Detect people",
        },
        {
          number: "03",
          title: "Density",
          detail: "Estimate concentration",
        },
        {
          number: "04",
          title: "Map",
          detail: "Present density state",
        },
      ]}
    />
  );
}