import { useState, useEffect } from 'react'
import './App.css'

const BACKEND_URL = 'https://untidy-oasis-gorgeous.ngrok-free.dev';

function App() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingVolunteers = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/volunteers/pending`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      const json = await res.json();
      if (json.success) {
        setVolunteers(json.data);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to fetch pending volunteers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingVolunteers();
  }, []);

  const handleVerify = async (id, name) => {
    if (!window.confirm(`Are you sure you want to verify ${name}?`)) return;
    
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/volunteers/${id}/verify`, {
        method: 'PATCH',
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      
      if (res.ok) {
        alert(`${name} has been verified and can now accept tasks!`);
        fetchPendingVolunteers(); // refresh list
      }
    } catch (err) {
      console.error(err);
      alert("Verification failed.");
    }
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>🚔 Shirva Police - Volunteer Admin Dashboard</h1>
        <p>Review and verify volunteers to ensure community safety.</p>
      </header>

      <main className="admin-main">
        <h2>Pending Verification ({volunteers.length})</h2>
        
        {loading ? (
          <p>Loading volunteers...</p>
        ) : volunteers.length === 0 ? (
          <p className="empty-state">No pending volunteers to verify.</p>
        ) : (
          <div className="grid">
            {volunteers.map(v => (
              <div key={v.id} className="card">
                <h3>{v.full_name}</h3>
                <div className="details">
                  <p><strong>Phone:</strong> {v.phone_number}</p>
                  <p><strong>Aadhar Number:</strong> {v.aadhar_number || "1234-5678-9012"}</p>
                  <p><strong>Medical Cert:</strong> {v.is_medical_certified ? "Yes" : "No"}</p>
                  <p><strong>Joined:</strong> {new Date(v.created_at).toLocaleDateString()}</p>
                </div>
                <button 
                  className="verify-btn" 
                  onClick={() => handleVerify(v.id, v.full_name)}
                >
                  ✅ Verify Volunteer
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
