import OperationalPage from "./OperationalPage";


export default function WrongWay() {
  return (
    <OperationalPage
      eyebrow="TRAFFIC INTELLIGENCE"
      title="Wrong-Way Monitoring"
      description="Monitor vehicle movement and identify potential wrong-way traffic events."

      focusTitle="Movement Analysis"

      focusCards={[
        {
          title: "Vehicles",
          value: "--",
          detail: "Awaiting detections",
        },
        {
          title: "Direction",
          value: "--",
          detail: "Movement estimation",
        },
        {
          title: "Wrong-Way Events",
          value: "--",
          detail: "Awaiting event processing",
        },
        {
          title: "Monitoring",
          value: "Ready",
          detail: "Direction analysis module",
        },
      ]}

      pipelineTitle="Wrong-Way Detection Flow"

      pipeline={[
        {
          number: "01",
          title: "Detection",
          detail: "Identify vehicles",
        },
        {
          number: "02",
          title: "Tracking",
          detail: "Observe movement",
        },
        {
          number: "03",
          title: "Direction",
          detail: "Estimate travel direction",
        },
        {
          number: "04",
          title: "Alert",
          detail: "Generate event",
        },
      ]}
    />
  );
}