import OperationalPage from "./OperationalPage";


export default function CrowdSurge() {
  return (
    <OperationalPage
      eyebrow="CROWD & MOBILITY"
      title="Crowd Surge Detection"
      description="Monitor rapid changes in crowd concentration and identify potential surge conditions."

      focusTitle="Surge Monitoring"

      focusCards={[
        {
          title: "Current Density",
          value: "--",
          detail: "Awaiting scene data",
        },
        {
          title: "Rate of Change",
          value: "--",
          detail: "Awaiting time-series data",
        },
        {
          title: "Surge State",
          value: "Normal",
          detail: "No event calculated yet",
        },
        {
          title: "Alerts",
          value: "--",
          detail: "Awaiting event generation",
        },
      ]}

      pipelineTitle="Surge Detection Flow"

      pipeline={[
        {
          number: "01",
          title: "Density",
          detail: "Measure current occupancy",
        },
        {
          number: "02",
          title: "History",
          detail: "Compare recent states",
        },
        {
          number: "03",
          title: "Surge",
          detail: "Evaluate rapid change",
        },
        {
          number: "04",
          title: "Alert",
          detail: "Create mobility event",
        },
      ]}
    />
  );
}