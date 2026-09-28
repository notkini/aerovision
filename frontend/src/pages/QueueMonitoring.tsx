import OperationalPage from "./OperationalPage";


export default function QueueMonitoring() {
  return (
    <OperationalPage
      eyebrow="CROWD & MOBILITY"
      title="Queue Monitoring"
      description="Monitor queue occupancy and movement at designated service or mobility points."

      focusTitle="Queue Intelligence"

      focusCards={[
        {
          title: "Queue Length",
          value: "--",
          detail: "Awaiting people detections",
        },
        {
          title: "Wait Time",
          value: "--",
          detail: "Awaiting historical data",
        },
        {
          title: "Queue State",
          value: "Monitoring",
          detail: "Queue analysis ready",
        },
        {
          title: "Alert",
          value: "--",
          detail: "Threshold evaluation",
        },
      ]}

      pipelineTitle="Queue Monitoring Flow"

      pipeline={[
        {
          number: "01",
          title: "Detect",
          detail: "Identify people",
        },
        {
          number: "02",
          title: "Queue",
          detail: "Estimate queue formation",
        },
        {
          number: "03",
          title: "Measure",
          detail: "Estimate occupancy",
        },
        {
          number: "04",
          title: "Alert",
          detail: "Evaluate thresholds",
        },
      ]}
    />
  );
}