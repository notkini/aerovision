import OperationalPage from "./OperationalPage";


export default function Reports() {
  return (
    <OperationalPage
      eyebrow="REPORTS"
      title="Reports"
      description="Review historical AeroVision events, detections, missions and operational findings."

      focusTitle="Reporting"

      focusCards={[
        {
          title: "Events",
          value: "--",
          detail: "Historical event records",
        },
        {
          title: "Detections",
          value: "--",
          detail: "Stored intelligence records",
        },
        {
          title: "Missions",
          value: "--",
          detail: "Historical mission records",
        },
        {
          title: "Exports",
          value: "Ready",
          detail: "Reporting infrastructure",
        },
      ]}

      pipelineTitle="Reporting Flow"

      pipeline={[
        {
          number: "01",
          title: "Collect",
          detail: "Gather operational data",
        },
        {
          number: "02",
          title: "Filter",
          detail: "Select reporting period",
        },
        {
          number: "03",
          title: "Analyze",
          detail: "Summarize findings",
        },
        {
          number: "04",
          title: "Export",
          detail: "Generate report",
        },
      ]}
    />
  );
}