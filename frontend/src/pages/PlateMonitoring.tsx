import OperationalPage from "./OperationalPage";


export default function PlateMonitoring() {
  return (
    <OperationalPage
      eyebrow="TRAFFIC INTELLIGENCE"
      title="Plate Monitoring"
      description="Monitor vehicle plate detections and prepare traffic records for downstream processing."

      focusTitle="Plate Intelligence"

      focusCards={[
        {
          title: "Plates Detected",
          value: "--",
          detail: "Awaiting plate detections",
        },
        {
          title: "Readable",
          value: "--",
          detail: "Awaiting plate processing",
        },
        {
          title: "Recognition",
          value: "--",
          detail: "Recognition pipeline",
        },
        {
          title: "Records",
          value: "--",
          detail: "Stored plate events",
        },
      ]}

      pipelineTitle="Plate Monitoring Flow"

      pipeline={[
        {
          number: "01",
          title: "Vehicle",
          detail: "Identify vehicle",
        },
        {
          number: "02",
          title: "Plate",
          detail: "Locate plate region",
        },
        {
          number: "03",
          title: "Recognition",
          detail: "Process plate text",
        },
        {
          number: "04",
          title: "Record",
          detail: "Store traffic event",
        },
      ]}
    />
  );
}