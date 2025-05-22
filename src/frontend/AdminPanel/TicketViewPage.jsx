import React from 'react'

const TicketViewPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center">
       
      <div className="bg-white shadow-lg rounded-lg p-10 w-full max-w-3xl ml-105">
        <h2 className="text-2xl font-semibold mb-8 text-center">Complains</h2>

        <div className="space-y-6">

          <div className="flex items-start">
            <label className="w-40 font-medium">Company Name</label>
            <div className="flex-1 bg-gray-200 px-4 py-2 rounded">
              Asipiya Soft Solutions Pvt Ltd
            </div>
          </div>

          <div className="flex items-start">
            <label className="w-40 font-medium">User Name</label>
            <div className="flex-1 bg-gray-200 px-4 py-2 rounded">
              Mr. Kamal
            </div>
          </div>

          <div className="flex items-start">
            <label className="w-40 font-medium">Description</label>
            <div className="flex-1 bg-gray-200 px-4 py-2 rounded max-h-40 overflow-y-auto">
              A bud in a system refers to a potential point of growth or
              improvement within an existing structure. It represents an
              opportunity where a new feature, enhancement, or idea can be
              introduced without disrupting the core functionality.
            </div>
          </div>

          <div className="flex items-start">
            <label className="w-40 font-medium">Date & Time</label>
            <div className="flex-1 bg-gray-200 px-4 py-2 rounded">
              20/05/2025 14:34:19
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-10 gap-86">
          <button className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded">
            Reject
          </button>
          <button className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded">
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}

export default TicketViewPage