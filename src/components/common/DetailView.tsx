import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Check, Mail, MoreHorizontal } from "lucide-react";

export default function DetailView() {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Candidate Details</h1>
        <Button
          variant="outline"
          className="bg-teal-100 text-teal-800 hover:bg-teal-200 font-medium rounded-full px-6"
        >
          Auto Selection
        </Button>
      </div>

      <div className="border-b pb-6">
        <div className="flex items-center gap-6">
          <Avatar className="h-20 w-20">
            <img
              src="/api/placeholder/150/150"
              alt="Celine Fransisca"
              className="object-cover"
            />
          </Avatar>

          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">Celine Fransisca</h2>
                <p className="text-gray-600">apply as UI/UX Designer</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 pr-4 border-r">
                  <div className="text-teal-500 w-8 h-8 rounded-full flex items-center justify-center">
                    <Check className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-semibold">80%</span> matched with us
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Mail className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Calendar className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-6 border-b">
        <h3 className="text-xl font-bold mb-4">About</h3>
        <p className="text-gray-700">
          I'm Hernandez, 3 years experienced UI/UX Designer based in Indonesia.
          I work previously on a tech startup that has 2 branches in Indonesia.
          The success key of UI/UX Design is to create a stable desi...
        </p>
      </div>

      <div className="py-6 border-b">
        <h3 className="text-xl font-bold mb-4">Related Experienced Tools</h3>
        <div className="flex flex-wrap gap-2">
          {[
            "Figma",
            "Framer",
            "Blender",
            "Adobe Photoshop",
            "Adobe Illustrator",
          ].map((tool) => (
            <Badge
              key={tool}
              variant="outline"
              className="px-4 py-2 rounded-full bg-gray-50"
            >
              {tool}
            </Badge>
          ))}
        </div>
      </div>

      <div className="py-6 border-b grid grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-4">Educational Experience</h3>
          <div>
            <p className="font-medium">Computer Science</p>
            <p className="font-bold">Gadjah Mada University</p>
            <p className="text-gray-600">August 2018 - May 2022</p>
            <p className="text-gray-600">Yogyakarta, Indonesia</p>
            <p className="text-gray-600">GPA: 3.65</p>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4">Latest Work Experience</h3>
          <div>
            <p className="font-medium">UI/UX Designer</p>
            <p className="font-bold">Microsoft Corporation</p>
            <p className="text-gray-600">
              April 2021 - current / Saint Paul, MN
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Created A/B testing for Microsoft 365 product</li>
              <li>Improved several features of the product</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="py-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Application Timeline</h3>
          <Button variant="link" className="text-gray-700">
            See details
          </Button>
        </div>

        <div className="flex justify-between gap-4">
          {[1, 2, 3, 4].map((step, i) => (
            <div key={step} className="flex-1">
              <div
                className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${i < 2 ? "bg-teal-500 text-white" : i === 2 ? "bg-black text-white" : "bg-gray-300 text-white"}`}
              >
                {i < 2 ? (
                  <Check className="h-6 w-6" />
                ) : (
                  <span className="text-lg font-medium">
                    {i === 2 ? "03" : "04"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
