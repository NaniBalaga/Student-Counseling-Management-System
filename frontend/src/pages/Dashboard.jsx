import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, FileText, Bell, User,
  Users, Settings, History, LogOut, Menu,
  LayoutDashboard, Mail, Phone, Calendar, BookOpen, Clock,
  CheckCircle, XCircle, Send, Plus, Activity, Trash2
} from "lucide-react";

// --- DYNAMIC NAVIGATION CONFIGURATION ---
const navConfig = {
  student: [
    { id: "home", label: "Home", icon: Home },
    { id: "requests", label: "Requests", icon: FileText },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "profile", label: "Profile", icon: User },
  ],
  admin: [
    { id: "home", label: "Home", icon: Home },
    { id: "peoples", label: "Peoples", icon: Users },
    { id: "total-requests", label: "Total Requests", icon: FileText },
    { id: "profile", label: "Profile", icon: User },
  ],
  counsellor: [
    { id: "home", label: "Home", icon: Home },
    { id: "all-requests", label: "All Requests", icon: FileText },
    { id: "profile", label: "Profile", icon: User },
  ],
  counceller: [
    { id: "home", label: "Home", icon: Home },
    { id: "all-requests", label: "All Requests", icon: FileText },
    { id: "profile", label: "Profile", icon: User },
  ]
};

// Helper to format dates nicely
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- NEW STATES FOR REQUEST FEATURE & ADMIN ---
  const [requests, setRequests] = useState([]);
  const [counsellors, setCounsellors] = useState([]);
  const [allUsers, setAllUsers] = useState([]); 
  
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [formData, setFormData] = useState({
    counsellorId: "",
    title: "",
    description: "",
    category: "Academic Issues",
    priority: "Medium"
  });
  const [replyText, setReplyText] = useState({});
  
  const [highlightedReqId, setHighlightedReqId] = useState(null);

  const API_BASE_URL = "http://localhost:5000/api";

  // AUTHENTICATION CHECK
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
    } else {
      setUser(JSON.parse(storedUser));
      setIsLoading(false);
    }
  }, [navigate]);

  // FETCH DATA BASED ON TAB AND ROLE
  useEffect(() => {
    if (!user) return;
    
    const userRole = user.role?.toLowerCase() || "student";
    
    if (["home", "requests", "notifications"].includes(activeTab) && userRole === "student") {
      fetchCounsellors();
      fetchUserRequests(userRole);
    } else if (["home", "all-requests"].includes(activeTab) && (userRole.includes("counsel") || userRole.includes("councel"))) {
      fetchUserRequests(userRole);
    } else if (["home", "total-requests", "peoples"].includes(activeTab) && userRole === "admin") {
      fetchUserRequests(userRole);
      fetchAllUsers(); 
    }
  }, [activeTab, user]);

  // --- API CALLS ---
  const fetchCounsellors = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/requests/counsellors`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setCounsellors(data);
      } else {
        setCounsellors([]);
      }
    } catch (error) {
      console.error("Error fetching counsellors", error);
      setCounsellors([]);
    }
  };

  const fetchUserRequests = async (roleOverride) => {
    try {
      const normalizedRole = roleOverride.includes("counsel") || roleOverride.includes("councel") ? "counsellor" : roleOverride;
      const res = await fetch(`${API_BASE_URL}/requests/user/${user._id}/${normalizedRole}`);
      const data = await res.json();
      if (Array.isArray(data)) setRequests(data);
    } catch (error) {
      console.error("Error fetching requests", error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/users`);
      const data = await res.json();
      if (Array.isArray(data)) setAllUsers(data);
    } catch (error) {
      console.error("Error fetching all users", error);
    }
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!formData.counsellorId) {
      alert("Please select a valid counsellor from the dropdown.");
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE_URL}/requests/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, studentId: user._id }),
      });
      if (res.ok) {
        alert("Request sent successfully!");
        setShowRequestForm(false);
        setFormData({ counsellorId: "", title: "", description: "", category: "Academic Issues", priority: "Medium" });
        fetchUserRequests(user.role.toLowerCase());
      }
    } catch (error) {
      console.error("Error sending request", error);
    }
  };

  const handleUpdateStatus = async (reqId, status) => {
    try {
      const res = await fetch(`${API_BASE_URL}/requests/status/${reqId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchUserRequests(user.role.toLowerCase());
    } catch (error) {
      console.error("Error updating status", error);
    }
  };

  const handleSendReply = async (reqId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/requests/reply/${reqId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: replyText[reqId] }),
      });
      if (res.ok) {
        alert("Reply sent successfully!");
        fetchUserRequests(user.role.toLowerCase());
      }
    } catch (error) {
      console.error("Error sending reply", error);
    }
  };

  const handleDeleteRequest = async (reqId) => {
    if (!window.confirm("Are you sure you want to permanently delete this request?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/requests/${reqId}`, { method: "DELETE" });
      if (res.ok) {
        fetchUserRequests("admin");
      }
    } catch (error) {
      console.error("Error deleting request", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === user._id) {
      alert("You cannot delete your own admin account.");
      return;
    }
    if (!window.confirm("Are you sure you want to permanently delete this user?")) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/auth/users/${userId}`, { method: "DELETE" });
      if (res.ok) {
        fetchAllUsers();
      }
    } catch (error) {
      console.error("Error deleting user", error);
    }
  };

  const handleNotificationClick = (reqId) => {
    setActiveTab("requests"); 
    setHighlightedReqId(reqId); 

    setTimeout(() => {
      const element = document.getElementById(`req-${reqId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);

    setTimeout(() => {
      setHighlightedReqId(null);
    }, 5000);
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setIsSidebarOpen(false);
  };

  if (isLoading || !user) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', background: '#0a0a0a', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner-container">
          <div className="premium-spinner"></div>
          <p style={{ marginTop: '20px', color: '#ffd700', fontWeight: '600', letterSpacing: '1px', fontSize: '12px' }}>LOADING...</p>
        </div>
        <style>{`
          .premium-spinner {
            width: 40px; height: 40px;
            border: 3px solid rgba(255, 215, 0, 0.1);
            border-left-color: #ffd700;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          .spinner-container { display: flex; flex-direction: column; align-items: center; }
        `}</style>
      </div>
    );
  }

  const normalizedRole = user.role?.toLowerCase().includes("councel") || user.role?.toLowerCase().includes("counsel") ? "counsellor" : user.role?.toLowerCase();
  const navItems = navConfig[normalizedRole] || navConfig.student;

  const notificationCount = requests.filter(req => req.status !== "Pending").length;

  // --- UI RENDERERS FOR DASHBOARD STATS (HOME TABS) ---

  const renderStudentHome = () => {
    const totalReq = requests.length;
    const pendingReq = requests.filter(r => r.status === "Pending").length;
    const completedReq = requests.filter(r => r.status === "Completed").length;

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="tab-container">
        <h2>Student Dashboard</h2>
        <p className="text-muted" style={{ marginTop: '-15px', marginBottom: '30px', textAlign: 'left' }}>Overview of your activity and requests.</p>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper"><FileText size={18} color="#ffd700"/></div>
            <div>
              <p className="stat-title">Total Requests</p>
              <h3 className="stat-value">{totalReq}</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper"><Clock size={18} color="#00bfff"/></div>
            <div>
              <p className="stat-title">Pending</p>
              <h3 className="stat-value">{pendingReq}</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper"><CheckCircle size={18} color="#00e676"/></div>
            <div>
              <p className="stat-title">Completed</p>
              <h3 className="stat-value">{completedReq}</h3>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderCounsellorHome = () => {
    const totalAssigned = requests.length;
    const pendingAction = requests.filter(r => r.status === "Pending" || r.status === "In Progress").length;
    const resolved = requests.filter(r => r.status === "Completed").length;

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="tab-container">
        <h2>Counsellor Dashboard</h2>
        <p className="text-muted" style={{ marginTop: '-15px', marginBottom: '30px', textAlign: 'left' }}>Your assigned student cases and workflow.</p>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper"><Users size={18} color="#ffd700"/></div>
            <div>
              <p className="stat-title">Total Assigned</p>
              <h3 className="stat-value">{totalAssigned}</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper"><Bell size={18} color="#ff9800"/></div>
            <div>
              <p className="stat-title">Action Needed</p>
              <h3 className="stat-value">{pendingAction}</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper"><CheckCircle size={18} color="#00e676"/></div>
            <div>
              <p className="stat-title">Resolved Cases</p>
              <h3 className="stat-value">{resolved}</h3>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderAdminHome = () => {
    const totalUsers = allUsers.length;
    const totalCounsellors = allUsers.filter(u => u.role.toLowerCase().includes('counsel') || u.role.toLowerCase().includes('councel')).length;
    const totalReqs = requests.length;
    const pendingReqs = requests.filter(r => r.status === "Pending").length;

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="tab-container">
        <h2>Admin Overview</h2>
        <p className="text-muted" style={{ marginTop: '-15px', marginBottom: '30px', textAlign: 'left' }}>Platform-wide statistics and system health.</p>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper"><Users size={18} color="#ffd700"/></div>
            <div>
              <p className="stat-title">Total Users</p>
              <h3 className="stat-value">{totalUsers}</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper"><User size={18} color="#00bfff"/></div>
            <div>
              <p className="stat-title">Counsellors</p>
              <h3 className="stat-value">{totalCounsellors}</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper"><FileText size={18} color="#ff9800"/></div>
            <div>
              <p className="stat-title">Total Requests</p>
              <h3 className="stat-value">{totalReqs}</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper"><Activity size={18} color="#ff4d4d"/></div>
            <div>
              <p className="stat-title">Pending Requests</p>
              <h3 className="stat-value">{pendingReqs}</h3>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // --- UI RENDERERS FOR TABS ---

  const renderStudentRequests = () => (
    <div className="tab-container">
      <div className="tab-header-flex">
        <h2>My Requests</h2>
        <button className="btn-primary" onClick={() => setShowRequestForm(!showRequestForm)}>
          <Plus size={14} /> {showRequestForm ? "Cancel" : "New Request"}
        </button>
      </div>

      {showRequestForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="form-card">
          <form onSubmit={handleSendRequest} className="request-form">
            <div className="form-group">
              <label>Select Counsellor</label>
              <select 
                value={formData.counsellorId} 
                onChange={(e) => setFormData({...formData, counsellorId: e.target.value})} 
                required
              >
                <option value="" disabled>-- Select a Counsellor --</option>
                {counsellors.map(c => (
                  <option key={c._id} value={c._id}>{c.name} - {c.email}</option>
                ))}
              </select>
              {counsellors.length === 0 && <p style={{color: '#ff4d4d', fontSize: '11px', marginTop: '5px'}}>No verified counsellors are currently available in the system.</p>}
            </div>
            <div className="form-group">
              <label>Title</label>
              <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required placeholder="Brief title of your issue..." />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                  <option>Academic Issues</option><option>Personal Issues</option><option>Career Guidance</option><option>Mental Health</option><option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})}>
                  <option>Low</option><option>Medium</option><option>High</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required rows="4" placeholder="Detail your issue here..."></textarea>
            </div>
            <button type="submit" className="btn-submit" disabled={counsellors.length === 0 || !formData.counsellorId}>Submit Request</button>
          </form>
        </motion.div>
      )}

      <div className="requests-grid">
        {requests.length === 0 ? <p className="text-muted" style={{textAlign: "center", marginTop: "40px"}}>No requests found.</p> : requests.map(req => (
          <div 
            key={req._id} 
            id={`req-${req._id}`}
            className={`request-card ${highlightedReqId === req._id ? 'highlighted-card' : ''}`}
          >
            <div className="request-card-header">
              <h3>{req.title}</h3>
              <span className={`status-badge status-${req.status.replace(" ", "").toLowerCase()}`}>{req.status}</span>
            </div>
            <p className="request-desc">{req.description}</p>
            <div className="request-meta">
              <span><strong>To:</strong> {req.counsellorId?.name || "Unknown"}</span>
              <span><strong>Category:</strong> {req.category}</span>
              <span><strong>Date:</strong> {formatDate(req.createdAt)}</span>
            </div>
            {req.reply && (
              <div className="reply-box">
                <h4>Counsellor Reply:</h4>
                <p>{req.reply}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderStudentNotifications = () => {
    const notifications = requests
      .filter(req => req.status !== "Pending")
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

    return (
      <div className="tab-container">
        <h2>Recent Notifications</h2>
        <div className="notifications-list">
          {notifications.length === 0 ? (
            <p className="text-muted" style={{textAlign: "center", marginTop: "40px"}}>You have no new notifications.</p>
          ) : (
            notifications.map(req => {
              const statusClass = req.status.replace(" ", "").toLowerCase();
              const counsellorName = req.counsellorId?.name || "A Counsellor";
              const initial = counsellorName.charAt(0).toUpperCase();
              
              let actionText = "updated your request";
              if(req.status === "In Progress") actionText = "accepted your request";
              if(req.status === "Completed") actionText = "replied to your request";
              if(req.status === "Rejected") actionText = "rejected your request";

              return (
                <div 
                  key={req._id} 
                  className="notification-item" 
                  onClick={() => handleNotificationClick(req._id)}
                  title="Click to view details in Requests tab"
                >
                  <div className="noti-avatar">{initial}</div>
                  <div className="noti-content">
                    <p>
                      <strong>{counsellorName}</strong> {actionText}: <em>"{req.title}"</em>
                    </p>
                    <span className="noti-time">{formatDate(req.updatedAt || req.createdAt)}</span>
                  </div>
                  <div className="noti-indicator">
                    <span className={`noti-dot bg-${statusClass}`}></span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const renderCounsellorRequests = () => (
    <div className="tab-container">
      <h2>Assigned Requests</h2>
      <div className="requests-grid">
        {requests.length === 0 ? <p className="text-muted" style={{textAlign: "center", marginTop: "40px"}}>No pending requests.</p> : requests.map(req => (
          <div key={req._id} className="request-card">
            <div className="request-card-header">
              <h3>{req.title}</h3>
              <span className={`status-badge status-${req.status.replace(" ", "").toLowerCase()}`}>{req.status}</span>
            </div>
            <p className="request-desc">{req.description}</p>
            <div className="request-meta">
              <span><strong>From:</strong> {req.studentId?.name || "Unknown"}</span>
              <span><strong>Category:</strong> {req.category} | Priority: <span className={`priority-${req.priority.toLowerCase()}`}>{req.priority}</span></span>
              <span><strong>Date:</strong> {formatDate(req.createdAt)}</span>
            </div>

            {req.status === "Pending" && (
              <div className="action-buttons">
                <button className="btn-success" onClick={() => handleUpdateStatus(req._id, "In Progress")}><CheckCircle size={14}/> Accept</button>
                <button className="btn-danger" onClick={() => handleUpdateStatus(req._id, "Rejected")}><XCircle size={14}/> Reject</button>
              </div>
            )}

            {req.status === "In Progress" && (
              <div className="reply-action-area">
                <textarea 
                  placeholder="Type your reply to the student..." 
                  rows="3"
                  value={replyText[req._id] || ""}
                  onChange={(e) => setReplyText({...replyText, [req._id]: e.target.value})}
                ></textarea>
                <button className="btn-primary" onClick={() => handleSendReply(req._id)}><Send size={14}/> Send Reply</button>
              </div>
            )}

            {req.status === "Completed" && (
              <div className="reply-box">
                <h4>Your Reply:</h4>
                <p>{req.reply}</p>
              </div>
            )}
            
             {req.status === "Rejected" && (
              <div className="reply-box rejected-box">
                <p>You rejected this request.</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderAdminRequests = () => (
    <div className="tab-container">
      <h2>Platform Wide Requests</h2>
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Student</th>
              <th>Assigned Counsellor</th>
              <th>Category</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req._id}>
                <td>{req.title}</td>
                <td>{req.studentId?.name || "N/A"}</td>
                <td>{req.counsellorId?.name || "N/A"}</td>
                <td>{req.category}</td>
                <td><span className={`status-badge status-${req.status.replace(" ", "").toLowerCase()}`}>{req.status}</span></td>
                <td>{formatDate(req.createdAt)}</td>
                <td>
                  <button className="btn-delete-icon" onClick={() => handleDeleteRequest(req._id)} title="Delete Request">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAdminPeoples = () => (
    <div className="tab-container">
      <h2>All Registered Users</h2>
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined Date</th>
              <th>Verification Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {allUsers.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "20px", color: "#888" }}>No users found.</td>
              </tr>
            ) : (
              allUsers.map(u => (
                <tr key={u._id}>
                  <td style={{ fontWeight: "bold", color: "#fff" }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td className="capitalize">{u.role}</td>
                  <td>{formatDate(u.createdAt)}</td>
                  <td>
                    {u.isVerified 
                      ? <span className="status-badge status-completed"><CheckCircle size={10} style={{display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom'}}/>Verified</span> 
                      : <span className="status-badge status-rejected"><XCircle size={10} style={{display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom'}}/>Pending</span>
                    }
                  </td>
                  <td>
                    <button className="btn-delete-icon" onClick={() => handleDeleteUser(u._id)} title="Delete User">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderContent = () => {
    if (activeTab === "home") {
      if (normalizedRole === "student") return renderStudentHome();
      if (normalizedRole === "admin") return renderAdminHome();
      if (normalizedRole === "counsellor") return renderCounsellorHome();
    }

    // ✅ ROBUST PROFILE RENDERER (Safeguarded against missing data)
    if (activeTab === "profile") {
      const userName = user?.name || "User";
      const initial = userName.charAt(0).toUpperCase();

      return (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          exit={{ opacity: 0, y: -10 }}
          className="profile-container"
        >
          <div className="profile-header">
            <div className="profile-avatar-large">{initial}</div>
            <div className="profile-title-group">
              <h2 className="profile-name truncate" title={userName}>{userName}</h2>
              <span className="profile-role-badge">{user?.role || "Student"}</span>
            </div>
          </div>
          
          <div className="profile-details-list">
            <div className="detail-item-row" title={user?.email}>
              <span className="detail-label-row"><Mail size={14}/> Email</span>
              <span className="detail-value-row truncate">{user?.email || "N/A"}</span>
            </div>
            
            <div className="detail-item-row" title={user?.mobile}>
              <span className="detail-label-row"><Phone size={14}/> Mobile</span>
              <span className="detail-value-row truncate">{user?.mobile || "N/A"}</span>
            </div>

            <div className="detail-item-row" title={formatDate(user?.createdAt)}>
              <span className="detail-label-row"><Clock size={14}/> Joined</span>
              <span className="detail-value-row truncate">{formatDate(user?.createdAt || new Date())}</span>
            </div>

            <div className="detail-item-row">
              <span className="detail-label-row"><Settings size={14}/> Status</span>
              <span className="detail-value-row status-active truncate">Verified & Active</span>
            </div>
            
            {user?.gender && (
              <div className="detail-item-row" title={user.gender}>
                <span className="detail-label-row"><User size={14}/> Gender</span>
                <span className="detail-value-row capitalize truncate">{user.gender}</span>
              </div>
            )}
            
            {user?.dob && (
              <div className="detail-item-row" title={user.dob}>
                <span className="detail-label-row"><Calendar size={14}/> DOB</span>
                <span className="detail-value-row truncate">{user.dob}</span>
              </div>
            )}
            
            {user?.academicYear && (
              <div className="detail-item-row" title={user.academicYear}>
                <span className="detail-label-row"><BookOpen size={14}/> Academic Year</span>
                <span className="detail-value-row truncate">{user.academicYear}</span>
              </div>
            )}
          </div>
        </motion.div>
      );
    }

    if (activeTab === "requests" && normalizedRole === "student") return renderStudentRequests();
    if (activeTab === "notifications" && normalizedRole === "student") return renderStudentNotifications();
    if (activeTab === "all-requests" && normalizedRole === "counsellor") return renderCounsellorRequests();
    
    if (activeTab === "total-requests" && normalizedRole === "admin") return renderAdminRequests();
    if (activeTab === "peoples" && normalizedRole === "admin") return renderAdminPeoples();

    return (
      <motion.div 
        key={activeTab}
        initial={{ opacity: 0, scale: 0.98 }} 
        animate={{ opacity: 1, scale: 1 }} 
        exit={{ opacity: 0, scale: 0.98 }}
        className="placeholder-floating"
      >
        <LayoutDashboard size={42} className="placeholder-icon" strokeWidth={1.5} />
        <h2 className="placeholder-title capitalize">{activeTab.replace("-", " ")}</h2>
        <p className="placeholder-subtitle">Data and tools for your {user?.role} workspace will appear here.</p>
      </motion.div>
    );
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        ::-webkit-scrollbar { display: none; }
        * { -ms-overflow-style: none; scrollbar-width: none; }

        body { 
          background: #0a0a0a; color: #fff; 
          font-family: 'Inter', 'Segoe UI', sans-serif; 
          overflow-x: hidden; 
          font-size: 13px; 
        }
        
        .truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }

        .dashboard-layout { display: flex; height: 100vh; width: 100vw; overflow: hidden; }

        /* --- SIDEBAR --- */
        .sidebar {
          width: 220px; 
          background: #0d0d0d; border-right: 1px solid #1a1a1a;
          display: flex; flex-direction: column; transition: transform 0.3s ease; z-index: 100;
        }
        .sidebar-brand {
          padding: 24px 20px; font-size: 15px; font-weight: 800;
          background: linear-gradient(90deg, #fff, #ffd700);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          display: flex; align-items: center; gap: 10px; letter-spacing: 0.5px;
        }
        .nav-list { padding: 10px 12px; flex-grow: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 4px; }
        .nav-item {
          display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 8px;
          cursor: pointer; color: #777; font-size: 12.5px; font-weight: 600; transition: all 0.2s ease;
        }
        .nav-item:hover { color: #fff; background: rgba(255, 255, 255, 0.03); }
        .nav-item.active {
          color: #000; background: linear-gradient(90deg, #ffc107 0%, #ff9800 100%);
          box-shadow: 0 4px 10px rgba(255, 165, 0, 0.15);
        }
        
        .sidebar-badge {
          margin-left: auto; background: #ff4d4d; color: #fff; font-size: 10px;
          font-weight: bold; padding: 2px 6px; border-radius: 12px;
        }

        .sidebar-footer { padding: 16px; border-top: 1px solid #1a1a1a; }
        .sidebar-logout-btn {
          display: flex; align-items: center; gap: 12px; width: 100%; padding: 10px 14px;
          border-radius: 8px; background: transparent; color: #ff4d4d; border: none; cursor: pointer;
          font-size: 12.5px; font-weight: 600; transition: all 0.2s ease;
        }
        .sidebar-logout-btn:hover { background: rgba(255, 77, 77, 0.08); }

        /* --- MAIN CONTENT AREA --- */
        .main-area {
          flex-grow: 1; display: flex; flex-direction: column; position: relative;
          background: radial-gradient(circle at top right, rgba(255,215,0,0.03) 0%, rgba(10,10,10,1) 70%);
          min-width: 0;
        }

        /* --- HEADER --- */
        .top-header {
          height: 60px; padding: 0 32px; background: rgba(10, 10, 10, 0.6);
          backdrop-filter: blur(12px); border-bottom: 1px solid #1a1a1a;
          display: flex; align-items: center; justify-content: space-between; z-index: 10;
        }
        .header-left { display: flex; align-items: center; gap: 12px; }
        .menu-btn { display: none; background: transparent; border: none; color: #fff; cursor: pointer; padding: 4px; }
        .header-title { font-size: 13px; font-weight: 600; color: #ccc; letter-spacing: 0.5px; }
        .header-right { display: flex; align-items: center; gap: 16px; min-width: 0; }
        .user-info { display: flex; align-items: center; gap: 10px; min-width: 0; }
        .greeting-text { color: #888; font-size: 12px; font-weight: 500; max-width: 150px; }
        .avatar-small {
          width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #ffd700, #ff9800);
          color: #000; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px;
          box-shadow: 0 0 10px rgba(255, 215, 0, 0.2); flex-shrink: 0;
        }

        .mobile-logout-btn {
          display: none; background: rgba(255, 77, 77, 0.1); color: #ff4d4d;
          border: 1px solid rgba(255, 77, 77, 0.2); padding: 6px; border-radius: 6px; cursor: pointer;
        }

        /* --- CONTENT WRAPPER --- */
        .content-wrapper {
          padding: 30px 40px; flex-grow: 1; overflow-y: auto; display: flex; flex-direction: column;
          align-items: flex-start; width: 100%;
        }
        .content-wrapper:has(.placeholder-floating) { align-items: center; justify-content: center; }

        /* --- DASHBOARD STATS STYLES --- */
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; width: 100%; margin-bottom: 30px; }
        .stat-card {
          background: #111; padding: 20px; border-radius: 12px; border: 1px solid #222;
          display: flex; align-items: center; gap: 16px; transition: transform 0.2s ease;
        }
        .stat-card:hover { transform: translateY(-3px); border-color: #333; }
        .stat-icon-wrapper {
          width: 42px; height: 42px; border-radius: 10px; background: #1a1a1a;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .stat-title { color: #888; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 4px; }
        .stat-value { color: #fff; font-size: 24px; font-weight: bold; }

        /* --- REQUESTS UI STYLES --- */
        .tab-container { width: 100%; max-width: 1000px; margin: 0 auto; }
        .tab-container h2 { font-size: 20px; margin-bottom: 20px; color: #fff; }
        .tab-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        
        .btn-primary {
          background: linear-gradient(90deg, #ffc107 0%, #ff9800 100%); color: #000; border: none;
          padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; display: flex;
          align-items: center; gap: 6px; font-size: 12.5px; transition: opacity 0.2s;
        }
        .btn-primary:hover:not(:disabled) { opacity: 0.9; }
        .btn-submit:disabled { background: #555; cursor: not-allowed; }

        .btn-success { background: #00e676; color: #000; border: none; padding: 6px 14px; border-radius: 6px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 12px; }
        .btn-danger { background: #ff4d4d; color: #fff; border: none; padding: 6px 14px; border-radius: 6px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 12px; }

        .btn-delete-icon {
          background: rgba(255, 77, 77, 0.1); color: #ff4d4d; border: 1px solid rgba(255, 77, 77, 0.2);
          padding: 6px; border-radius: 6px; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center;
        }
        .btn-delete-icon:hover { background: #ff4d4d; color: #fff; }

        .form-card { background: #111; border: 1px solid #222; border-radius: 12px; padding: 20px; margin-bottom: 24px; overflow: hidden; }
        .form-group { margin-bottom: 14px; width: 100%; }
        .form-row { display: flex; gap: 14px; }
        .form-group label { display: block; font-size: 11px; color: #aaa; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
        .form-group input, .form-group select, .form-group textarea {
          width: 100%; background: #1a1a1a; border: 1px solid #333; color: #fff; padding: 10px 12px; border-radius: 8px; font-size: 13px; outline: none; transition: border 0.3s;
        }
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #ffd700; }
        .btn-submit { background: #fff; color: #000; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; width: 100%; margin-top: 10px; }

        .requests-grid { display: flex; flex-direction: column; gap: 14px; }
        .request-card { background: #111; border: 1px solid #222; border-radius: 10px; padding: 16px 20px; transition: all 0.4s ease; }
        
        .highlighted-card { border-color: #ffd700 !important; animation: pulseHighlight 2s infinite; }
        @keyframes pulseHighlight { 0% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.4); } 70% { box-shadow: 0 0 0 12px rgba(255, 215, 0, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0); } }

        .request-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .request-card-header h3 { font-size: 16px; color: #fff; }
        .status-badge { padding: 3px 8px; border-radius: 20px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
        .status-pending { background: rgba(255, 193, 7, 0.2); color: #ffc107; }
        .status-inprogress { background: rgba(0, 191, 255, 0.2); color: #00bfff; }
        .status-completed { background: rgba(0, 230, 118, 0.2); color: #00e676; }
        .status-rejected { background: rgba(255, 77, 77, 0.2); color: #ff4d4d; }
        
        .request-desc { color: #bbb; font-size: 13px; line-height: 1.5; margin-bottom: 14px; }
        .request-meta { display: flex; flex-wrap: wrap; gap: 14px; font-size: 11px; color: #777; border-top: 1px solid #222; padding-top: 10px; }
        .request-meta strong { color: #aaa; }
        
        .reply-box { margin-top: 14px; background: #1a1a1a; padding: 14px; border-left: 3px solid #ffd700; border-radius: 4px 8px 8px 4px; }
        .reply-box h4 { font-size: 12px; color: #ffd700; margin-bottom: 6px; }
        .reply-box p { font-size: 13px; color: #ddd; }
        .rejected-box { border-left-color: #ff4d4d; }

        .action-buttons { display: flex; gap: 10px; margin-top: 14px; padding-top: 14px; border-top: 1px dashed #333; }
        .reply-action-area { margin-top: 14px; display: flex; flex-direction: column; gap: 8px; }
        .reply-action-area textarea { width: 100%; background: #1a1a1a; border: 1px solid #333; color: #fff; padding: 10px; border-radius: 8px; font-size: 13px; outline: none; }
        .reply-action-area textarea:focus { border-color: #ffd700; }

        /* NOTIFICATION STYLES */
        .notifications-list { display: flex; flex-direction: column; gap: 10px; }
        .notification-item { display: flex; align-items: center; gap: 14px; background: #111; border: 1px solid #222; padding: 14px 16px; border-radius: 10px; cursor: pointer; transition: all 0.2s ease; position: relative; }
        .notification-item:hover { background: #1a1a1a; border-color: #444; transform: translateY(-2px); }
        .noti-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #444, #222); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; flex-shrink: 0; border: 1px solid #333; }
        .noti-content { flex-grow: 1; }
        .noti-content p { color: #ddd; font-size: 13px; margin-bottom: 2px; }
        .noti-content strong { color: #fff; }
        .noti-time { font-size: 11px; color: #777; }
        .noti-indicator { display: flex; align-items: center; justify-content: center; padding-left: 8px; }
        .noti-dot { width: 8px; height: 8px; border-radius: 50%; }
        .bg-inprogress { background: #00bfff; box-shadow: 0 0 6px rgba(0,191,255,0.6); }
        .bg-completed { background: #00e676; box-shadow: 0 0 6px rgba(0,230,118,0.6); }
        .bg-rejected { background: #ff4d4d; box-shadow: 0 0 6px rgba(255,77,77,0.6); }

        /* Admin Table Styles */
        .table-responsive { width: 100%; overflow-x: auto; }
        .admin-table { width: 100%; border-collapse: collapse; background: #111; border-radius: 10px; overflow: hidden; }
        .admin-table th, .admin-table td { padding: 14px; text-align: left; border-bottom: 1px solid #222; font-size: 12.5px; }
        .admin-table th { background: #1a1a1a; color: #888; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
        .admin-table tr:hover { background: #151515; }

        /* NORMAL & SMALL PROFILE STYLES */
        .profile-container { width: 100%; max-width: 500px; margin: 0 auto; }
        .profile-header { display: flex; align-items: center; gap: 16px; margin-bottom: 30px; }
        .profile-avatar-large { width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #ffd700, #ff9800); color: #000; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 22px; box-shadow: 0 0 20px rgba(255, 215, 0, 0.15); flex-shrink: 0; }
        .profile-title-group { min-width: 0; flex: 1; }
        .profile-name { font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 4px; width: 100%; letter-spacing: -0.5px; }
        .profile-role-badge { display: inline-block; font-size: 10px; color: #ffd700; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
        
        .profile-details-list { display: flex; flex-direction: column; gap: 0; }
        .detail-item-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid #222; }
        .detail-item-row:last-child { border-bottom: none; }
        .detail-label-row { color: #888; font-size: 11px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; display: flex; align-items: center; gap: 8px; }
        .detail-label-row svg { color: #ffd700; opacity: 0.8; }
        .detail-value-row { color: #fff; font-size: 13px; font-weight: 500; text-align: right; max-width: 60%; }
        
        .capitalize { text-transform: capitalize; }
        .status-active { color: #00e676; font-weight: 600; }
        
        .placeholder-floating { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: #555; }
        .placeholder-icon { color: rgba(255, 215, 0, 0.3); margin-bottom: 16px; }
        .placeholder-title { color: #eee; font-size: 18px; font-weight: 600; margin-bottom: 8px; letter-spacing: 0.5px; }
        .placeholder-subtitle { font-size: 12px; color: #777; max-width: 300px; line-height: 1.6; }

        /* MOBILE BOTTOM NAVIGATION & EXCLUSIVE MEDIA QUERIES */
        .bottom-nav { display: none; }

        @media (max-width: 768px) {
          .sidebar { display: none !important; }
          .menu-btn { display: none !important; }
          .mobile-overlay { display: none !important; }

          .top-header { padding: 0 20px; }
          .header-title { font-size: 16px; }
          .greeting-text { display: none; } 
          .mobile-logout-btn { display: flex; align-items: center; justify-content: center; } 

          .content-wrapper { padding: 24px 20px 100px 20px; } 
          
          .form-row { flex-direction: column; gap: 0; }

          .bottom-nav {
            display: flex; position: fixed; bottom: 0; left: 0; right: 0; background: rgba(15, 15, 15, 0.95);
            backdrop-filter: blur(15px); border-top: 1px solid #222; padding: 10px 5px; justify-content: space-around;
            z-index: 100; padding-bottom: calc(10px + env(safe-area-inset-bottom));
          }
          .bottom-nav-item {
            display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
            color: #777; font-size: 10px; font-weight: 500; cursor: pointer; transition: all 0.2s ease; flex: 1;
          }
          .bottom-nav-item.active { color: #ffd700; }
          .bottom-nav-item .icon-wrapper { position: relative; display: flex; align-items: center; justify-content: center; margin-bottom: 2px; }
          .bottom-nav-badge {
            position: absolute; top: -6px; right: -8px; background: #ff4d4d; color: white; border-radius: 50%;
            width: 16px; height: 16px; font-size: 9px; font-weight: bold; display: flex; align-items: center; justify-content: center; border: 2px solid #111;
          }
        }
      `}</style>

      <div className="dashboard-layout">
        
        {/* SIDEBAR (Desktop Only) */}
        <aside className="sidebar">
          <div>
            <div className="sidebar-brand">
              <LayoutDashboard size={18} color="#ffd700" /> Campus
            </div>
            
            <div className="nav-list">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <div 
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                    
                    {item.id === "notifications" && notificationCount > 0 && (
                      <span className="sidebar-badge">{notificationCount}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="sidebar-footer">
            <button onClick={logout} className="sidebar-logout-btn">
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="main-area">
          
          {/* HEADER */}
          <header className="top-header">
            <div className="header-left">
              <h1 className="header-title">Overview</h1>
            </div>

            <div className="header-right">
              <div className="user-info">
                <span className="greeting-text truncate" title={`Hi, ${user?.name}`}>
                  Hi, {user?.name?.split(' ')}
                </span>
                <div className="avatar-small">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
              </div>
              <button className="mobile-logout-btn" onClick={logout} title="Sign Out">
                <LogOut size={16} />
              </button>
            </div>
          </header>

          {/* DYNAMIC CONTENT WRAPPER */}
          <div className="content-wrapper">
            <AnimatePresence mode="wait">
              {renderContent()}
            </AnimatePresence>
          </div>

          {/* MOBILE BOTTOM NAVIGATION BAR */}
          <nav className="bottom-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <div 
                  key={`bottom-${item.id}`} 
                  onClick={() => handleTabChange(item.id)}
                  className={`bottom-nav-item ${isActive ? 'active' : ''}`}
                >
                  <div className="icon-wrapper">
                    <Icon size={20} />
                    {item.id === "notifications" && notificationCount > 0 && (
                      <span className="bottom-nav-badge">{notificationCount}</span>
                    )}
                  </div>
                  <span>{item.label}</span>
                </div>
              );
            })}
          </nav>

        </main>
      </div>
    </>
  );
};

export default Dashboard;