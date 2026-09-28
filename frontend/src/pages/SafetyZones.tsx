import OperationalPage from "./OperationalPage";


export default function SafetyZones() {
  return (
    <OperationalPage
      eyebrow="MOBILITY SAFETY"
      title="Safety Zones"
      description="Configure designated safety areas and monitor activity within protected operational zones."

      focusTitle="Safety Zone Management"

      focusCards={[
        {
          title: "Active Zones",
          value: "--",
          detail: "Configured safety zones",
        },
        {
          title: "Occupancy",
          value: "--",
          detail: "Awaiting scene data",
        },
        {
          title: "Events",
          value: "--",
          detail: "Awaiting zone events",
        },
        {
          title: "Zone State",
          value: "Ready",
          detail: "Zone configuration available",
        },
      ]}

      pipelineTitle="Safety Zone Flow"

      pipeline={[
        {
          number: "01",
          title: "Define",
          detail: "Create safety boundary",
        },
        {
          number: "02",
          title: "Observe",
          detail: "Monitor live scene",
        },
        {
          number: "03",
          title: "Evaluate",
          detail: "Check zone conditions",
        },
        {
          number: "04",
          title: "Alert",
          detail: "Create zone event",
        },
      ]}
    />
  );
}