import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { IoArrowBack } from 'react-icons/io5';
import { IoClose } from 'react-icons/io5';

const TicketViewPage = ({ ticketId, popupMode = false, onClose }) => {
  const { id: routeId } = useParams();
  const navigate = useNavigate();
  const id = popupMode ? ticketId : routeId;

  const [ticketData, setTicketData] = useState(null);
  const [evidenceList, setEvidenceList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ticketRes = await axios.get(`http://localhost:5000/api/ticket_view/${id}`);
        setTicketData(ticketRes.data);

        const evidenceRes = await axios.get(`http://localhost:5000/evidence/${id}`);
        setEvidenceList(evidenceRes.data);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <div className="text-center p-4">Loading...</div>;

  const handleReject = async () => {
    try {
      const response = await axios.put(`http://localhost:5000/api/ticket_status/${id}`, {
        status: 'Reject',
      });

      if (response.status === 200 || response.status === 204) {
        toast.success('Ticket rejected successfully');
        popupMode ? onClose() : navigate(-1);
      } else {
        toast.error('Failed to reject the ticket');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred while rejecting the ticket');
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-auto relative">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => (popupMode ? onClose() : navigate(-1))}
          className="flex items-center text-gray-600 hover:text-gray-900 p-2 rounded-sm font-bold"
        >
          <IoArrowBack className="mr-2 " /> Back
        </button>
      </div>

      <h2 className="text-2xl font-semibold text-center mb-8">Complain Details</h2>

      <div className="space-y-6">
        {[
          ['System Name', ticketData.SystemName],
          ['User Email', ticketData.UserEmail],
          ['Category', ticketData.CategoryName],
          ['Description', ticketData.Description],
          ['Date & Time', new Date(ticketData.DateTime).toLocaleString()],
        ].map(([label, value]) => (
          <div key={label} className="flex">
            <label className="w-1/3 font-medium">{label}</label>
            <div className="w-2/3 bg-gray-100 p-2 rounded">{value}</div>
          </div>
        ))}

        {evidenceList.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Evidence Files</h3>
            <div className="flex flex-wrap gap-4">
              {evidenceList.map((evi) => {
                const filePath = evi.FilePath.replace(/\\/g, '/');
                const fileName = filePath.split('/').pop();
                const fileUrl = `http://localhost:5000/${filePath}`;

                const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName);
                const isVideo = /\.(mp4|webm|ogg)$/i.test(fileName);
                const isAudio = /\.(mp3|wav|ogg)$/i.test(fileName);
                const isPDF = /\.pdf$/i.test(fileName);
                const isDoc = /\.(docx?|xlsx?)$/i.test(fileName);

                return (
                  <div
                    key={evi.EvidenceID}
                    className="w-28 h-28 border rounded-lg p-2 shadow-md bg-gray-100 flex flex-col items-center justify-center overflow-hidden cursor-pointer"
                    onClick={() => setPreviewUrl(fileUrl)}
                    title="Click to preview"
                  >
                    {isImage ? (
                      <img
                        src={fileUrl}
                        alt={fileName}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : isVideo ? (
                      <video muted className="w-full h-full object-cover rounded">
                        <source src={fileUrl} />
                      </video>
                    ) : (
                      <div className="text-xs text-center truncate w-full px-1">{fileName}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center gap-4 mt-8 ml-85">
        <button
          onClick={handleReject}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded"
        >
          Reject
        </button>

        <button
          onClick={() => navigate(`/supervisor_assign/${id}`)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
        >
          Assign Supervisor
        </button>
      </div>

      {previewUrl && (
        <div className="fixed inset-0 z-50 bg-black/65 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg max-w-3xl w-full relative">
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
            >
              <IoClose size={24} />
            </button>

            {/\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(previewUrl) ? (
              <img src={previewUrl} alt="Preview" className="w-full max-h-[80vh] object-contain" />
            ) : /\.(mp4|webm|ogg)$/i.test(previewUrl) ? (
              <video controls className="w-full max-h-[80vh]">
                <source src={previewUrl} />
              </video>
            ) : /\.(mp3|wav|ogg)$/i.test(previewUrl) ? (
              <audio controls className="w-full mt-4">
                <source src={previewUrl} />
              </audio>
            ) : /\.(pdf|docx?|xlsx?)$/i.test(previewUrl) ? (
              <iframe src={previewUrl} className="w-full h-[80vh]" title="Document Preview" />
            ) : (
              <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                Download File
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketViewPage;
