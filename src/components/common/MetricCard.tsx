import { FileCheck, MessageCircle, MessageSquare, Send } from "lucide-react";
import { useState } from "react";

export default function MetricCard() {
  const [] = useState({
    jobPosts: 1,
    activeInterviews: 1,
    totalInterviews: 1,
    candidatesInvited: 3,
    awaitingFeedback: 0,
    candidatesEvaluated: 1,
  });

  return (
    <div className="grid grid-cols-1  sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5">
      {/* Job Posts Card */}
      <div className="rounded-lg overflow-hidden bg-emerald-900 text-white row-span-2 relative">
        <div className="absolute inset-0 bg-emerald-800 rounded-full w-64 h-64 -bottom-16 -right-16 opacity-30" />
        <div className="p-8 relative z-10 h-full flex flex-col">
          <div className="bg-emerald-100 mb-3 text-emerald-800 rounded-lg p-4 inline-block w-16 h-16 flex items-center justify-center">
            <FileCheck size={30} />
          </div>
          <div className="mt-auto mb-8">
            <h1 className="text-7xl font-bold">1</h1>
            <p className="text-xl mt-2 text-emerald-100 font-medium">
              Job posts
            </p>
          </div>
        </div>
      </div>

      {/* Active Interview Card */}
      <div className="bg-white rounded-lg shadow-sm p-6 font-medium">
        <div className="flex justify-between items-start h-full">
          <div className="text-6xl font-bold">1</div>
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 p-3 rounded-lg">
              <MessageSquare size={20} className="text-gray-600" />
            </div>
            <div className="text-gray-500 text-base">
              Active Interview
              <br />
              Responses
            </div>
          </div>
        </div>
      </div>

      {/* Candidates Invited Card */}
      <div className="bg-white rounded-lg shadow-sm p-6 font-medium border-r-4 border-blue-200">
        <div className="flex justify-between items-start h-full">
          <div className="text-6xl font-bold">3</div>
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 p-3 rounded-lg">
              <Send size={20} className="text-gray-600" />
            </div>
            <div className="text-gray-500 text-base">Candidates Invited</div>
          </div>
        </div>
      </div>

      {/* Total Interview Card */}
      <div className="bg-white rounded-lg shadow-sm p-6 font-medium">
        <div className="flex justify-between items-start h-full">
          <div className="text-6xl font-bold">1</div>
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 p-3 rounded-lg">
              <MessageCircle size={20} className="text-gray-600" />
            </div>
            <div className="text-gray-500 text-base">
              Total Interview
              <br />
              Responses
            </div>
          </div>
        </div>
      </div>

      {/* Awaiting Feedback Card */}
      <div className="bg-white rounded-lg shadow-sm p-6 font-medium border-r-4 border-gray-200">
        <div className="flex justify-between items-start h-full">
          <div className="text-6xl font-bold">0</div>
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 p-3 rounded-lg">
              <MessageCircle size={20} className="text-gray-600" />
            </div>
            <div className="text-gray-500 text-base">Awaiting Feedback</div>
          </div>
        </div>
      </div>
    </div>
  );
}
