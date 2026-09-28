import OperationalPage from "./OperationalPage";


export default function CrowdOverview() {
  return (
    <OperationalPage
      eyebrow="CROWD & MOBILITY"
      title="Crowd Overview"
      description="Monitor people, vehicles and mobility activity across the operational scene."

      focusTitle="Mobility Activity"

      focusCards={[
        {
          title: "People",
          value: "--",
          detail: "Awaiting detections",
        },
        {
          title: "Vehicles",
          value: "--",
          detail: "Awaiting detections",
        },
        {
          title: "Scene State",
          value: "Monitoring",
          detail: "Live scene intelligence",
        },
        {
          title: "Crowd Data",
          value: "--",
          detail: "Awaiting analysis",
        },
      ]}

      pipelineTitle="Crowd Intelligence Flow"

      pipeline={[
        {
          number: "01",
          title: "Camera",
          detail: "Capture scene",
        },
        {
          number: "02",
          title: "Detection",
          detail: "Identify people and vehicles",
        },
        {
          number: "03",
          title: "Analysis",
          detail: "Evaluate mobility activity",
        },
        {
          number: "04",
          title: "Operations",
          detail: "Present scene intelligence",
        },
      ]}
    />
  );
}