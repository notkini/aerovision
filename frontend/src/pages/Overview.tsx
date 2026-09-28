import OperationalPage from "./OperationalPage";


export default function Overview() {
  return (
    <OperationalPage
      eyebrow="AEROVISION"
      title="Overview"
      description="System-wide mobility intelligence, edge telemetry and operational readiness."

      focusTitle="System Capabilities"

      focusCards={[
        {
          title: "Traffic Intelligence",
          value: "Ready",
          detail: "Traffic monitoring modules",
        },
        {
          title: "Crowd & Mobility",
          value: "Ready",
          detail: "Crowd and movement analysis",
        },
        {
          title: "Road Intelligence",
          value: "Ready",
          detail: "Road inspection modules",
        },
        {
          title: "Mobility Safety",
          value: "Ready",
          detail: "Safety monitoring modules",
        },
      ]}

      pipelineTitle="AeroVision Operations"

      pipeline={[
        {
          number: "01",
          title: "Edge Device",
          detail: "Capture telemetry",
        },
        {
          number: "02",
          title: "Computer Vision",
          detail: "Run edge inference",
        },
        {
          number: "03",
          title: "Intelligence",
          detail: "Process detections",
        },
        {
          number: "04",
          title: "Operations",
          detail: "Present actionable data",
        },
      ]}
    />
  );
}