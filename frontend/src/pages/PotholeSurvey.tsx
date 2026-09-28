import OperationalPage from "./OperationalPage";


export default function PotholeSurvey() {
  return (
    <OperationalPage
      eyebrow="ROAD INTELLIGENCE"
      title="Pothole Survey"
      description="Identify and record potholes during mobile or roadside inspection operations."

      focusTitle="Pothole Survey"

      focusCards={[
        {
          title: "Potholes",
          value: "--",
          detail: "Awaiting detection data",
        },
        {
          title: "Road Damage",
          value: "--",
          detail: "Awaiting classification",
        },
        {
          title: "Survey State",
          value: "Ready",
          detail: "Survey interface active",
        },
        {
          title: "Locations",
          value: "--",
          detail: "Requires GPS data",
        },
      ]}

      pipelineTitle="Pothole Survey Flow"

      pipeline={[
        {
          number: "01",
          title: "Drive",
          detail: "Capture roadway frames",
        },
        {
          number: "02",
          title: "Detect",
          detail: "Identify potholes",
        },
        {
          number: "03",
          title: "Locate",
          detail: "Associate position",
        },
        {
          number: "04",
          title: "Survey",
          detail: "Store inspection result",
        },
      ]}
    />
  );
}