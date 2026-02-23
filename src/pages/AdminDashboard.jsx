import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { subscribeToItemsByRegion, deleteItem } from "../services/itemService";
import { subscribeToAllRequestsByRegion, updateBorrowRequestStatus } from "../services/borrowService";
import { toast } from "react-toastify";

const AdminDashboard = () => {
  const { regionId, role } = useAuth();
  const [regionItems, setRegionItems] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('inventory');

  // 1. Fetch Items
  useEffect(() => {
    if (!regionId && role !== "super_admin") return;

    const unsubscribeItems = subscribeToItemsByRegion(regionId, (items) => {
      setRegionItems(items);
    });

    return () => unsubscribeItems();
  }, [regionId, role]);

  // 2. Fetch Requests separately
  useEffect(() => {
    if (!regionId && role !== "super_admin") return;

    const unsubscribeRequests = subscribeToAllRequestsByRegion(regionId, (requests) => {
      setAllRequests(requests);
    });

    return () => unsubscribeRequests();
  }, [regionId, role]);

  // 3. Derive Region Requests locally to avoid closure/dependency loop issues
  const regionRequests = React.useMemo(() => {
    if (regionId && role !== "super_admin") {
      const itemIdsInRegion = new Set(regionItems.map(i => i.id));
      return allRequests.filter(req => itemIdsInRegion.has(req.itemId));
    }
    return allRequests;
  }, [allRequests, regionItems, regionId, role]);

  if (role !== "admin" && role !== "super_admin") {
    return <div className="page-content">Access Denied: Admins Only</div>;
  }

  const handleDeleteItem = async (itemId, imageUrl) => {
    if (window.confirm("ADMIN ACTION: Are you sure you want to completely remove this item from the platform?")) {
      try {
        await deleteItem(itemId, imageUrl);
        toast.success("Item administratively deleted.");
      } catch (err) {
        toast.error("Failed to delete item.");
      }
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (window.confirm("ADMIN ACTION: Are you sure you want to cancel this transaction?")) {
      try {
        await updateBorrowRequestStatus(requestId, "declined");
        toast.success("Transaction cancelled by admin.");
      } catch (err) {
        toast.error("Failed to cancel transaction.");
      }
    }
  };

  return (
    <div className="admin-dashboard page-content">
      <div className="page-header">
        <h1>{role === "super_admin" ? "Global" : "Regional"} Governor Dashboard</h1>
        <p>Control Center: <strong>{regionId || "All Regions (Super Admin)"}</strong></p>
      </div>

      <div className="stats-section">
        <div className="stat glass">
          <h3>{regionItems.length}</h3>
          <p>Total Items Registered</p>
        </div>
        <div className="stat glass">
          <h3>{regionItems.filter(i => i.availability).length}</h3>
          <p>Items Currently Available</p>
        </div>
        <div className="stat glass">
          <h3>{regionRequests.length}</h3>
          <p>Lifetime Borrow Requests</p>
        </div>
        <div className="stat glass">
          <h3>{regionRequests.filter(r => r.status === 'pending').length}</h3>
          <p>Pending Requests</p>
        </div>
      </div>

      <div className="admin-controls glass" style={{ margin: '2rem auto', maxWidth: '1000px', padding: '1rem', display: 'flex', gap: '1rem', borderRadius: '12px' }}>
        <button 
          className={`btn ${activeTab === 'inventory' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('inventory')}
        >
          Manage Inventory
        </button>
        <button 
           className={`btn ${activeTab === 'requests' ? 'btn-primary' : 'btn-secondary'}`}
           onClick={() => setActiveTab('requests')}
        >
          Monitor Transactions
        </button>
      </div>

      <div className="admin-tables-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {activeTab === 'inventory' && (
          <div className="table-responsive glass" style={{ borderRadius: '12px', overflow: 'hidden' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ backgroundColor: 'rgba(0,0,0,0.3)', color: 'var(--primary)' }}>
                <tr>
                  <th style={{ padding: '1rem' }}>Item Name</th>
                  <th style={{ padding: '1rem' }}>Owner</th>
                  <th style={{ padding: '1rem' }}>Category</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem' }}>Admin Actions</th>
                </tr>
              </thead>
              <tbody>
                {regionItems.length === 0 ? (
                  <tr><td colSpan="5" style={{ padding: '1rem', textAlign: 'center' }}>No items found.</td></tr>
                ) : (
                  regionItems.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      <td style={{ padding: '1rem', color: 'var(--text)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                           {item.imageUrl ? <img src={item.imageUrl} alt="icon" style={{width: '30px', height: '30px', borderRadius: '4px', objectFit: 'cover'}}/> : <span style={{fontSize: '1.5rem'}}>{item.image || "📦"}</span>}
                           {item.name}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text)' }}>{item.ownerName}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{item.category}</td>
                      <td style={{ padding: '1rem' }}>
                         <span className={`status-badge ${item.availability ? 'status-accepted' : 'status-declined'}`}>
                            {item.availability ? "Available" : "Checked Out"}
                         </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <button 
                          className="btn btn-secondary" 
                          style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', borderColor: 'transparent', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                          onClick={() => handleDeleteItem(item.id, item.imageUrl)}
                        >
                          Force Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'requests' && (
           <div className="table-responsive glass" style={{ borderRadius: '12px', overflow: 'hidden' }}>
           <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
             <thead style={{ backgroundColor: 'rgba(0,0,0,0.3)', color: 'var(--primary)' }}>
               <tr>
                 <th style={{ padding: '1rem' }}>Item Requested</th>
                 <th style={{ padding: '1rem' }}>Borrower</th>
                 <th style={{ padding: '1rem' }}>Dates</th>
                 <th style={{ padding: '1rem' }}>Status</th>
                 <th style={{ padding: '1rem' }}>Admin Actions</th>
               </tr>
             </thead>
             <tbody>
               {regionRequests.length === 0 ? (
                 <tr><td colSpan="5" style={{ padding: '1rem', textAlign: 'center' }}>No transaction history found.</td></tr>
               ) : (
                 regionRequests.map((req) => (
                   <tr key={req.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                     <td style={{ padding: '1rem', color: 'var(--text)' }}><strong>{req.itemName}</strong><br/><small style={{color: 'var(--text-muted)'}}>from {req.ownerName}</small></td>
                     <td style={{ padding: '1rem', color: 'var(--text)' }}>{req.borrowerName}</td>
                     <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        In: {new Date(req.startDate).toLocaleDateString()}<br/>
                        Out: {new Date(req.endDate).toLocaleDateString()}
                     </td>
                     <td style={{ padding: '1rem' }}>
                        <span className={`status-badge status-${req.status}`}>
                           {req.status}
                        </span>
                     </td>
                     <td style={{ padding: '1rem' }}>
                        {(req.status === 'pending' || req.status === 'accepted') && (
                          <button 
                            className="btn btn-secondary" 
                            style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', borderColor: 'transparent', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                            onClick={() => handleCancelRequest(req.id)}
                          >
                            Force Cancel
                          </button>
                        )}
                     </td>
                   </tr>
                 ))
               )}
             </tbody>
           </table>
         </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
