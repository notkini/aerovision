import OperationalPage from "./OperationalPage";


export default function SafetyOverview() {
  return (
    <OperationalPage
      eyebrow="MOBILITY SAFETY"
      title="Safety Overview"
      description="Monitor safety conditions, operational zones and mobility access risks."

      focusTitle="Safety Intelligence"

      focusCards={[
        {
          title: "Safety State",
          value: "Monitoring",
          detail: "Safety modules ready",
        },
        {
          title: "Events",
          value: "--",
          detail: "Awaiting safety events",
        },
        {
          title: "Zones",
          value: "--",
          detail: "Configured safety areas",
        },
        {
          title: "Alerts",
          value: "--",
          detail: "Awaiting alert generation",
        },
      ]}

      pipelineTitle="Safety Intelligence Flow"

      pipeline={[
        {
          number: "01",
          title: "Observe",
          detail: "Capture live environment",
        },
        {
          number: "02",
          title: "Detect",
          detail: "Identify safety conditions",
        },
        {
          number: "03",
          title: "Evaluate",
          detail: "Apply safety rules",
        },
        {
          number: "04",
          title: "Alert",
          detail: "Create safety event",
        },
      ]}
    />
  );
}
