import OperationalPage from "./OperationalPage";


export default function TrafficOverview() {
  return (
    <OperationalPage
      eyebrow="TRAFFIC INTELLIGENCE"
      title="Traffic Overview"
      description="Monitor traffic activity, edge inference and traffic intelligence operations."

      focusTitle="Traffic Detection Classes"

      focusCards={[
        {
          title: "Helmet",
          value: "--",
          detail: "Awaiting detection data",
        },
        {
          title: "No Helmet",
          value: "--",
          detail: "Awaiting detection data",
        },
        {
          title: "Rider",
          value: "--",
          detail: "Awaiting detection data",
        },
        {
          title: "Number Plate",
          value: "--",
          detail: "Awaiting detection data",
        },
      ]}

      pipelineTitle="Traffic Intelligence Flow"

      pipeline={[
        {
          number: "01",
          title: "Camera",
          detail: "Capture traffic frames",
        },
        {
          number: "02",
          title: "Coral TPU",
          detail: "Run edge inference",
        },
        {
          number: "03",
          title: "Detection",
          detail: "Identify traffic objects",
        },
        {
          number: "04",
          title: "Event",
          detail: "Create intelligence records",
        },
      ]}
    />
  );
}