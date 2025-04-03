
import React from "react";
import { Car } from "@/types/car";

interface CarInfoTableProps {
  car: Car;
}

export const CarInfoTable = ({ car }: CarInfoTableProps) => {
  const carDetails = [
    { label: "Make", value: car.make },
    { label: "Model", value: car.model },
    { label: "Year", value: car.year },
    { label: "VIN", value: car.vin },
    { label: "Exterior Color", value: car.exteriorColor },
    { label: "Interior Color", value: car.interiorColor },
    { label: "Transmission", value: car.transmission },
    { label: "Condition", value: car.condition },
    { label: "Mileage", value: `${car.mileage.toLocaleString()} miles` },
    { label: "Status", value: car.status },
    { label: "Acquisition Date", value: car.acquisitionDate },
    { label: "Last Service", value: car.lastServiceDate || "Not recorded" },
  ];

  return (
    <div className="border rounded-md overflow-hidden">
      <table className="w-full text-sm">
        <tbody className="divide-y">
          {carDetails.map((detail, index) => (
            <tr key={index} className={index % 2 === 0 ? "bg-secondary/50" : ""}>
              <td className="px-4 py-2 font-medium">{detail.label}</td>
              <td className="px-4 py-2">{detail.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
