import OperationalPage from "./OperationalPage";


export default function RoadCondition() {
  return (
    <OperationalPage
      eyebrow="ROAD INTELLIGENCE"
      title="Road Condition"
      description="Build a structured operational view of roadway condition and inspection findings."

      focusTitle="Road Condition"

      focusCards={[
        {
          title: "Condition",
          value: "--",
          detail: "Awaiting inspection data",
        },
        {
          title: "Damage",
          value: "--",
          detail: "Awaiting road events",
        },
        {
          title: "Coverage",
          value: "--",
          detail: "Awaiting survey coverage",
        },
        {
          title: "Status",
          value: "Ready",
          detail: "Condition engine prepared",
        },
      ]}

      pipelineTitle="Road Condition Flow"

      pipeline={[
        {
          number: "01",
          title: "Inspect",
          detail: "Collect roadway data",
        },
        {
          number: "02",
          title: "Detect",
          detail: "Identify damage",
        },
        {
          number: "03",
          title: "Assess",
          detail: "Evaluate road state",
        },
        {
          number: "04",
          title: "Publish",
          detail: "Create condition view",
        },
      ]}
    />
  );
}