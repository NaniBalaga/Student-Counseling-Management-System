import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, FileText, Bell, User,
  Users, Settings, History, LogOut, Menu,
  LayoutDashboard, Mail, Phone, Calendar, BookOpen, Clock,
  CheckCircle, XCircle, Send, Plus, Activity, Trash2,
  Star, Ban, ShieldAlert, ShieldCheck, Filter, Search,
  ChevronDown, AlertTriangle, Timer, ThumbsUp, Award
} from "lucide-react";

const navConfig = {
  student: [
    { id: "home", label: "Home", icon: Home },
    { id: "requests", label: "Requests", icon: FileText },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "my-history", label: "History", icon: History },
    { id: "ratings", label: "Ratings", icon: Star },
    { id: "profile", label: "Profile", icon: User },
  ],
  admin: [
    { id: "home", label: "Home", icon: Home },
    { id: "peoples", label: "Peoples", icon: Users },
    { id: "total-requests", label: "Requests", icon: FileText },
    { id: "all-ratings", label: "Ratings", icon: Star },
    { id: "profile", label: "Profile", icon: User },
  ],
  counsellor: [
    { id: "home", label: "Home", icon: Home },
    { id: "all-requests", label: "Requests", icon: FileText },
    { id: "my-history", label: "History", icon: History },
    { id: "my-ratings", label: "Ratings", icon: Star },
    { id: "profile", label: "Profile", icon: User },
  ],
  counceller: [
    { id: "home", label: "Home", icon: Home },
    { id: "all-requests", label: "Requests", icon: FileText },
    { id: "my-history", label: "History", icon: History },
    { id: "my-ratings", label: "Ratings", icon: Star },
    { id: "profile", label: "Profile", icon: User },
  ]
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const isCounsellorAvailable = (startTime, endTime) => {
  if (!startTime || !endTime) return false;
  const now = new Date();
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
};

const StarRating = ({ rating, onRatingChange, size = 18, readonly = false }) => {
  const [hovered, setHovered] = useState(0);
  
  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          style={{
            cursor: readonly ? 'default' : 'pointer',
            color: star <= (hovered || rating) ? '#ffd700' : '#333',
            fill: star <= (hovered || rating) ? '#ffd700' : 'transparent',
            transition: 'color 0.15s, fill 0.15s',
          }}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          onClick={() => !readonly && onRatingChange && onRatingChange(star)}
        />
      ))}
    </div>
  );
};

const MiniSparkline = ({ data, color = "#ffd700", width = 120, height = 40 }) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1 || 1)) * width;
    const y = height - ((v - min) / range) * (height * 0.8) - height * 0.1;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const DonutChart = ({ data, size = 80, strokeWidth = 12 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let currentOffset = 0;
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#1a1a1a" strokeWidth={strokeWidth} />
        {data.map((d, i) => {
          const pct = d.value / total;
          const offset = circumference * pct;
          currentOffset += offset;
          return (
            <circle key={i} cx={size/2} cy={size/2} r={radius} fill="none" 
              stroke={d.color} strokeWidth={strokeWidth}
              strokeDasharray={`${offset} ${circumference - offset}`}
              strokeDashoffset={- (currentOffset - offset)}
              strokeLinecap="round" style={{ transition: 'stroke-dasharray 1s ease' }} />
          );
        })}
      </svg>
    </div>
  );
};

const BarGraph = ({ data, height = 100, barWidth = 20 }) => {
  const max = Math.max(...data.map(d=>d.value), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
          <span style={{ fontSize: '10px', color: '#aaa', fontWeight: '600' }}>{d.value}</span>
          <div style={{ width: barWidth, background: d.color, borderRadius: '4px 4px 0 0', height: `${(d.value / max) * 85}%`, transition: 'height 0.5s ease' }}></div>
          <span style={{ fontSize: '9px', color: '#666', textAlign: 'center', maxWidth: barWidth + 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [requests, setRequests] = useState([]);
  const [counsellors, setCounsellors] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allRatings, setAllRatings] = useState([]);

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

  const [showWorkHoursPopup, setShowWorkHoursPopup] = useState(false);
  const [workHours, setWorkHours] = useState({ workStartTime: "", workEndTime: "" });
  const [ratingData, setRatingData] = useState({ rating: 0, feedback: "" });
  const [showRatingModal, setShowRatingModal] = useState(null);
  const [existingRatings, setExistingRatings] = useState({});
  
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("All");

  const API_BASE_URL = "http://localhost:5000/api";

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
    } else {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      checkBanStatus(parsedUser._id);
      setIsLoading(false);
    }
  }, [navigate]);

  const checkBanStatus = async (userId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/users/check-ban/${userId}`);
      const data = await res.json();
      if (data.isBanned) {
        alert(`Your account has been banned. Reason: ${data.banReason || "Violation of terms"}`);
        localStorage.clear();
        navigate("/login");
      }
    } catch (error) {
      console.error("Error checking ban status", error);
    }
  };

  useEffect(() => {
    if (user) {
      const userRole = user.role?.toLowerCase() || "";
      if ((userRole.includes("counsel") || userRole.includes("councel"))) {
        if (!user.workStartTime || !user.workEndTime) {
          setShowWorkHoursPopup(true);
        } else {
          setWorkHours({ workStartTime: user.workStartTime, workEndTime: user.workEndTime });
        }
      }
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const userRole = user.role?.toLowerCase() || "student";

    if (["home", "requests", "notifications", "my-history"].includes(activeTab) && userRole === "student") {
      fetchCounsellors();
      fetchUserRequests(userRole);
    } else if (["home", "all-requests", "my-history", "my-ratings"].includes(activeTab) && (userRole.includes("counsel") || userRole.includes("councel"))) {
      fetchUserRequests(userRole);
      if (activeTab === "my-ratings") {
        fetchCounsellorRatings(user._id);
      }
    } else if (["home", "total-requests", "peoples", "all-ratings"].includes(activeTab) && userRole === "admin") {
      fetchUserRequests(userRole);
      fetchAllUsers();
      if (activeTab === "all-ratings") {
        fetchAllRatings();
      }
    }

    if (activeTab === "ratings" && userRole === "student") {
      fetchAllRatings();
    }

    if (userRole === "student") {
      fetchExistingRatings();
    }
  }, [activeTab, user]);

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

  const fetchAllRatings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/ratings/all`);
      const data = await res.json();
      if (Array.isArray(data)) setAllRatings(data);
    } catch (error) {
      console.error("Error fetching ratings", error);
    }
  };

  const fetchCounsellorRatings = async (counsellorId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/ratings/counsellor/${counsellorId}`);
      const data = await res.json();
      if (Array.isArray(data)) setAllRatings(data);
    } catch (error) {
      console.error("Error fetching counsellor ratings", error);
    }
  };

  const fetchExistingRatings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/requests/user/${user._id}/student`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const completedReqs = data.filter(r => r.status === "Completed");
        const ratingsMap = {};
        for (const req of completedReqs) {
          try {
            const ratingRes = await fetch(`${API_BASE_URL}/ratings/request/${req._id}`);
            if (ratingRes.ok) {
              const ratingData = await ratingRes.json();
              if (ratingData && ratingData._id) {
                ratingsMap[String(req._id)] = ratingData;
              }
            }
          } catch (e) {
          }
        }
        setExistingRatings(ratingsMap);
      }
    } catch (error) {
      console.error("Error fetching existing ratings", error);
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

  const handleBanUser = async (userId) => {
    const reason = prompt("Enter reason for banning this user:");
    if (!reason) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/auth/users/ban/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        alert("User has been banned successfully.");
        fetchAllUsers();
      }
    } catch (error) {
      console.error("Error banning user", error);
    }
  };

  const handleUnbanUser = async (userId) => {
    if (!window.confirm("Are you sure you want to unban this user?")) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/auth/users/unban/${userId}`, {
        method: "PUT",
      });
      if (res.ok) {
        alert("User has been unbanned successfully.");
        fetchAllUsers();
      }
    } catch (error) {
      console.error("Error unbanning user", error);
    }
  };

  const handleSaveWorkHours = async () => {
    if (!workHours.workStartTime || !workHours.workEndTime) {
      alert("Please set both start and end times.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/users/working-hours/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workHours),
      });
      if (res.ok) {
        const data = await res.json();
        const updatedUser = { ...user, ...workHours };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setShowWorkHoursPopup(false);
        alert("Working hours updated successfully!");
      }
    } catch (error) {
      console.error("Error saving work hours", error);
    }
  };

  const handleSubmitRating = async (requestId, counsellorId) => {
    if (ratingData.rating === 0) {
      alert("Please select a rating.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/ratings/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          counsellorId,
          rating: ratingData.rating,
          feedback: ratingData.feedback,
          studentId: user._id,
        }),
      });
      if (res.ok) {
        alert("Rating submitted successfully!");
        setShowRatingModal(null);
        setRatingData({ rating: 0, feedback: "" });
        fetchExistingRatings();
        fetchCounsellors();
        if (activeTab === "ratings") fetchAllRatings();
      }
    } catch (error) {
      console.error("Error submitting rating", error);
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
    setFilterStatus("All");
    setFilterCategory("All");
    setFilterPriority("All");
    setSearchQuery("");
    setRatingFilter("All");
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

  const filterRequests = (reqs) => {
    return reqs.filter(req => {
      const matchesStatus = filterStatus === "All" || req.status === filterStatus;
      const matchesCategory = filterCategory === "All" || req.category === filterCategory;
      const matchesPriority = filterPriority === "All" || req.priority === filterPriority;
      const matchesSearch = searchQuery === "" ||
        req.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.studentId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.counsellorId?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesCategory && matchesPriority && matchesSearch;
    });
  };

  const filterRatingsList = (rats) => {
    return rats.filter(r => {
      const matchesFilter = ratingFilter === "All" || r.rating === parseInt(ratingFilter);
      const matchesSearch = searchQuery === "" ||
        r.counsellorId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.studentId?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  };

  const renderStudentHome = () => {
    const totalReq = requests.length;
    const pendingReq = requests.filter(r => r.status === "Pending").length;
    const completedReq = requests.filter(r => r.status === "Completed").length;
    const ratedReq = Object.keys(existingRatings).length;

    const catData = [
      { label: "Academic", value: requests.filter(r => r.category === "Academic Issues").length, color: "#ffd700" },
      { label: "Personal", value: requests.filter(r => r.category === "Personal Issues").length, color: "#00bfff" },
      { label: "Career", value: requests.filter(r => r.category === "Career Guidance").length, color: "#00e676" },
      { label: "Mental", value: requests.filter(r => r.category === "Mental Health").length, color: "#ff9800" },
      { label: "Other", value: requests.filter(r => r.category === "Other").length, color: "#888" }
    ];
    const statusData = [
      { label: "Pending", value: pendingReq, color: "#ffc107" },
      { label: "In Progress", value: requests.filter(r => r.status === "In Progress").length, color: "#00bfff" },
      { label: "Completed", value: completedReq, color: "#00e676" },
      { label: "Rejected", value: requests.filter(r => r.status === "Rejected").length, color: "#ff4d4d" }
    ];
    const sparkData = [];
    for(let i=6; i>=0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const dayStr = d.toDateString();
      sparkData.push(requests.filter(r => new Date(r.createdAt).toDateString() === dayStr).length);
    }

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="tab-container">
        <h2>Student Dashboard</h2>
        <p className="text-muted" style={{ marginTop: '-15px', marginBottom: '30px', textAlign: 'left' }}>Overview of your activity and analytics.</p>

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
          <div className="stat-card">
            <div className="stat-icon-wrapper"><Star size={18} color="#ff9800"/></div>
            <div>
              <p className="stat-title">Ratings Given</p>
              <h3 className="stat-value">{ratedReq}</h3>
            </div>
          </div>
        </div>

        <div className="analytics-grid">
          <div className="graph-card">
            <h4>Last 7 Days Activity</h4>
            <MiniSparkline data={sparkData} color="#ffd700" width="100%" height={50} />
          </div>
          <div className="graph-card">
            <h4>Status Breakdown</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <DonutChart data={statusData} size={90} strokeWidth={14} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {statusData.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#ccc' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }}></span>
                    {s.label} ({s.value})
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="graph-card">
            <h4>Request Categories</h4>
            <BarGraph data={catData} height={100} barWidth={24} />
          </div>
        </div>
      </motion.div>
    );
  };

  const renderCounsellorHome = () => {
    const totalAssigned = requests.length;
    const pendingAction = requests.filter(r => r.status === "Pending" || r.status === "In Progress").length;
    const resolved = requests.filter(r => r.status === "Completed").length;
    const avgRating = user.averageRating || 0;

    const catData = [
      { label: "Academic", value: requests.filter(r => r.category === "Academic Issues").length, color: "#ffd700" },
      { label: "Personal", value: requests.filter(r => r.category === "Personal Issues").length, color: "#00bfff" },
      { label: "Career", value: requests.filter(r => r.category === "Career Guidance").length, color: "#00e676" },
      { label: "Mental", value: requests.filter(r => r.category === "Mental Health").length, color: "#ff9800" },
      { label: "Other", value: requests.filter(r => r.category === "Other").length, color: "#888" }
    ];
    const statusData = [
      { label: "Pending", value: requests.filter(r => r.status === "Pending").length, color: "#ffc107" },
      { label: "In Progress", value: requests.filter(r => r.status === "In Progress").length, color: "#00bfff" },
      { label: "Completed", value: resolved, color: "#00e676" },
      { label: "Rejected", value: requests.filter(r => r.status === "Rejected").length, color: "#ff4d4d" }
    ];
    const sparkData = [];
    for(let i=6; i>=0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const dayStr = d.toDateString();
      sparkData.push(requests.filter(r => new Date(r.createdAt).toDateString() === dayStr).length);
    }

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
          <div className="stat-card">
            <div className="stat-icon-wrapper"><Award size={18} color="#ffd700"/></div>
            <div>
              <p className="stat-title">Avg Rating</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 className="stat-value">{avgRating}</h3>
                <Star size={14} color="#ffd700" fill="#ffd700" />
              </div>
            </div>
          </div>
        </div>

        <div className="analytics-grid">
          <div className="graph-card">
            <h4>Cases This Week</h4>
            <MiniSparkline data={sparkData} color="#00bfff" width="100%" height={50} />
          </div>
          <div className="graph-card">
            <h4>Case Status</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <DonutChart data={statusData} size={90} strokeWidth={14} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {statusData.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#ccc' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }}></span>
                    {s.label} ({s.value})
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="graph-card">
            <h4>Categories Handled</h4>
            <BarGraph data={catData} height={100} barWidth={24} />
          </div>
        </div>

        <div className="work-status-card">
          <div className="work-status-header">
            <Timer size={18} color="#fff" />
            <span>Working Hours Status</span>
          </div>
          <div className="work-status-body">
            {user.workStartTime && user.workEndTime ? (
              <>
                <p className="work-time-display">
                  <span className="time-label">Start:</span> {user.workStartTime}
                  <span className="time-separator">→</span>
                  <span className="time-label">End:</span> {user.workEndTime}
                </p>
                <div className={`work-status-badge ${isCounsellorAvailable(user.workStartTime, user.workEndTime) ? 'status-available' : 'status-unavailable'}`}>
                  <span className="status-dot"></span>
                  {isCounsellorAvailable(user.workStartTime, user.workEndTime) ? 'Available Now' : 'Unavailable Now'}
                </div>
              </>
            ) : (
              <p className="text-muted" style={{ fontSize: '12px' }}>Working hours not set. Please update in Profile.</p>
            )}
            <button className="btn-secondary" onClick={() => setShowWorkHoursPopup(true)}>
              <Settings size={14} /> Update Hours
            </button>
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
    const bannedUsers = allUsers.filter(u => u.isBanned).length;
    const totalRatingsCount = allRatings.length;

    const roleData = [
      { label: "Students", value: allUsers.filter(u => u.role?.toLowerCase() === "student").length, color: "#00bfff" },
      { label: "Counsellors", value: totalCounsellors, color: "#ffd700" },
      { label: "Admins", value: allUsers.filter(u => u.role?.toLowerCase() === "admin").length, color: "#ff9800" }
    ];
    const reqStatusData = [
      { label: "Pending", value: pendingReqs, color: "#ffc107" },
      { label: "In Progress", value: requests.filter(r => r.status === "In Progress").length, color: "#00bfff" },
      { label: "Completed", value: requests.filter(r => r.status === "Completed").length, color: "#00e676" },
      { label: "Rejected", value: requests.filter(r => r.status === "Rejected").length, color: "#ff4d4d" }
    ];

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
          <div className="stat-card">
            <div className="stat-icon-wrapper"><Ban size={18} color="#ff4d4d"/></div>
            <div>
              <p className="stat-title">Banned Users</p>
              <h3 className="stat-value">{bannedUsers}</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper"><Star size={18} color="#ffd700"/></div>
            <div>
              <p className="stat-title">Total Ratings</p>
              <h3 className="stat-value">{totalRatingsCount}</h3>
            </div>
          </div>
        </div>

        <div className="analytics-grid">
          <div className="graph-card">
            <h4>User Distribution</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <DonutChart data={roleData} size={90} strokeWidth={14} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {roleData.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#ccc' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }}></span>
                    {s.label} ({s.value})
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="graph-card">
            <h4>Request Pipeline</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <DonutChart data={reqStatusData} size={90} strokeWidth={14} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {reqStatusData.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#ccc' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }}></span>
                    {s.label} ({s.value})
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="graph-card">
            <h4>System Health</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '11px', color: '#888', width: '80px' }}>Verified</span>
                <div style={{ flex: 1, height: 6, background: '#1a1a1a', borderRadius: '3px' }}><div style={{ width: `${totalUsers > 0 ? (allUsers.filter(u=>u.isVerified).length / totalUsers) * 100 : 0}%`, height: '100%', background: '#00e676', borderRadius: '3px' }}></div></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '11px', color: '#888', width: '80px' }}>Active</span>
                <div style={{ flex: 1, height: 6, background: '#1a1a1a', borderRadius: '3px' }}><div style={{ width: `${totalReqs > 0 ? ((totalReqs - pendingReqs) / totalReqs) * 100 : 0}%`, height: '100%', background: '#ffd700', borderRadius: '3px' }}></div></div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

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
                {counsellors.map(c => {
                  const isAvailable = isCounsellorAvailable(c.workStartTime, c.workEndTime);
                  const hasWorkingHours = c.workStartTime && c.workEndTime;
                  
                  if (!hasWorkingHours) return null;
                  
                  return (
                    <option key={c._id} value={c._id} disabled={!isAvailable} style={!isAvailable ? { color: '#ff4d4d' } : {}}>
                      {c.name} - {c.email} [{isAvailable ? '✓ Available' : '✗ Unavailable'}: {c.workStartTime}-{c.workEndTime}] {c.averageRating ? `[⭐ ${c.averageRating}]` : ''}
                    </option>
                  );
                })}
              </select>
              {counsellors.length === 0 && <p style={{color: '#ff4d4d', fontSize: '11px', marginTop: '5px'}}>No verified counsellors are currently available in the system.</p>}
              
              <div className="counsellor-legend">
                <span className="legend-item legend-available"><span className="legend-dot"></span>Available Now</span>
                <span className="legend-item legend-unavailable"><span className="legend-dot"></span>Unavailable (Cannot Select)</span>
              </div>
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
            {req.status === "Completed" && !existingRatings[String(req._id)] && (
              <button className="btn-rate" onClick={() => {
                setShowRatingModal(req._id);
                setRatingData({ rating: 0, feedback: "" });
              }}>
                <Star size={14} /> Rate this response
              </button>
            )}
            {existingRatings[String(req._id)] && (
              <div className="rated-indicator">
                <StarRating rating={existingRatings[String(req._id)].rating} readonly={true} size={14} />
                <span className="rated-text">Your rating</span>
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

  const renderStudentRatings = () => {
    const filteredRatings = filterRatingsList(allRatings.filter(r => r.studentId?._id === user._id));

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="tab-container">
        <h2>My Ratings</h2>
        
        <div className="filter-bar">
          <div className="filter-group">
            <Filter size={14} />
            <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}>
              <option value="All">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>

        <h3 style={{ fontSize: '16px', marginTop: '30px', marginBottom: '15px' }}>Available Counsellors</h3>
        <div className="counsellors-grid">
          {counsellors.length === 0 ? (
            <p className="text-muted" style={{ textAlign: 'center', marginTop: '20px' }}>No counsellors available.</p>
          ) : counsellors.map(c => (
            <div key={c._id} className="counsellor-card">
              <div className="counsellor-card-header">
                <div className="counsellor-avatar">{c.name?.charAt(0).toUpperCase()}</div>
                <div>
                  <h4>{c.name}</h4>
                  <p className="counsellor-email">{c.email}</p>
                </div>
              </div>
              <div className="counsellor-card-rating">
                <StarRating rating={Math.round(c.averageRating || 0)} readonly={true} size={16} />
                <span className="rating-value">{c.averageRating || 'N/A'}</span>
                <span className="rating-count">({c.totalRatings || 0} ratings)</span>
              </div>
              <div className="counsellor-card-hours">
                <Timer size={14} />
                <span>{c.workStartTime && c.workEndTime ? `${c.workStartTime} - ${c.workEndTime}` : 'Hours not set'}</span>
                {c.workStartTime && c.workEndTime && (
                  <span className={`availability-badge ${isCounsellorAvailable(c.workStartTime, c.workEndTime) ? 'available' : 'unavailable'}`}>
                    {isCounsellorAvailable(c.workStartTime, c.workEndTime) ? 'Available' : 'Unavailable'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <h3 style={{ fontSize: '16px', marginTop: '40px', marginBottom: '15px' }}>My Rating History</h3>
        <div className="ratings-list">
          {filteredRatings.length === 0 ? (
            <p className="text-muted" style={{ textAlign: 'center', marginTop: '20px' }}>No ratings found.</p>
          ) : filteredRatings.map(r => (
            <div key={r._id} className="rating-card">
              <div className="rating-card-left">
                <div className="rating-counsellor-name">{r.counsellorId?.name || 'Unknown'}</div>
                <div className="rating-request-title">{r.requestId?.title || 'Request'}</div>
              </div>
              <div className="rating-card-center">
                <StarRating rating={r.rating} readonly={true} size={16} />
              </div>
              <div className="rating-card-right">
                {r.feedback && <p className="rating-feedback">"{r.feedback}"</p>}
                <span className="rating-date">{formatDate(r.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  };

  const renderHistoryTab = () => {
    const filteredRequests = filterRequests(requests);

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="tab-container">
        <h2>Request History</h2>
        
        <div className="filter-bar">
          <div className="filter-group">
            <Search size={14} />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="filter-input"
            />
          </div>
          <div className="filter-group">
            <Filter size={14} />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div className="filter-group">
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="All">All Categories</option>
              <option value="Academic Issues">Academic Issues</option>
              <option value="Personal Issues">Personal Issues</option>
              <option value="Career Guidance">Career Guidance</option>
              <option value="Mental Health">Mental Health</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="filter-group">
            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
              <option value="All">All Priority</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>

        <p className="filter-result-text">{filteredRequests.length} results found</p>

        <div className="requests-grid">
          {filteredRequests.length === 0 ? (
            <p className="text-muted" style={{textAlign: "center", marginTop: "40px"}}>No requests match your filters.</p>
          ) : filteredRequests.map(req => (
            <div key={req._id} className="request-card history-card">
              <div className="request-card-header">
                <h3>{req.title}</h3>
                <span className={`status-badge status-${req.status.replace(" ", "").toLowerCase()}`}>{req.status}</span>
              </div>
              <p className="request-desc">{req.description}</p>
              <div className="request-meta">
                {normalizedRole === "student" && <span><strong>To:</strong> {req.counsellorId?.name || "Unknown"}</span>}
                {normalizedRole === "counsellor" && <span><strong>From:</strong> {req.studentId?.name || "Unknown"}</span>}
                <span><strong>Category:</strong> {req.category}</span>
                <span className={`priority-inline priority-${req.priority.toLowerCase()}`}>{req.priority}</span>
                <span><strong>Created:</strong> {formatDate(req.createdAt)}</span>
                {req.updatedAt !== req.createdAt && <span><strong>Updated:</strong> {formatDate(req.updatedAt)}</span>}
              </div>
              {req.reply && (
                <div className="reply-box">
                  <h4>Reply:</h4>
                  <p>{req.reply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>
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

  const renderCounsellorRatings = () => {
    const filteredRatings = filterRatingsList(allRatings);

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="tab-container">
        <h2>My Ratings</h2>
        
        <div className="avg-rating-card">
          <div className="avg-rating-left">
            <h3 className="avg-rating-number">{user.averageRating || 'N/A'}</h3>
            <StarRating rating={Math.round(user.averageRating || 0)} readonly={true} size={24} />
          </div>
          <div className="avg-rating-right">
            <p className="total-ratings-text">{user.totalRatings || 0} total ratings</p>
          </div>
        </div>

        <div className="filter-bar">
          <div className="filter-group">
            <Search size={14} />
            <input
              type="text"
              placeholder="Search by student name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="filter-input"
            />
          </div>
          <div className="filter-group">
            <Filter size={14} />
            <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}>
              <option value="All">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>

        <p className="filter-result-text">{filteredRatings.length} results found</p>

        <div className="ratings-list">
          {filteredRatings.length === 0 ? (
            <p className="text-muted" style={{ textAlign: 'center', marginTop: '40px' }}>No ratings yet.</p>
          ) : filteredRatings.map(r => (
            <div key={r._id} className="rating-card">
              <div className="rating-card-left">
                <div className="rating-student-avatar">{r.studentId?.name?.charAt(0).toUpperCase() || '?'}</div>
                <div>
                  <div className="rating-student-name">{r.studentId?.name || 'Unknown'}</div>
                  <div className="rating-request-title">{r.requestId?.title || 'Request'}</div>
                </div>
              </div>
              <div className="rating-card-center">
                <StarRating rating={r.rating} readonly={true} size={18} />
              </div>
              <div className="rating-card-right">
                {r.feedback && <p className="rating-feedback">"{r.feedback}"</p>}
                <span className="rating-date">{formatDate(r.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  };

  const renderAdminRequests = () => (
    <div className="tab-container">
      <h2>Platform Wide Requests</h2>
      
      <div className="filter-bar">
        <div className="filter-group">
          <Search size={14} />
          <input
            type="text"
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="filter-input"
          />
        </div>
        <div className="filter-group">
          <Filter size={14} />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        <div className="filter-group">
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="All">All Categories</option>
            <option value="Academic Issues">Academic Issues</option>
            <option value="Personal Issues">Personal Issues</option>
            <option value="Career Guidance">Career Guidance</option>
            <option value="Mental Health">Mental Health</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

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
            {filterRequests(requests).map(req => (
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
      
      <div className="filter-bar">
        <div className="filter-group">
          <Search size={14} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="filter-input"
          />
        </div>
      </div>

      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined Date</th>
              <th>Verification</th>
              <th>Status</th>
              <th>Rating</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {allUsers.filter(u => 
              searchQuery === "" || 
              u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
              u.email?.toLowerCase().includes(searchQuery.toLowerCase())
            ).length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "20px", color: "#888" }}>No users found.</td>
              </tr>
            ) : (
              allUsers.filter(u => 
                searchQuery === "" || 
                u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                u.email?.toLowerCase().includes(searchQuery.toLowerCase())
              ).map(u => (
                <tr key={u._id} className={u.isBanned ? 'banned-row' : ''}>
                  <td style={{ fontWeight: "bold", color: u.isBanned ? "#ff4d4d" : "#fff" }}>{u.name}</td>
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
                    {u.isBanned 
                      ? <span className="status-badge status-banned"><Ban size={10} style={{display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom'}}/>Banned</span>
                      : <span className="status-badge status-completed"><ShieldCheck size={10} style={{display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom'}}/>Active</span>
                    }
                  </td>
                  <td>
                    {u.averageRating ? (
                      <span className="rating-inline">
                        <Star size={12} color="#ffd700" fill="#ffd700" /> {u.averageRating}
                      </span>
                    ) : 'N/A'}
                  </td>
                  <td className="action-buttons-cell">
                    {u.isBanned ? (
                      <button className="btn-unban" onClick={() => handleUnbanUser(u._id)} title="Unban User">
                        <ShieldCheck size={14} /> Unban
                      </button>
                    ) : (
                      <button className="btn-ban" onClick={() => handleBanUser(u._id)} title="Ban User">
                        <Ban size={14} /> Ban
                      </button>
                    )}
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

  const renderAdminRatings = () => {
    const filteredRatings = filterRatingsList(allRatings);

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="tab-container">
        <h2>All Platform Ratings</h2>

        <div className="filter-bar">
          <div className="filter-group">
            <Search size={14} />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="filter-input"
            />
          </div>
          <div className="filter-group">
            <Filter size={14} />
            <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}>
              <option value="All">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>

        <p className="filter-result-text">{filteredRatings.length} results found</p>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Counsellor</th>
                <th>Request</th>
                <th>Rating</th>
                <th>Feedback</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredRatings.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "20px", color: "#888" }}>No ratings found.</td>
                </tr>
              ) : filteredRatings.map(r => (
                <tr key={r._id}>
                  <td>{r.studentId?.name || 'Unknown'}</td>
                  <td>{r.counsellorId?.name || 'Unknown'}</td>
                  <td>{r.requestId?.title || 'Unknown'}</td>
                  <td>
                    <StarRating rating={r.rating} readonly={true} size={14} />
                  </td>
                  <td className="feedback-cell">{r.feedback || '-'}</td>
                  <td>{formatDate(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    );
  };

  const renderContent = () => {
    if (activeTab === "home") {
      if (normalizedRole === "student") return renderStudentHome();
      if (normalizedRole === "admin") return renderAdminHome();
      if (normalizedRole === "counsellor") return renderCounsellorHome();
    }

    if (activeTab === "profile") {
      const userName = user?.name || "User";
      const initial = userName.charAt(0).toUpperCase();
      const isCounsellor = normalizedRole === "counsellor";

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

            {isCounsellor && (
              <>
                <div className="detail-item-row">
                  <span className="detail-label-row"><Timer size={14}/> Work Start</span>
                  <span className="detail-value-row truncate">{user?.workStartTime || "Not set"}</span>
                </div>
                <div className="detail-item-row">
                  <span className="detail-label-row"><Timer size={14}/> Work End</span>
                  <span className="detail-value-row truncate">{user?.workEndTime || "Not set"}</span>
                </div>
                <div className="detail-item-row">
                  <span className="detail-label-row"><Activity size={14}/> Current Status</span>
                  <span className={`detail-value-row truncate ${isCounsellorAvailable(user?.workStartTime, user?.workEndTime) ? 'status-available-text' : 'status-unavailable-text'}`}>
                    {user?.workStartTime && user?.workEndTime 
                      ? (isCounsellorAvailable(user?.workStartTime, user?.workEndTime) ? '● Available' : '● Unavailable')
                      : 'Hours not set'
                    }
                  </span>
                </div>
                <div className="detail-item-row">
                  <span className="detail-label-row"><Award size={14}/> Rating</span>
                  <span className="detail-value-row truncate">
                    <Star size={14} color="#ffd700" fill="#ffd700" style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> {user?.averageRating || 'N/A'} ({user?.totalRatings || 0})
                  </span>
                </div>
                
                <div className="work-hours-update-section">
                  <h4>Update Working Hours</h4>
                  <div className="work-hours-inputs">
                    <div className="work-hour-input-group">
                      <label>Start Time</label>
                      <input
                        type="time"
                        value={workHours.workStartTime}
                        onChange={(e) => setWorkHours({...workHours, workStartTime: e.target.value})}
                      />
                    </div>
                    <div className="work-hour-input-group">
                      <label>End Time</label>
                      <input
                        type="time"
                        value={workHours.workEndTime}
                        onChange={(e) => setWorkHours({...workHours, workEndTime: e.target.value})}
                      />
                    </div>
                  </div>
                  <button className="btn-primary" onClick={handleSaveWorkHours} style={{ marginTop: '12px', width: '100%' }}>
                    <CheckCircle size={14} /> Save Working Hours
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      );
    }

    if (activeTab === "requests" && normalizedRole === "student") return renderStudentRequests();
    if (activeTab === "notifications" && normalizedRole === "student") return renderStudentNotifications();
    if (activeTab === "ratings" && normalizedRole === "student") return renderStudentRatings();
    if (activeTab === "my-history" && (normalizedRole === "student" || normalizedRole === "counsellor")) return renderHistoryTab();
    if (activeTab === "all-requests" && normalizedRole === "counsellor") return renderCounsellorRequests();
    if (activeTab === "my-ratings" && normalizedRole === "counsellor") return renderCounsellorRatings();

    if (activeTab === "total-requests" && normalizedRole === "admin") return renderAdminRequests();
    if (activeTab === "peoples" && normalizedRole === "admin") return renderAdminPeoples();
    if (activeTab === "all-ratings" && normalizedRole === "admin") return renderAdminRatings();

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
        .text-muted { color: #888; }

        .dashboard-layout { display: flex; height: 100vh; width: 100vw; overflow: hidden; }

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

        .main-area {
          flex-grow: 1; display: flex; flex-direction: column; position: relative;
          background: radial-gradient(circle at top right, rgba(255,215,0,0.03) 0%, rgba(10,10,10,1) 70%);
          min-width: 0;
        }

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

        .content-wrapper {
          padding: 30px 40px; flex-grow: 1; overflow-y: auto; display: flex; flex-direction: column;
          align-items: flex-start; width: 100%;
        }
        .content-wrapper:has(.placeholder-floating) { align-items: center; justify-content: center; }

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

        .analytics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; width: 100%; margin-bottom: 30px; }
        .graph-card { background: #111; border: 1px solid #222; border-radius: 12px; padding: 20px; }
        .graph-card h4 { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 20px; font-weight: 600; }

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

        .btn-secondary {
          background: #1a1a1a; color: #aaa; border: 1px solid #333;
          padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; display: flex;
          align-items: center; gap: 6px; font-size: 12px; transition: all 0.2s;
        }
        .btn-secondary:hover { border-color: #555; color: #fff; }

        .btn-success { background: #00e676; color: #000; border: none; padding: 6px 14px; border-radius: 6px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 12px; }
        .btn-danger { background: #ff4d4d; color: #fff; border: none; padding: 6px 14px; border-radius: 6px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 12px; }

        .btn-ban { background: rgba(255, 77, 77, 0.1); color: #ff4d4d; border: 1px solid rgba(255, 77, 77, 0.3); padding: 6px 12px; border-radius: 6px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 4px; font-size: 11px; transition: all 0.2s; }
        .btn-ban:hover { background: #ff4d4d; color: #fff; }
        .btn-unban { background: rgba(0, 230, 118, 0.1); color: #00e676; border: 1px solid rgba(0, 230, 118, 0.3); padding: 6px 12px; border-radius: 6px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 4px; font-size: 11px; transition: all 0.2s; }
        .btn-unban:hover { background: #00e676; color: #000; }

        .btn-rate { background: linear-gradient(90deg, #ffd700 0%, #ff9800 100%); color: #000; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 12px; margin-top: 12px; transition: all 0.2s; }
        .btn-rate:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3); }

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

        .request-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; gap: 12px; }
        .request-card-header h3 { font-size: 16px; color: #fff; flex: 1; }
        .status-badge { padding: 3px 8px; border-radius: 20px; font-size: 10px; font-weight: bold; text-transform: uppercase; white-space: nowrap; }
        .status-pending { background: rgba(255, 193, 7, 0.2); color: #ffc107; }
        .status-inprogress { background: rgba(0, 191, 255, 0.2); color: #00bfff; }
        .status-completed { background: rgba(0, 230, 118, 0.2); color: #00e676; }
        .status-rejected { background: rgba(255, 77, 77, 0.2); color: #ff4d4d; }
        .status-banned { background: rgba(255, 77, 77, 0.3); color: #ff4d4d; }

        .request-desc { color: #bbb; font-size: 13px; line-height: 1.5; margin-bottom: 14px; }
        .request-meta { display: flex; flex-wrap: wrap; gap: 14px; font-size: 11px; color: #777; border-top: 1px solid #222; padding-top: 10px; }
        .request-meta strong { color: #aaa; }

        .priority-low { color: #00e676; font-weight: 600; }
        .priority-medium { color: #ffc107; font-weight: 600; }
        .priority-high { color: #ff4d4d; font-weight: 600; }
        .priority-inline { padding: 2px 8px; border-radius: 10px; font-size: 10px; text-transform: uppercase; }
        .priority-low.priority-inline { background: rgba(0, 230, 118, 0.15); }
        .priority-medium.priority-inline { background: rgba(255, 193, 7, 0.15); }
        .priority-high.priority-inline { background: rgba(255, 77, 77, 0.15); }

        .reply-box { margin-top: 14px; background: #1a1a1a; padding: 14px; border-left: 3px solid #ffd700; border-radius: 4px 8px 8px 4px; }
        .reply-box h4 { font-size: 12px; color: #ffd700; margin-bottom: 6px; }
        .reply-box p { font-size: 13px; color: #ddd; }
        .rejected-box { border-left-color: #ff4d4d; }

        .action-buttons { display: flex; gap: 10px; margin-top: 14px; padding-top: 14px; border-top: 1px dashed #333; }
        .reply-action-area { margin-top: 14px; display: flex; flex-direction: column; gap: 8px; }
        .reply-action-area textarea { width: 100%; background: #1a1a1a; border: 1px solid #333; color: #fff; padding: 10px; border-radius: 8px; font-size: 13px; outline: none; }
        .reply-action-area textarea:focus { border-color: #ffd700; }

        .rated-indicator { display: flex; align-items: center; gap: 8px; margin-top: 12px; padding: 8px 12px; background: rgba(255, 215, 0, 0.05); border-radius: 6px; }
        .rated-text { color: #888; font-size: 11px; }

        .filter-bar { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 20px; padding: 16px; background: #111; border: 1px solid #222; border-radius: 10px; }
        .filter-group { display: flex; align-items: center; gap: 8px; }
        .filter-group svg { color: #666; flex-shrink: 0; }
        .filter-input { background: #1a1a1a; border: 1px solid #333; color: #fff; padding: 8px 12px; border-radius: 6px; font-size: 12px; outline: none; width: 200px; }
        .filter-input:focus { border-color: #ffd700; }
        .filter-group select { background: #1a1a1a; border: 1px solid #333; color: #fff; padding: 8px 12px; border-radius: 6px; font-size: 12px; outline: none; cursor: pointer; }
        .filter-group select:focus { border-color: #ffd700; }
        .filter-result-text { color: #666; font-size: 11px; margin-bottom: 16px; }

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

        .table-responsive { width: 100%; overflow-x: auto; }
        .admin-table { width: 100%; border-collapse: collapse; background: #111; border-radius: 10px; overflow: hidden; }
        .admin-table th, .admin-table td { padding: 14px; text-align: left; border-bottom: 1px solid #222; font-size: 12.5px; }
        .admin-table th { background: #1a1a1a; color: #888; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
        .admin-table tr:hover { background: #151515; }
        .banned-row { background: rgba(255, 77, 77, 0.05) !important; }
        .action-buttons-cell { display: flex; gap: 8px; align-items: center; }
        .rating-inline { display: flex; align-items: center; gap: 4px; color: #ffd700; font-weight: 600; }
        .feedback-cell { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #aaa; }

        .work-status-card { background: #111; border: 1px solid #222; border-radius: 12px; margin-top: 20px; overflow: hidden; }
        .work-status-header { padding: 16px 20px; background: #1a1a1a; display: flex; align-items: center; gap: 10px; font-weight: 600; font-size: 14px; }
        .work-status-body { padding: 20px; }
        .work-time-display { color: #ccc; font-size: 14px; margin-bottom: 12px; font-family: monospace; }
        .time-label { color: #888; font-size: 12px; }
        .time-separator { margin: 0 12px; color: #555; }
        .work-status-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
        .status-available { background: rgba(0, 230, 118, 0.15); color: #00e676; }
        .status-unavailable { background: rgba(255, 77, 77, 0.15); color: #ff4d4d; }
        .status-dot { width: 8px; height: 8px; border-radius: 50%; }
        .status-available .status-dot { background: #00e676; box-shadow: 0 0 6px #00e676; animation: pulse 2s infinite; }
        .status-unavailable .status-dot { background: #ff4d4d; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

        .status-available-text { color: #00e676 !important; }
        .status-unavailable-text { color: #ff4d4d !important; }

        .work-hours-update-section { margin-top: 20px; padding: 20px; background: #111; border: 1px solid #222; border-radius: 12px; }
        .work-hours-update-section h4 { font-size: 14px; color: #fff; margin-bottom: 16px; }
        .work-hours-inputs { display: flex; gap: 16px; }
        .work-hour-input-group { flex: 1; }
        .work-hour-input-group label { display: block; font-size: 11px; color: #888; margin-bottom: 6px; text-transform: uppercase; }
        .work-hour-input-group input { width: 100%; background: #1a1a1a; border: 1px solid #333; color: #fff; padding: 10px; border-radius: 8px; font-size: 13px; outline: none; }
        .work-hour-input-group input:focus { border-color: #ffd700; }

        .counsellor-legend { display: flex; gap: 16px; margin-top: 10px; flex-wrap: wrap; }
        .legend-item { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #888; }
        .legend-dot { width: 8px; height: 8px; border-radius: 50%; }
        .legend-available .legend-dot { background: #00e676; }
        .legend-unavailable .legend-dot { background: #ff4d4d; }

        .counsellors-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
        .counsellor-card { background: #111; border: 1px solid #222; border-radius: 12px; padding: 20px; transition: all 0.2s; }
        .counsellor-card:hover { border-color: #333; transform: translateY(-2px); }
        .counsellor-card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .counsellor-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #ffd700, #ff9800); color: #000; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 16px; }
        .counsellor-card-header h4 { font-size: 14px; color: #fff; margin-bottom: 2px; }
        .counsellor-email { font-size: 11px; color: #777; }
        .counsellor-card-rating { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
        .rating-value { color: #ffd700; font-weight: 700; font-size: 14px; }
        .rating-count { color: #666; font-size: 11px; }
        .counsellor-card-hours { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #888; }
        .availability-badge { padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; }
        .availability-badge.available { background: rgba(0, 230, 118, 0.15); color: #00e676; }
        .availability-badge.unavailable { background: rgba(255, 77, 77, 0.15); color: #ff4d4d; }

        .ratings-list { display: flex; flex-direction: column; gap: 12px; }
        .rating-card { background: #111; border: 1px solid #222; border-radius: 10px; padding: 16px; display: flex; align-items: center; gap: 16px; }
        .rating-card-left { flex: 1; min-width: 0; }
        .rating-counsellor-name, .rating-student-name { font-size: 14px; font-weight: 600; color: #fff; margin-bottom: 4px; }
        .rating-request-title { font-size: 12px; color: #666; }
        .rating-student-avatar { width: 32px; height: 32px; border-radius: 50%; background: #1a1a1a; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; margin-right: 8px; }
        .rating-card-center { flex-shrink: 0; }
        .rating-card-right { flex: 1; text-align: right; min-width: 0; }
        .rating-feedback { font-size: 12px; color: #aaa; font-style: italic; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .rating-date { font-size: 10px; color: #555; }

        .avg-rating-card { background: linear-gradient(135deg, #1a1a1a, #111); border: 1px solid #222; border-radius: 12px; padding: 24px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .avg-rating-left { display: flex; align-items: center; gap: 16px; }
        .avg-rating-number { font-size: 42px; font-weight: 800; color: #ffd700; }
        .total-ratings-text { color: #888; font-size: 13px; }

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
        .detail-label-row svg { color: "#ffd700"; opacity: 0.8; }
        .detail-value-row { color: #fff; font-size: 13px; font-weight: 500; text-align: right; max-width: 60%; }

        .capitalize { text-transform: capitalize; }
        .status-active { color: #00e676; font-weight: 600; }

        .placeholder-floating { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: #555; }
        .placeholder-icon { color: rgba(255, 215, 0, 0.3); margin-bottom: 16px; }
        .placeholder-title { color: #eee; font-size: 18px; font-weight: 600; margin-bottom: 8px; letter-spacing: 0.5px; }
        .placeholder-subtitle { font-size: 12px; color: #777; max-width: 300px; line-height: 1.6; }

        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
        .modal-content { background: #111; border: 1px solid #222; border-radius: 16px; padding: 30px; width: 100%; max-width: 450px; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .modal-header h3 { font-size: 18px; color: #fff; }
        .modal-close { background: transparent; border: none; color: #666; cursor: pointer; padding: 4px; }
        .modal-close:hover { color: #fff; }

        .rating-modal-stars { display: flex; justify-content: center; margin: 24px 0; }
        .rating-feedback-input { width: 100%; background: #1a1a1a; border: 1px solid #333; color: #fff; padding: 12px; border-radius: 8px; font-size: 13px; outline: none; min-height: 80px; resize: vertical; margin-bottom: 16px; }
        .rating-feedback-input:focus { border-color: #ffd700; }
        .rating-submit-btn { width: 100%; background: linear-gradient(90deg, #ffc107, #ff9800); color: #000; border: none; padding: 12px; border-radius: 8px; font-weight: 700; font-size: 14px; cursor: pointer; }
        .rating-submit-btn:hover { opacity: 0.9; }

        .work-hours-popup-content { max-width: 400px; }
        .work-hours-popup-content h3 { text-align: center; margin-bottom: 8px; }
        .work-hours-popup-desc { text-align: center; color: #888; font-size: 12px; margin-bottom: 24px; }
        .work-hours-popup-inputs { display: flex; gap: 16px; margin-bottom: 24px; }
        .work-hours-popup-input { flex: 1; text-align: center; }
        .work-hours-popup-input label { display: block; font-size: 11px; color: #888; margin-bottom: 8px; text-transform: uppercase; }
        .work-hours-popup-input input { width: 100%; background: #1a1a1a; border: 1px solid #333; color: #fff; padding: 14px; border-radius: 10px; font-size: 18px; text-align: center; outline: none; }
        .work-hours-popup-input input:focus { border-color: #ffd700; }
        .work-hours-popup-skip { width: 100%; background: transparent; color: #666; border: 1px solid #333; padding: 10px; border-radius: 8px; font-size: 12px; cursor: pointer; margin-top: 12px; }
        .work-hours-popup-skip:hover { border-color: #555; color: #999; }

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
          .filter-bar { flex-direction: column; }
          .filter-input { width: 100%; }
          .filter-group select { width: 100%; }
          .work-hours-inputs { flex-direction: column; }
          .analytics-grid { grid-template-columns: 1fr; }

          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .counsellors-grid { grid-template-columns: 1fr; }
          
          .rating-card { flex-direction: column; align-items: flex-start; }
          .rating-card-right { text-align: left; }
          .avg-rating-card { flex-direction: column; gap: 16px; text-align: center; }

          .modal-content { padding: 24px; margin: 16px; }
          .work-hours-popup-inputs { flex-direction: column; gap: 12px; }

          .bottom-nav {
            display: flex; position: fixed; bottom: 0; left: 0; right: 0; background: rgba(15, 15, 15, 0.95);
            backdrop-filter: blur(15px); border-top: 1px solid #222; padding: 10px 5px; justify-content: space-around;
            z-index: 100; padding-bottom: calc(10px + env(safe-area-inset-bottom));
          }
          .bottom-nav-item {
            display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
            color: #777; font-size: 9px; font-weight: 500; cursor: pointer; transition: all 0.2s ease; flex: 1;
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

        <main className="main-area">

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

          <div className="content-wrapper">
            <AnimatePresence mode="wait">
              {renderContent()}
            </AnimatePresence>
          </div>

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

      <AnimatePresence>
        {showWorkHoursPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={(e) => e.target === e.currentTarget && setShowWorkHoursPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="modal-content work-hours-popup-content"
            >
              <div className="modal-header">
                <h3><Timer size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} />Set Working Hours</h3>
                <button className="modal-close" onClick={() => setShowWorkHoursPopup(false)}>
                  <XCircle size={20} />
                </button>
              </div>
              <p className="work-hours-popup-desc">Set your availability hours so students know when you're available for counselling.</p>
              
              <div className="work-hours-popup-inputs">
                <div className="work-hours-popup-input">
                  <label>Start Time</label>
                  <input
                    type="time"
                    value={workHours.workStartTime}
                    onChange={(e) => setWorkHours({...workHours, workStartTime: e.target.value})}
                  />
                </div>
                <div className="work-hours-popup-input">
                  <label>End Time</label>
                  <input
                    type="time"
                    value={workHours.workEndTime}
                    onChange={(e) => setWorkHours({...workHours, workEndTime: e.target.value})}
                  />
                </div>
              </div>

              <button className="rating-submit-btn" onClick={handleSaveWorkHours}>
                Save Working Hours
              </button>
              <button className="work-hours-popup-skip" onClick={() => setShowWorkHoursPopup(false)}>
                Skip for now
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRatingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={(e) => e.target === e.currentTarget && setShowRatingModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="modal-content"
            >
              <div className="modal-header">
                <h3><Star size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom', color: '#ffd700' }} />Rate this Response</h3>
                <button className="modal-close" onClick={() => setShowRatingModal(null)}>
                  <XCircle size={20} />
                </button>
              </div>

              <div className="rating-modal-stars">
                <StarRating
                  rating={ratingData.rating}
                  onRatingChange={(val) => setRatingData({...ratingData, rating: val})}
                  size={36}
                />
              </div>

              <p style={{ textAlign: 'center', color: '#888', fontSize: '12px', marginBottom: '20px' }}>
                                {ratingData.rating === 0 ? 'Select a rating' : 
                 ratingData.rating === 1 ? 'Poor' :
                 ratingData.rating === 2 ? 'Fair' :
                 ratingData.rating === 3 ? 'Good' :
                 ratingData.rating === 4 ? 'Very Good' : 'Excellent'}
              </p>

              <textarea
                className="rating-feedback-input"
                placeholder="Share your feedback (optional)..."
                value={ratingData.feedback}
                onChange={(e) => setRatingData({...ratingData, feedback: e.target.value})}
              />

              <button
                className="rating-submit-btn"
                onClick={() => handleSubmitRating(showRatingModal, requests.find(r => r._id === showRatingModal)?.counsellorId?._id)}
                disabled={ratingData.rating === 0}
                style={{ opacity: ratingData.rating === 0 ? 0.5 : 1 }}
              >
                Submit Rating
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Dashboard;