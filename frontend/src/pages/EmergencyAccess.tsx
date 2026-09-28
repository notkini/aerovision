import OperationalPage from "./OperationalPage";


export default function EmergencyAccess() {
  return (
    <OperationalPage
      eyebrow="MOBILITY SAFETY"
      title="Emergency Access"
      description="Monitor emergency access corridors and identify potential mobility obstructions."

      focusTitle="Emergency Corridor"

      focusCards={[
        {
          title: "Corridor",
          value: "Ready",
          detail: "Emergency route monitoring",
        },
        {
          title: "Obstructions",
          value: "--",
          detail: "Awaiting detection data",
        },
        {
          title: "Access State",
          value: "--",
          detail: "Awaiting corridor analysis",
        },
        {
          title: "Alerts",
          value: "--",
          detail: "Awaiting event generation",
        },
      ]}

      pipelineTitle="Emergency Access Flow"

      pipeline={[
        {
          number: "01",
          title: "Corridor",
          detail: "Define access route",
        },
        {
          number: "02",
          title: "Observe",
          detail: "Monitor corridor",
        },
        {
          number: "03",
          title: "Detect",
          detail: "Identify obstruction",
        },
        {
          number: "04",
          title: "Alert",
          detail: "Report access issue",
        },
      ]}
    />
  );
}