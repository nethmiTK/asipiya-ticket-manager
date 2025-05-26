import React from 'react'

const SupervisorAssign = ({onClose}) => {
  return (
    <div className="fixed inset-0 backdrop-grayscale-100 backdrop-opacity-150 backdrop-blur-lg flex justify-center items-center">
      <div className="bg-white p-6 rounded-xl w-[90%] max-w-6xl max-h-[90vh] overflow-y-auto shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Assign Supervisor</h2>
          <button
            onClick={onClose}
            className="text-xl font-bold hover:text-red-600"
          >
            ×
          </button>
        </div>

        <table className="w-full table-auto border">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2">Company Name</th>
              <th className="p-2">Title</th>
              <th className="p-2">Status</th>
              <th className="p-2">Supervisor Name</th>
              <th className="p-2">Priority</th>
              <th className="p-2">Assign</th>
            </tr>
          </thead>
          <tbody>
              <tr className="border-t">
                <td className="p-2">Asipiya Soft Solution</td>
                <td className="p-2">A bud in a system refers to a potential point of growth or
              improvement within an existing structure. It represents an
              opportunity where a new feature, enhancement, or idea can be
              introduced without disrupting the core functionality.</td>
                <td className="p-2">
                    <select className="border border-gray-300 rounded px-3 py-2">
                        <option>Pending</option>
                        <option>Progress</option>
                        <option>Resolved</option>
                    </select>
                </td>
                <td className="p-2">
                    <input type="text" className='rounded px-3 py-2 border border-gray-300 outline-none text-base'/>
                </td>
                <td className="p-2">
                    <select className="border border-gray-300 rounded px-3 py-2">
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                    </select></td>
                <td className="p-2">
                  <button className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
                    Assign
                  </button>
                </td>
              </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SupervisorAssign