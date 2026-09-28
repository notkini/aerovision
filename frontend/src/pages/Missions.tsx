import OperationalPage from "./OperationalPage";


export default function Missions() {
  return (
    <OperationalPage
      eyebrow="MISSIONS"
      title="Missions"
      description="Create, monitor and manage AeroVision operational missions."

      focusTitle="Mission Operations"

      focusCards={[
        {
          title: "Active Missions",
          value: "--",
          detail: "Mission API integration pending",
        },
        {
          title: "Edge Device",
          value: "rpi-01",
          detail: "Primary operational device",
        },
        {
          title: "Mission State",
          value: "Ready",
          detail: "Mission interface available",
        },
        {
          title: "Completed",
          value: "--",
          detail: "Historical mission data",
        },
      ]}

      pipelineTitle="Mission Lifecycle"

      pipeline={[
        {
          number: "01",
          title: "Plan",
          detail: "Define mission",
        },
        {
          number: "02",
          title: "Deploy",
          detail: "Assign edge device",
        },
        {
          number: "03",
          title: "Operate",
          detail: "Run intelligence",
        },
        {
          number: "04",
          title: "Close",
          detail: "Store mission result",
        },
      ]}
    />
  );
}