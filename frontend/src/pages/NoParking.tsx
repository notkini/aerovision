    import OperationalPage from "./OperationalPage";


export default function NoParking() {
  return (
    <OperationalPage
      eyebrow="TRAFFIC INTELLIGENCE"
      title="No-Parking Zone"
      description="Monitor restricted parking areas and evaluate vehicle dwell activity."

      focusTitle="Zone Monitoring"

      focusCards={[
        {
          title: "Active Zones",
          value: "1",
          detail: "Primary zone configured",
        },
        {
          title: "Violations",
          value: "--",
          detail: "Awaiting detection events",
        },
        {
          title: "Dwell Rule",
          value: "60 sec",
          detail: "Default monitoring threshold",
        },
        {
          title: "Zone State",
          value: "Active",
          detail: "Monitoring enabled",
        },
      ]}

      pipelineTitle="No-Parking Rule Flow"

      pipeline={[
        {
          number: "01",
          title: "Camera",
          detail: "Capture roadway frame",
        },
        {
          number: "02",
          title: "Vehicle",
          detail: "Detect vehicle presence",
        },
        {
          number: "03",
          title: "Zone",
          detail: "Check restricted area",
        },
        {
          number: "04",
          title: "Violation",
          detail: "Evaluate dwell duration",
        },
      ]}
    />
  );
}