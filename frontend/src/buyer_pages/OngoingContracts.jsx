import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  CheckCircle,
  ShieldCheck,
  MessageSquare,
  X,
  XCircle,
  ImageIcon,
  HardDriveUpload,
  CalendarDays,
  FileText,
  Loader2,
  AlertCircle,
  ThumbsDown,
  Inbox,
  User,
  Clock
} from "lucide-react";
import { useAuthStore } from "../authStore";
import NegotiationChatModal from "../farmer_business_components/NegotiationChatModal";
import { API_BASE_URL } from "../api/apiConfig";

// --- HELPER COMPONENTS (Unchanged) ---

const ProgressBar = ({ value, max, colorClass, label }) => {
  const widthPercentage = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between items-baseline">
        <label className="text-sm font-medium text-gray-600">{label}</label>
        <p className="text-xs text-gray-500">
          ₹{parseFloat(value).toLocaleString("en-IN")} / ₹
          {parseFloat(max).toLocaleString("en-IN")}
        </p>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
        <div
          className={`${colorClass} h-2.5 rounded-full transition-all duration-500`}
          style={{ width: `${widthPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

const ImageModal = ({ src, onClose }) => (
  <div
    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
    onClick={onClose}
  >
    <button className="absolute top-4 right-4 text-white p-2 rounded-full bg-black/50 hover:bg-black/75 transition-colors z-10">
      <X size={24} />
    </button>
    <img
      src={src}
      alt="Enlarged update"
      className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    />
  </div>
);

const EscrowSummary = ({ contract }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <h3 className="text-lg font-semibold flex items-center mb-4 text-gray-800">
      <ShieldCheck size={20} className="mr-2 text-green-600" />
      Escrow Summary
    </h3>
    <div className="space-y-4">
      <div>
        <p className="text-sm text-gray-500">Total Contract Value</p>
        <p className="text-3xl font-bold text-gray-900">
          ₹{parseFloat(contract.totalValue).toLocaleString("en-IN")}
        </p>
      </div>
      <ProgressBar
        value={contract.escrowAmount}
        max={contract.totalValue}
        colorClass="bg-yellow-400"
        label="Funds Locked in Escrow"
      />
      <ProgressBar
        value={contract.amountPaid}
        max={contract.totalValue}
        colorClass="bg-green-500"
        label="Paid to Farmer"
      />
    </div>
  </div>
);

const VerticalMilestoneTracker = ({ milestones, onReleasePayment, submittingMilestoneId }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <h3 className="text-lg font-semibold text-gray-800">Milestone Progress</h3>
    <div className="mt-6">
      <ul className="relative space-y-8">
        <div className="absolute left-3 top-0 h-full w-0.5 bg-gray-200"></div>
        {milestones.map((m) => {
          const isDone = m.done;
          const isPaid = m.paid;
          const isReadyForPayment = isDone && !isPaid;
          const isLoading = submittingMilestoneId === m.id;
          let circleClass = "bg-gray-300";
          if (isDone) circleClass = "bg-green-500";
          return (
            <li key={m.id} className="flex items-start space-x-4">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center z-10 flex-shrink-0 ${circleClass} ${
                  isReadyForPayment && !isLoading ? "animate-pulse" : ""
                }`}
              >
                {isDone && <CheckCircle size={16} className="text-white" />}
              </div>
              <div className="flex-1 -mt-1">
                <p className={`font-medium ${isDone ? "text-gray-800" : "text-gray-500"}`}>
                  {m.name}
                </p>
                <p className={`text-sm ${isPaid ? "text-green-600 font-semibold" : "text-gray-500"}`}>
                  ₹{parseFloat(m.amount).toLocaleString("en-IN")} {isPaid && "(Paid)"}
                </p>
                {isReadyForPayment && (
                  <button
                    onClick={() => onReleasePayment(m.id)}
                    disabled={isLoading}
                    className="mt-2 bg-blue-600 text-white text-xs font-bold py-1.5 px-4 rounded-full hover:bg-blue-700 transition-colors shadow-sm disabled:bg-blue-300 flex items-center justify-center w-[140px]"
                  >
                    {isLoading ? <Loader2 size={14} className="animate-spin" /> : 'Release Payment'}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  </div>
);


// --- MAIN UNIFIED COMPONENT ---
const BuyerContractsPage = () => {
  const [activeTab, setActiveTab] = useState("negotiating");
  const [contracts, setContracts] = useState({ ongoing: [], negotiating: [], rejected: [] });
  const [loading, setLoading] = useState({ ongoing: true, negotiating: true, rejected: true });
  const [error, setError] = useState(null);
  const [selectedNegotiation, setSelectedNegotiation] = useState(null);
  
  const [selectedContract, setSelectedContract] = useState(null);
  const [selectedRejectedContract, setSelectedRejectedContract] = useState(null);
  const [modalImage, setModalImage] = useState(null);
  const [submittingMilestoneId, setSubmittingMilestoneId] = useState(null);

  const token = useAuthStore((state) => state.token);

  const fetchAllData = useCallback(async () => {
    if (!token) {
      setError("Authentication error. Please log in again.");
      setLoading({ ongoing: false, negotiating: false, rejected: false });
      return;
    }
    setLoading({ ongoing: true, negotiating: true, rejected: true });
    setError(null);

    try {
      const headers = { Authorization: `Bearer ${token}` };

      const negotiatingPromise = fetch(`${API_BASE_URL}/api/contracts/my-contracts?status=negotiating`, { headers });
      const ongoingPromise = fetch(`${API_BASE_URL}/api/contracts/ongoing`, { headers });
      const rejectedPromise = fetch(`${API_BASE_URL}/api/contracts/my-contracts?status=rejected`, { headers });

      const responses = await Promise.all([negotiatingPromise, ongoingPromise, rejectedPromise]);

      for (const response of responses) {
        if (!response.ok) {
          throw new Error(`Failed to fetch contracts. Status: ${response.status}`);
        }
      }

      const [negotiatingData, ongoingRawData, rejectedData] = await Promise.all(responses.map(res => res.json()));

      const formattedOngoingContracts = ongoingRawData.map((item) => ({
        id: item.id,
        crop: item.listing.crop_type,
        farmer: item.farmer.full_name,
        totalValue: parseFloat(item.total_value),
        escrowAmount: parseFloat(item.escrow_amount),
        amountPaid: parseFloat(item.amount_paid),
        delivery: new Date(item.listing.harvest_date).toLocaleDateString("en-IN"),
        milestones: item.milestones
          .map((m) => ({
            id: m.id,
            name: m.name,
            amount: parseFloat(m.amount),
            done: m.is_complete,
            paid: m.payment_released,
            update_text: m.update_text,
            image_url: m.image_url,
            created_at: m.created_at,
          }))
          .sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
      }));

      setContracts({
        negotiating: negotiatingData,
        ongoing: formattedOngoingContracts,
        rejected: rejectedData,
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading({ ongoing: false, negotiating: false, rejected: false });
    }
  }, [token]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleAccept = async (contractId) => {
    if (!confirm("Are you sure you want to accept these terms?")) return;
    try {
      await fetch(`${API_BASE_URL}/api/contracts/${contractId}/accept-offer`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }
      });
      alert("Offer accepted! The contract is now ongoing.");
      fetchAllData();
    } catch (err) { alert(`Error: ${err.message}`); }
  };

  const handleReject = async (contractId) => {
    if (!confirm("Are you sure you want to reject this offer?")) return;
    try {
      await fetch(`${API_BASE_URL}/api/contracts/${contractId}/reject-offer`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }
      });
      alert("Offer rejected.");
      fetchAllData();
    } catch (err) { alert(`Error: ${err.message}`); }
  };

  const handleReleasePayment = async (milestoneId) => {
    setSubmittingMilestoneId(milestoneId);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/milestones/${milestoneId}/release-payment`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error((await response.json()).detail || "Payment release failed");
      
      alert("Payment released successfully!");
      await fetchAllData();
      setSelectedContract(null);
    } catch (err) {
      setError(err.message);
      alert(`Error: ${err.message}`);
    } finally {
      setSubmittingMilestoneId(null);
    }
  };

  const tabs = [
    { key: 'negotiating', title: 'In Negotiation', icon: <MessageSquare size={18} />, color: 'blue' },
    { key: 'ongoing', title: 'Ongoing Contracts', icon: <FileText size={18} />, color: 'green' },
    { key: 'rejected', title: 'Rejected Proposals', icon: <ThumbsDown size={18} />, color: 'red' }
  ];

  const currentTabData = contracts[activeTab];
  const currentLoading = loading[activeTab];
  const currentDetailedContract = selectedContract ? contracts.ongoing.find(c => c.id === selectedContract.id) : null;

  return (
    <div className="space-y-6 bg-gray-50 p-4 md:p-8 min-h-screen">
      {modalImage && <ImageModal src={modalImage} onClose={() => setModalImage(null)} />}
      {selectedNegotiation && (
        <NegotiationChatModal
          proposal={selectedNegotiation}
          onClose={() => setSelectedNegotiation(null)}
          onOfferUpdated={fetchAllData}
        />
      )}

      <header>
        <h1 className="text-3xl font-bold text-gray-900">Your Contracts</h1>
        <p className="text-gray-600 mt-1">Manage all your agricultural agreements in one place.</p>
      </header>

      {error && (
        <div className="flex items-start bg-red-50 text-red-700 p-4 rounded-lg shadow-sm">
          <AlertCircle size={24} className="mr-3 flex-shrink-0" />
          <div><p className="font-semibold">An Error Occurred</p><p className="text-sm">{error}</p></div>
        </div>
      )}

      <div className="bg-white p-2 rounded-lg shadow-sm flex flex-col sm:flex-row">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => {
                setActiveTab(tab.key);
                setSelectedContract(null);
                setSelectedRejectedContract(null);
            }}
            className={`flex-1 flex items-center justify-center p-3 rounded-md text-sm font-semibold border-2 transition-colors duration-200 ${
              activeTab === tab.key
                ? `bg-${tab.color}-600 text-white border-${tab.color}-600`
                : `text-gray-600 hover:bg-gray-100 border-transparent`
            }`}
          >
            {tab.icon}
            <span className="ml-2">{tab.title}</span>
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}`}>
              {loading[tab.key] ? '...' : contracts[tab.key]?.length || 0}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-6">
        {currentLoading ? (
          <div className="flex justify-center items-center p-16">
            <Loader2 className="animate-spin text-gray-400" size={32} />
          </div>
        ) : (
          <div>
            {/* Ongoing Tab Logic (Remains Horizontal List as requested) */}
            {activeTab === 'ongoing' && (
              currentDetailedContract ? (
                <div>
                  <button onClick={() => setSelectedContract(null)} className="flex items-center text-green-700 font-semibold hover:underline mb-4">
                    <ArrowLeft size={18} className="mr-1" /> Back to All Contracts
                  </button>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                      <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-3xl font-bold text-gray-900">{currentDetailedContract.crop}</h2>
                        <p className="text-lg text-gray-600">with {currentDetailedContract.farmer}</p>
                      </div>
                      <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold flex items-center text-gray-800">
                          <MessageSquare size={18} className="mr-2 text-green-600" /> Farmer Updates & Milestones
                        </h3>
                        <div className="mt-4 relative space-y-6">
                          <div className="absolute left-3 top-2 h-[calc(100%-1rem)] w-0.5 bg-gray-200 z-0"></div>
                          {currentDetailedContract.milestones.filter(m => m.update_text || m.image_url).map((milestone, idx) => (
                            <div key={idx} className="relative flex items-start space-x-4 z-10">
                              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0"><HardDriveUpload size={14} className="text-white"/></div>
                              <div className="p-4 bg-gray-50 rounded-md border flex-1">
                                <p className="text-xs font-semibold text-gray-500">{new Date(milestone.created_at).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                <p className="text-base font-semibold text-gray-700 mt-2">{milestone.name}</p>
                                <p className="text-gray-700 mt-1">{milestone.update_text}</p>
                                {milestone.image_url && <div onClick={() => setModalImage(milestone.image_url)} className="mt-3 rounded-lg w-full h-64 bg-cover bg-center cursor-pointer group relative" style={{ backgroundImage: `url(${milestone.image_url})` }}><div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><ImageIcon size={32} className="text-white"/></div></div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <EscrowSummary contract={currentDetailedContract} />
                      <VerticalMilestoneTracker milestones={currentDetailedContract.milestones} onReleasePayment={handleReleasePayment} submittingMilestoneId={submittingMilestoneId} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentTabData.length === 0 ? <div className="text-center py-10 text-gray-500"><Inbox size={32} className="mx-auto mb-2" /><p>No ongoing contracts.</p></div>
                  : currentTabData.map((c) => <div key={c.id} onClick={() => setSelectedContract(c)} className="p-5 bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-lg hover:ring-2 hover:ring-green-500 transition-all duration-200"><div className="flex justify-between items-start"><div><h3 className="font-bold text-lg text-green-700">{c.crop}</h3><p className="text-sm text-gray-500">with {c.farmer}</p></div><div className="text-right flex-shrink-0 ml-4"><p className="font-semibold text-lg text-gray-800">₹{c.totalValue.toLocaleString('en-IN')}</p><p className="text-sm text-gray-500 flex items-center justify-end"><CalendarDays size={14} className="mr-1.5" /> Due: {c.delivery}</p></div></div><div className="mt-4"><ProgressBar value={c.amountPaid} max={c.totalValue} colorClass="bg-green-500" label="Payment Progress" /></div></div>)}
                </div>
              )
            )}

            {/* Rejected Tab Logic (Updated to Grid/Box) */}
            {activeTab === 'rejected' && (
              selectedRejectedContract ? (
                // --- DETAIL VIEW for selected rejected contract ---
                <div>
                  <button onClick={() => setSelectedRejectedContract(null)} className="flex items-center text-red-700 font-semibold hover:underline mb-4">
                    <ArrowLeft size={18} className="mr-1" /> Back to All Rejected Proposals
                  </button>
                  <div className="bg-white p-6 rounded-lg shadow-sm border-t-4 border-red-500">
                    <div className="border-b pb-4 mb-4">
                        <h2 className="text-3xl font-bold text-gray-900">{selectedRejectedContract.listing?.crop_type || 'N/A'}</h2>
                        <p className="text-lg text-gray-600">with {selectedRejectedContract.farmer?.full_name || 'Unknown Farmer'}</p>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-500">Last Proposed Value</p>
                            <p className="text-xl font-semibold text-gray-800">₹{(parseFloat(selectedRejectedContract.total_value) || 0).toLocaleString('en-IN')}</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-md">
                           <h4 className="font-semibold text-red-800 flex items-center"><XCircle size={18} className="mr-2"/> Rejection Reason</h4>
                           <p className="text-red-700 mt-1">{selectedRejectedContract.rejection_reason || "No specific reason was provided."}</p>
                        </div>
                    </div>
                  </div>
                </div>
              ) : (
                // --- GRID VIEW for rejected contracts ---
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentTabData.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-gray-500">
                      <Inbox size={32} className="mx-auto mb-2" />
                      <p>No rejected proposals.</p>
                    </div>
                  ) : (
                    currentTabData.map((contract) => (
                      <div 
                        key={contract.id} 
                        onClick={() => setSelectedRejectedContract(contract)} 
                        className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group"
                      >
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500" />
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold text-xl text-gray-800 group-hover:text-red-600 transition-colors">
                              {contract.listing?.crop_type || 'N/A'}
                            </h3>
                            <div className="bg-red-100 p-1.5 rounded-full">
                              <ThumbsDown size={16} className="text-red-600" />
                            </div>
                          </div>
                          
                          <div className="flex items-center text-gray-600 mb-2">
                             <User size={16} className="mr-2" />
                             <span className="text-sm">with {contract.farmer?.full_name || 'Unknown Farmer'}</span>
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</span>
                            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">Rejected</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )
            )}
            
            {/* Negotiating Tab Logic (Updated to Grid/Box) */}
            {activeTab === 'negotiating' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentTabData.length === 0 ? (
                      <div className="col-span-full text-center py-10 text-gray-500">
                        <Inbox size={32} className="mx-auto mb-2" />
                        <p>No contracts in negotiation.</p>
                      </div>
                    ) : (
                      currentTabData.map((contract) => {
                        const isMyTurn = contract.last_offer_by === 'farmer';
                        return (
                            <div 
                              key={contract.id} 
                              className={`bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-full border hover:shadow-xl transition-all duration-300 ${isMyTurn ? 'border-green-200 ring-1 ring-green-100' : 'border-yellow-200 ring-1 ring-yellow-100'}`}
                            >
                                <div className={`h-1.5 w-full ${isMyTurn ? 'bg-green-500' : 'bg-yellow-400'}`} />
                                <div className="p-5 flex-1 flex flex-col">
                                  <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-xl text-gray-900">{contract.listing?.crop_type}</h3>
                                    {isMyTurn ? (
                                      <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full animate-pulse">Action Required</span>
                                    ) : (
                                      <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded-full flex items-center">
                                        <Clock size={12} className="mr-1" /> Waiting
                                      </span>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center text-gray-500 mb-4 text-sm">
                                    <User size={16} className="mr-2" />
                                    <span>{contract.farmer?.full_name}</span>
                                  </div>

                                  <div className="mt-auto pt-4 border-t border-gray-100">
                                      {isMyTurn ? (
                                          <div className="space-y-3">
                                              <p className="text-sm font-medium text-green-700 text-center bg-green-50 py-1 rounded">
                                                New offer received
                                              </p>
                                              <div className="grid grid-cols-2 gap-2">
                                                  <button onClick={() => handleAccept(contract.id)} className="bg-green-600 text-white text-sm font-bold py-2 px-3 rounded-lg hover:bg-green-700 shadow-sm transition-colors">Accept</button>
                                                  <button onClick={() => handleReject(contract.id)} className="bg-red-50 text-red-600 text-sm font-bold py-2 px-3 rounded-lg hover:bg-red-100 border border-red-200 transition-colors">Reject</button>
                                              </div>
                                              <button onClick={() => setSelectedNegotiation(contract)} className="w-full bg-gray-800 text-white text-sm font-bold py-2 px-3 rounded-lg hover:bg-gray-900 shadow-sm transition-colors flex items-center justify-center">
                                                <MessageSquare size={16} className="mr-2" /> Negotiate
                                              </button>
                                          </div>
                                      ) : (
                                          <div className="space-y-3">
                                              <p className="text-sm font-medium text-yellow-700 text-center bg-yellow-50 py-1 rounded">
                                                Waiting for response
                                              </p>
                                              <button onClick={() => setSelectedNegotiation(contract)} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 shadow-sm transition-colors flex items-center justify-center">
                                                <MessageSquare size={16} className="mr-2" /> Open Chat
                                              </button>
                                          </div>
                                      )}
                                  </div>
                                </div>
                            </div>
                        )
                    })
                  )}
                </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerContractsPage;