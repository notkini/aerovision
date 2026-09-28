import OperationalPage from "./OperationalPage";


export default function InspectionMission() {
  return (
    <OperationalPage
      eyebrow="ROAD INTELLIGENCE"
      title="Inspection Mission"
      description="Prepare and operate mobile road-inspection missions using AeroVision edge intelligence."

      focusTitle="Inspection Mission"

      focusCards={[
        {
          title: "Mission",
          value: "Ready",
          detail: "Mission workflow available",
        },
        {
          title: "Device",
          value: "rpi-01",
          detail: "Primary edge node",
        },
        {
          title: "Coverage",
          value: "--",
          detail: "Defined by mission",
        },
        {
          title: "Findings",
          value: "--",
          detail: "Awaiting inspection data",
        },
      ]}

      pipelineTitle="Inspection Mission Flow"

      pipeline={[
        {
          number: "01",
          title: "Plan",
          detail: "Define inspection area",
        },
        {
          number: "02",
          title: "Deploy",
          detail: "Start edge operation",
        },
        {
          number: "03",
          title: "Inspect",
          detail: "Collect road findings",
        },
        {
          number: "04",
          title: "Report",
          detail: "Generate inspection report",
        },
      ]}
    />
  );
}