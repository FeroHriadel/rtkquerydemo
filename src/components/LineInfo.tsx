import { useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";



interface LineInfoProps {
  lineCoords: number[][];
  lineLength?: number;
}



function LineInfo({ lineCoords, lineLength }: LineInfoProps) {
  const [showKilometers, setShowKilometers] = useState(true);

  // Convert km to miles
  function kilometersToMiles(kilometers: number) {
    const conversionFactor = 0.621371;
    return kilometers * conversionFactor;
  }

  // Switch km/Miles
  function toggleKilometers() {
    setShowKilometers(!showKilometers);
  }

  // Render on screen
  if (lineCoords.length === 0) {
    return (
      <Card className="p-4">
        <p className="text-center">Draw a line to see the info</p>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      {
        lineCoords.map((coord, index) => {
          return (
            <div key={"lineinfo" + index}>
              <h4 className="font-semibold">Point {index+1}</h4>
              <span className="mr-4">Lng: {coord[0]}</span>
              <span>Lat: {coord[1]}</span>
            </div>
          )
        })
      }

      <h4 className="font-semibold">Length</h4>
      <span>{showKilometers ? `${lineLength} km` : `${kilometersToMiles(lineLength!)} miles`}</span>
      <Badge onClick={toggleKilometers} className="ml-2 cursor-pointer">{showKilometers ? "to Miles" : "to km"}</Badge>
    </Card>
  )
}

export default LineInfo