import OperationalPage from "./OperationalPage";


export default function RoadOverview() {
  return (
    <OperationalPage
      eyebrow="ROAD INTELLIGENCE"
      title="Road Overview"
      description="Monitor roadway conditions, inspection activity and infrastructure intelligence."

      focusTitle="Road Intelligence"

      focusCards={[
        {
          title: "Road State",
          value: "Monitoring",
          detail: "Road intelligence ready",
        },
        {
          title: "Damage Events",
          value: "--",
          detail: "Awaiting detections",
        },
        {
          title: "Potholes",
          value: "--",
          detail: "Awaiting road survey",
        },
        {
          title: "Inspection",
          value: "Ready",
          detail: "Mission infrastructure available",
        },
      ]}

      pipelineTitle="Road Intelligence Flow"

      pipeline={[
        {
          number: "01",
          title: "Camera",
          detail: "Capture roadway",
        },
        {
          number: "02",
          title: "Detection",
          detail: "Identify surface damage",
        },
        {
          number: "03",
          title: "Location",
          detail: "Associate inspection data",
        },
        {
          number: "04",
          title: "Report",
          detail: "Create road intelligence",
        },
      ]}
    />
  );
}