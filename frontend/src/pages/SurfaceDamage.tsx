import OperationalPage from "./OperationalPage";


export default function SurfaceDamage() {
  return (
    <OperationalPage
      eyebrow="ROAD INTELLIGENCE"
      title="Surface Damage"
      description="Monitor visible road-surface damage and prepare inspection records."

      focusTitle="Surface Damage"

      focusCards={[
        {
          title: "Damage",
          value: "--",
          detail: "Awaiting detection data",
        },
        {
          title: "Cracks",
          value: "--",
          detail: "Awaiting road detections",
        },
        {
          title: "Road Damage",
          value: "--",
          detail: "Awaiting classification",
        },
        {
          title: "Severity",
          value: "--",
          detail: "Requires detection analysis",
        },
      ]}

      pipelineTitle="Surface Damage Flow"

      pipeline={[
        {
          number: "01",
          title: "Capture",
          detail: "Read road frame",
        },
        {
          number: "02",
          title: "Damage",
          detail: "Detect visible damage",
        },
        {
          number: "03",
          title: "Classify",
          detail: "Categorize damage",
        },
        {
          number: "04",
          title: "Record",
          detail: "Store inspection result",
        },
      ]}
    />
  );
}