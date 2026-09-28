import OperationalPage from "./OperationalPage";


export default function HelmetCompliance() {
  return (
    <OperationalPage
      eyebrow="TRAFFIC INTELLIGENCE"
      title="Helmet Compliance"
      description="Monitor rider and helmet detection activity for traffic safety analysis."

      focusTitle="Helmet Compliance"

      focusCards={[
        {
          title: "Helmet Detected",
          value: "--",
          detail: "Awaiting detection data",
        },
        {
          title: "No Helmet",
          value: "--",
          detail: "Awaiting violation data",
        },
        {
          title: "Riders",
          value: "--",
          detail: "Awaiting rider detections",
        },
        {
          title: "Compliance",
          value: "--",
          detail: "Calculated from detections",
        },
      ]}

      pipelineTitle="Helmet Detection Flow"

      pipeline={[
        {
          number: "01",
          title: "Rider",
          detail: "Identify motorcycle rider",
        },
        {
          number: "02",
          title: "Helmet",
          detail: "Evaluate helmet class",
        },
        {
          number: "03",
          title: "Compliance",
          detail: "Compare rider state",
        },
        {
          number: "04",
          title: "Event",
          detail: "Record safety violation",
        },
      ]}
    />
  );
}