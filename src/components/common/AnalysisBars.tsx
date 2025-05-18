import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "lucide-react";
import { useState } from "react";

// Progress Bar Component
const dotColorMap = {
  purple: "bg-purple-600",
  yellow: "bg-yellow-500",
  orange: "bg-orange-400",
  blue: "bg-blue-400",
  green: "bg-green-500",
};

// Dashboard component that displays recruiting metrics
export default function AnalysisBars({ title }: { title: string }) {
  const [timeframe, setTimeframe] = useState("month");

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-6">{title}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Acquisitions</h2>
              <Select defaultValue={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-32 bg-white">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-purple-500" />
                    <SelectValue placeholder="Month" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <ProgressBar label="Applications" value={80} color="purple" />
              <ProgressBar label="Shortlisted" value={55} color="yellow" />
              <ProgressBar label="Rejected" value={47} color="orange" />
              <ProgressBar label="On Hold" value={35} color="blue" />
              <ProgressBar label="Finalised" value={24} color="green" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-6">Candidates by Gender</h2>
            <div className="flex justify-center items-center">
              <div className="relative w-48 h-48">
                <div className="absolute inset-0 rounded-full border-8 border-transparent border-r-orange-400 border-b-orange-400 border-l-orange-400 rotate-45"></div>

                <div className="absolute inset-0 rounded-full border-8 border-transparent border-t-purple-600 border-r-purple-600 rotate-45"></div>

                <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg
                        viewBox="0 0 24 24"
                        className="w-6 h-6 text-purple-300"
                      >
                        <path
                          fill="currentColor"
                          d="M17.5,9.5C17.5,6.46 15.04,4 12,4S6.5,6.46 6.5,9.5c0,2.7 1.94,4.93 4.5,5.4V17H9v2h2v2h2v-2h2v-2h-2v-2.1C15.56,14.43 17.5,12.2 17.5,9.5M8.5,9.5C8.5,7.57 10.07,6 12,6s3.5,1.57 3.5,3.5S13.93,13 12,13S8.5,11.43 8.5,9.5z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-6 space-x-8">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-purple-600 mr-2"></div>
                <span>Male</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-orange-400 mr-2"></div>
                <span>Female</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ProgressBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: keyof typeof dotColorMap;
}) {
  const colorMap = {
    purple: "bg-primary",
    yellow: "bg-secondary",
    orange: "bg-orange-400",
    blue: "bg-blue-400",
    green: "bg-green-500",
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div
            className={`w-2 h-2 rounded-full ${dotColorMap[color]} mr-2`}
          ></div>
          <span className="text-sm">{label}</span>
        </div>
        <span className="text-sm font-medium">{value}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${colorMap[color]}`}
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );
}
