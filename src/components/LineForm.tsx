import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";



interface LineFormProps {
  lineCoords: number[][];
  onSubmit: (coords: number[][]) => void;
}



function LineForm({ lineCoords, onSubmit }: LineFormProps) {
  const [formValues, setFormValues] = useState([...lineCoords]); // Make a copy - don't change parent's lineCoords
  const [isDialogOpen, setIsDialogOpen] = useState(false);


  // Change coordinate
  function onChange(value: string, index: number, latOrLng: "lat" | "lng") {
    if (isNaN(parseFloat(value))) return alert("Please enter a valid number");
    const newValues = [...formValues];
    if (latOrLng === "lng") newValues[index] = [parseFloat(value), newValues[index][1]];
    else newValues[index] = [newValues[index][0], parseFloat(value)];
    setFormValues(newValues);
  }

  // Remove coordinate
  function onRemove(index: number) {
    const newValues = formValues.filter((_, i) => i !== index);
    setFormValues(newValues);
  }

  // Add coordinate
  function onAddPoint() {
    const newValues = [...formValues, [0, 0]]; // Add a new point with default values
    setFormValues(newValues);
  }

  function isCoordsSame(coord1: number[], coord2: number[]) {
    return coord1[0] === coord2[0] && coord1[1] === coord2[1];
  }


  // Redraw line on map on form submit
  function onFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (formValues.length < 2) return alert("Please add at least two points");
    if (formValues.length === 2 && isCoordsSame(formValues[0], formValues[1])) return alert("Please add at least two different points");
    onSubmit(formValues);
    setIsDialogOpen(false);
  }


  // Sync lineCoords and formValues (else form will render empty)
  useEffect(() => {
    setFormValues([...lineCoords]);
  }, [lineCoords]);


  // Render on screen
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setIsDialogOpen(true)}>Edit Line</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md overflow-y-auto max-h-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Line</DialogTitle>
          <DialogDescription>Change the line points coords</DialogDescription>
        </DialogHeader>

        <form className="grid gap-4 py-4" id="line-edit-form" onSubmit={onFormSubmit}>
          {formValues.map((coord, index) => (
            /* Lng and lat Inputs */
            <div key={`lineform${index}`} className="space-y-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor={`lng${index}`} className="text-right">Lng</Label>
                <Input
                  id={`lng${index}`}
                  value={coord[0]}
                  className="col-span-3"
                  onChange={(e) => onChange(e.target.value, index, "lng")}
                  type="number"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor={`lat${index}`} className="text-right">Lat</Label>
                <Input
                  id={`lat${index}`}
                  value={coord[1]}
                  className="col-span-3"
                  onChange={(e) => onChange(e.target.value, index, "lat")}
                  type="number"
                />
              </div>

              <div className="flex justify-end">
                <Button type="button" onClick={() => onRemove(index)} className="w-24" variant="destructive">Remove</Button>
              </div>
            </div>
          ))}
          
          {/* Add Point Button */}
          <div className="flex justify-center">
            <Button type="button" onClick={onAddPoint} variant="outline" className="w-24 mt-4">Add Point</Button>
          </div>
        </form>

        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">Close</Button>
          </DialogClose>
          <Button type="submit" form="line-edit-form">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default LineForm;
