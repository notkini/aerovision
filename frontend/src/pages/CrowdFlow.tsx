import OperationalPage from "./OperationalPage";


export default function CrowdFlow() {
  return (
    <OperationalPage
      eyebrow="CROWD & MOBILITY"
      title="Crowd Flow"
      description="Understand movement direction and flow patterns within monitored mobility areas."

      focusTitle="Flow Analysis"

      focusCards={[
        {
          title: "People",
          value: "--",
          detail: "Awaiting detections",
        },
        {
          title: "Primary Flow",
          value: "--",
          detail: "Direction estimation",
        },
        {
          title: "Flow Rate",
          value: "--",
          detail: "Awaiting movement data",
        },
        {
          title: "State",
          value: "Monitoring",
          detail: "Flow analysis ready",
        },
      ]}

      pipelineTitle="Crowd Flow Processing"

      pipeline={[
        {
          number: "01",
          title: "Detect",
          detail: "Identify people",
        },
        {
          number: "02",
          title: "Track",
          detail: "Observe movement",
        },
        {
          number: "03",
          title: "Flow",
          detail: "Estimate direction",
        },
        {
          number: "04",
          title: "Analyze",
          detail: "Present flow state",
        },
      ]}
    />
  );
}