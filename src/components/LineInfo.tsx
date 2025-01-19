import { Card } from "./ui/card";



interface LineInfoProps {
  lineCoords: number[][];
  lineLength?: number;
}


function LineInfo({ lineCoords, lineLength }: LineInfoProps) {
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
      <span>{lineLength}km</span>
    </Card>
  )
}

export default LineInfo