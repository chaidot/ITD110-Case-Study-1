import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './Login.js';
import './App.css';
import Papa from 'papaparse';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import Dashboard from './Dashboard'; 
import Sidebar from './Sidebar'; 
import './Sidebar.css'; 

const API_URL = 'http://localhost:5000/residents';

const InputMethodModal = ({ isOpen, onClose, onSelectInputMethod, inputMethod, formData, handleChange, handleAddSubmit, handleEditSubmit, isEditing, handleCSVUpload }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div className="form-container">
        <h3>Select Input Method</h3>
        <div className="modal-buttons">
          <button 
            onClick={() => onSelectInputMethod('manual')} 
          >
            Manual Entry
          </button>
          <button 
            onClick={() => onSelectInputMethod('csv')} 
          >
            Upload CSV
          </button>
        </div>

        {inputMethod === 'manual' && (
          <form onSubmit={isEditing ? handleEditSubmit : handleAddSubmit}>
            <label htmlFor="id">ID:</label>
            <input type="text" id="id" name="id" placeholder="ID" required disabled={isEditing} autoComplete="off" />
          
            <label htmlFor="name">Full Name:</label>
            <input type="text" id="name" name="name" required autoComplete="name" />
          
            <label htmlFor="age">Age:</label>
            <input type="number" id="age" name="age" required autoComplete="bday" />
          
            <label htmlFor="gender">Gender:</label>
            <select id="gender" name="gender" required>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          
            <label htmlFor="householdNumber">Household Number:</label>
            <input type="text" id="householdNumber" name="householdNumber" required />
          
            <label htmlFor="occupation">Occupation:</label>
            <input type="text" id="occupation" name="occupation" required />
          
            <label htmlFor="civilStatus">Civil Status:</label>
            <select id="civilStatus" name="civilStatus" required>
              <option value="">Select Status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Widowed">Widowed</option>
              <option value="Separated">Separated</option>
            </select>
          
            <label htmlFor="dependents">Number of Dependents:</label>
            <input type="number" id="dependents" name="dependents" required />
          
            <label htmlFor="voterStatus">Voter Status:</label>
            <select id="voterStatus" name="voterStatus" required>
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          
            <button type="submit">
              {isEditing ? "Update Resident" : "Add Resident"}
            </button>
          </form>
        )}        

        {inputMethod === 'csv' && (
          <div className="csv-upload">
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
            />
            <p>
              Please ensure your CSV file has the following columns in order:<br />
              ID, Name, Age, Gender, Address, Household Number, Occupation, CivilStatus, Dependents, Contact Number, Email, Voter Status
            </p>
          </div>
        )}

        <button 
          onClick={onClose} 
          style={{ 
            margin: '10px', 
            padding: '10px 20px', 
            borderRadius: '5px', 
            cursor: 'pointer', 
            backgroundColor: '#e63946', 
            color: 'black', 
            border: 'none', 
            fontSize: '16px',
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

function App() {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    age: '',
    gender: '',
    address: '',
    householdNumber: '',
    occupation: '',
    civilStatus: '',
    dependents: '',
    contactNumber: '',
    email: '',
    voterStatus: ''
  });
  
  const [residents, setResidents] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('name');
  const [filteredResidents, setfilteredResidents] = useState([]);
  const [inputMethod, setInputMethod] = useState('manual');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [residentToDelete, setResidentToDelete] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentChartPage, setCurrentChartPage] = useState(1);
  
  // RBAC
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Login
  const userRoles = {
    admin: ["add_resident", "edit_resident", "delete_resident", "view_residents"],
    user: ["add_resident", "edit_resident", "delete_resident", "view_residents"],
    resident: ["view_residents"],
  };

  const hasPermission = (permission) => {
    if (!currentUser || !currentUser.role) return false;
    const permissions = userRoles[currentUser.role] || [];
    return permissions.includes(permission);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return; 
    fetchResidents();
  }, [isAuthenticated]);

  // Event handlers
  const handleLogin = (user, token) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    
    if (token) {
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    toast.success('Logged in successfully!');
  };

  // Logout
  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    toast.success('Logged out successfully');

    setTimeout(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
      setIsAuthenticated(false);
      setCurrentUser(null);
      setShowLogoutModal(false);
    }, 800);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const handleSelectInputMethod = (method) => {
    setInputMethod(method);
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const headerMap = {
      id: "id",
      name: "name",
      age: "age",
      gender: "gender",
      address: "address",
      householdnumber: "householdNumber",
      occupation: "occupation",
      civilstatus: "civilStatus",
      dependents: "dependents",
      contactnumber: "contactNumber",
      email: "email",
      voterstatus: "voterStatus"
    };
  
    Papa.parse(file, {
      header: true,
      transformHeader: (header) => {
        const normalizedHeader = header.trim().toLowerCase();
        return headerMap[normalizedHeader] || normalizedHeader;
      },
      complete: async (result) => {
        console.log("Raw parsed data:", result.data);
  
        const csvData = result.data
          .filter(row => Object.values(row).some(value => value && String(value).trim() !== ""))
          .map(resident => {
            const cleanedResident = {
              id: resident.id?.toString().trim() || null,
              name: resident.name?.toString().trim() || null,
              age: resident.age ? parseInt(resident.age.toString().trim(), 10) : null,
              gender: resident.gender?.toString().trim() || null,
              address: resident.address?.toString().trim() || null,
              householdNumber: resident.householdNumber?.toString().trim() || null,
              occupation: resident.occupation?.toString().trim() || null,
              civilStatus: resident.civilStatus?.toString().trim() || null,
              dependents: resident.dependents ? parseInt(resident.dependents.toString().trim(), 10) : null,
              contactNumber: resident.contactNumber?.toString().trim() || null,
              email: resident.email?.toString().trim() || null,
              voterStatus: resident.voterStatus?.toString().trim().toLowerCase() === "yes" ? "Yes" : "No"
            };
  
            console.log("Cleaned resident data:", cleanedResident);
  
            return cleanedResident;
          });
  
        console.log("Processed data (cleaned):", csvData);
  
        const invalidRows = csvData.filter(resident => {
          const missingFields = [];
          if (!resident.id) missingFields.push('id');
          if (!resident.name) missingFields.push('name');
          if (!resident.age) missingFields.push('age');
          if (!resident.gender) missingFields.push('gender');
          if (!resident.address) missingFields.push('address');
          if (!resident.householdNumber) missingFields.push('householdNumber');
          if (!resident.occupation) missingFields.push('occupation');
          if (!resident.civilStatus) missingFields.push('civilStatus');
          if (resident.dependents === null) missingFields.push('dependents');
          if (!resident.contactNumber) missingFields.push('contactNumber');
          if (!resident.email) missingFields.push('email');
          if (!resident.voterStatus) missingFields.push('voterStatus');
  
          if (missingFields.length > 0) {
            console.error(`Invalid row for resident ${resident.id}:`, {
              missingFields,
              rowData: resident
            });
          }
  
          return missingFields.length > 0;
        });
  
        if (invalidRows.length > 0) {
          console.error("Invalid rows detected:", invalidRows);
          toast.error(`CSV contains ${invalidRows.length} row(s) with missing required fields. Please ensure all fields are filled.`);
          return;
        }
  
        if (csvData.length === 0) {
          toast.error('No valid data found in CSV');
          return;
        }
  
        try {
          for (const resident of csvData) {
            console.log("Attempting to upload resident:", resident);
            const response = await axios.post(API_URL, resident);
            console.log("Upload response:", response.data);
          }
  
          toast.success('CSV uploaded successfully!');
          fetchResidents();
        } catch (error) {
          console.error('Upload error:', {
            error,
            errorResponse: error.response?.data,
            errorMessage: error.message
          });
          const errorMessage = error.response?.data?.message || error.message;
          toast.error(`Error uploading CSV: ${errorMessage}`);
        }
      },
      error: (error) => {
        console.error('Papa Parse error:', error);
        toast.error('Error parsing CSV file');
      }
    });
  };
  
  const fetchResidents = async () => {
    try {
      const response = await axios.get(API_URL);
      const sortedresidents = response.data.sort((a, b) => {
        const numA = parseInt(a.id.replace(/\D/g, ""), 10); // Extract numeric part
        const numB = parseInt(b.id.replace(/\D/g, ""), 10);
        return numA - numB;
      });
      setResidents(sortedresidents);
      setfilteredResidents(sortedresidents);
    } catch (error) {
      console.error('Error fetching residents:', error);
      toast.error('Error fetching residents!');
    }
  };

  // Create a resident
const addResident = async (residentData) => {
  try {
      const token = localStorage.getItem("token");
      const response = await axios.post(API_URL, residentData, {
          headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Resident added:", response.data);
  } catch (error) {
      console.error("Error adding resident:", error.response?.data || error.message);
  }
};

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setfilteredResidents(residents);
      return;
    }

    const filtered = residents.filter(resident => {
      const searchValue = resident[searchField]?.toString().toLowerCase() || '';
      return searchValue.includes(searchTerm.toLowerCase());
    });

    setfilteredResidents(filtered);
    setCurrentPage(1); // Reset to first page after search

    if (filtered.length === 0) {
      toast.info("No residents found.");
    } else {
      toast.success(`Found ${filtered.length} resident(s)`);
    }
  };

  const handleResetSearch = () => {
    setSearchTerm('');
    setfilteredResidents(residents);
    setCurrentPage(1); // Reset to first page after reset
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, formData);
      toast.success('Resident added successfully!');
      fetchResidents();
      setFormData({
        id: '',
        name: '',
        age: '',
        gender: '',
        address: '',
        householdNumber: '',
        occupation: '',
        civilStatus: '',
        dependents: '',
        contactNumber: '',
        email: '',
        voterStatus: ''
      });
      setIsModalOpen(false); // Close modal after submission
    } catch (error) {
      toast.error('Error adding resident!');
    }
  };
  
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/${formData.id}`, formData);
      toast.success('Resident updated successfully!');
      fetchResidents();
      setFormData({
        id: '',
        name: '',
        age: '',
        gender: '',
        address: '',
        householdNumber: '',
        occupation: '',
        civilStatus: '',
        dependents: '',
        contactNumber: '',
        email: '',
        voterStatus: ''
      });
      setIsEditing(false);
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Error updating resident!');
    }
  };
  
  const handleDelete = async () => {
    if (!residentToDelete) return;
    
    try {
      await axios.delete(`${API_URL}/${residentToDelete}`);
      toast.success("Resident deleted!");
      fetchResidents();
      setIsDeleteModalOpen(false); // Close modal after deletion
    } catch (error) {
      toast.error("Error deleting resident!");
    }
  };
  
  // Function to open the modal
  const confirmDelete = (id) => {
    setResidentToDelete(id);
    setIsDeleteModalOpen(true);
  };
  
  const handleEdit = (resident) => {
    setFormData(resident);
    setIsEditing(true);
    setInputMethod('manual');
    setIsModalOpen(true); // Open modal when editing
  };

  // Pagination logic
  const indexOfLastresident = currentPage * itemsPerPage;
  const indexOfFirstresident = indexOfLastresident - itemsPerPage;
  const currentresidents = filteredResidents.slice(indexOfFirstresident, indexOfLastresident);
  const totalPages = Math.ceil(filteredResidents.length / itemsPerPage);

  const paginate = (pageNumber) => {
    // Make sure page number is within valid range
    if (pageNumber < 1) pageNumber = 1;
    if (pageNumber > totalPages) pageNumber = totalPages;
    setCurrentPage(pageNumber);
  };
  
  const paginateCharts = (pageNumber) => {
    // Chart pagination has 3 fixed pages
    if (pageNumber < 1) pageNumber = 1;
    if (pageNumber > 3) pageNumber = 3;
    setCurrentChartPage(pageNumber);
  };

  // Data for charts
  const genderData = residents.reduce((acc, resident) => {
    acc[resident.gender] = (acc[resident.gender] || 0) + 1;
    return acc;
  }, {});

  const genderChartData = Object.entries(genderData).map(([gender, count]) => ({
    name: gender,
    residents: count,
  }));

  // Age Distribution Data
  const ageData = residents.reduce((acc, resident) => {
    const ageGroup = resident.age < 18 ? 'Under 18' :
                     resident.age < 30 ? '18-29' :
                     resident.age < 50 ? '30-49' :
                     '50+';
    acc[ageGroup] = (acc[ageGroup] || 0) + 1;
    return acc;
  }, {});

  const ageChartData = Object.entries(ageData).map(([ageGroup, count]) => ({
    name: ageGroup,
    residents: count,
  }));

  // Household Size Data
  const householdData = residents.reduce((acc, resident) => {
    acc[resident.householdNumber] = (acc[resident.householdNumber] || 0) + 1;
    return acc;
  }, {});

  const householdChartData = Object.entries(householdData).map(([household, count]) => ({
    name: `Household ${household}`,
    residents: count,
  }));

  // Voter Status Data
  const voterData = residents.reduce((acc, resident) => {
    acc[resident.voterStatus] = (acc[resident.voterStatus] || 0) + 1;
    return acc;
  }, {});

  const voterChartData = Object.entries(voterData).map(([status, count]) => ({
    name: status === "Yes" ? "Registered Voters" : "Non-Voters",
    residents: count,
  }));

  return (
    <>
      <div className='Header'> 
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </div>
      
      {showLogoutModal && (
        <div className="modal-overlay-logout">
          <div className="modal-card-logout">
            <h3>Are you sure you want to logout?</h3>
            <div className="modal-actions-out">
              <button onClick={cancelLogout} className="cancel-btn">
                Cancel
              </button>
              <button onClick={confirmLogout} className="confirm-btn">
                Confirm Logout
              </button>
            </div>
          </div>
        </div>
      )}
    
      <div className="container" style={{ textAlign: 'center', alignContent: 'center' }}>
        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Confirm Deletion</h3>
              <p>Are you sure you want to delete this resident?</p>
              <div className="modal-buttons">
                <button className="cancel-btn" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
                <button className="delete-btn" onClick={handleDelete}>Delete</button>
              </div>
            </div>
          </div>
        )}

        <div className="barangay-header">
          <div className="barangay-logo-container">
            <img
              src="/brgy-logo.jpg"
              alt="Selyo ng Barangay Del Carmen"
              className="barangay-logo"
            />
            <div className="barangay-text-container">
              <h1 className="barangay-name">BARANGAY PROFILING SYSTEM</h1>
              <p className="barangay-location">Del Carmen, Iligan City</p>
            </div>
          </div>
        </div>

        <div className="search-section">
          <select value={searchField} onChange={(e) => setSearchField(e.target.value)}>
            <option value="name">Name</option>
            <option value="age">Age</option>
            <option value="email">Email</option>
            <option value="id">ID</option>
          </select>
          <input
            type="text"
            placeholder="Enter search term..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
          <button onClick={handleSearch} id="search-button">Search</button>
          <button onClick={handleResetSearch} id="reset-button">Reset</button>
        </div>

        {hasPermission("add_resident") && (
          <button
            onClick={() => {
              setIsEditing(false); // Ensure it's not in edit mode
              setFormData({       // Reset form data for residents
                id: '',
                name: '',
                age: '',
                gender: '',
                address: '',
                householdNumber: '',
                occupation: '',
                civilStatus: '',
                dependents: '',
                contactNumber: '',
                email: '',
                voterStatus: ''
              });
              setIsModalOpen(true); // Open modal
            }}
            className='add-btn'
            id="cssAddButton"
          >
            Add New Resident
          </button>
        )}

        <InputMethodModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSelectInputMethod={handleSelectInputMethod}
          inputMethod={inputMethod}
          formData={formData}
          handleChange={handleChange}
          handleAddSubmit={handleAddSubmit}
          handleEditSubmit={handleEditSubmit}
          isEditing={isEditing}
          handleCSVUpload={handleCSVUpload} 
        />

        {/* Add the Sidebar component here */}
        <Sidebar
          activeTab="residents"
          setActiveTab={() => {}}
          handleLogout={handleLogout}
        />
        n
        {/* Add the Dashboard component here */}
        <Dashboard residents={residents} />

        <div className="table-section">
          <h2 style={{ color: "#40B5AD", fontSize: "28px", fontWeight: "bold", fontFamily: "Arial, sans-serif", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "20px", marginTop: "50px", paddingBottom: "10px", borderBottom: "2px solid #40B5AD", display: "block" }}>
            List of Residents
          </h2>
          
          <div className="items-per-page">
            <label>Items per page: </label>
            <select 
              value={itemsPerPage} 
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <table border="1" align="center" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Household #</th>
                <th>Occupation</th>
                <th>Civil Status</th>
                <th>Dependents</th>
                <th>Voter</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {residents.map((resident) => (
                <tr key={resident.id}>
                  <td>{resident.id}</td>
                  <td>{resident.name}</td>
                  <td>{resident.age}</td>
                  <td>{resident.gender}</td>
                  <td>{resident.householdNumber}</td>
                  <td>{resident.occupation}</td>
                  <td>{resident.civilStatus}</td>
                  <td>{resident.dependents}</td>
                  <td>{resident.voterStatus}</td>
                  <td>
                    <button onClick={() => handleEdit(resident)}>Edit</button>
                    <button onClick={() => handleDelete(resident.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination for table */}
          <div className="pagination">
            <button 
              onClick={() => paginate(currentPage - 1)} 
              disabled={currentPage === 1}
              className="pagination-button"
            >
              Previous
            </button>
            
            <div className="page-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={currentPage === number ? 'active-page' : 'pagination-button'}
                >
                  {number}
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => paginate(currentPage + 1)} 
              disabled={currentPage === totalPages || totalPages === 0}
              className="pagination-button"
            >
              Next
            </button>
          </div>
        </div>
        
        {/* Charts Section */}
        <div className="charts-section">
          <h2 style={{ color: "#40B5AD", fontSize: "24px", fontWeight: "bold", fontFamily: "Arial, sans-serif" }}>
            Data Visualization
          </h2>

          <div className="chart-container" style={{ padding: "20px", backgroundColor: "#f4f7fc", borderRadius: "8px", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)" }}>
            
            {/* Gender Distribution */}
            {currentChartPage === 1 && (
              <>
                <h3>Gender Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={genderChartData} dataKey="residents" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {genderChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F'][index % 2]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </>
            )}

            {/* Age Distribution */}
            {currentChartPage === 2 && (
              <>
                <h3>Age Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ageChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" label={{ value: 'Age Groups', position: 'insideBottom', offset: -5 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="residents" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </>
            )}

            {/* Household Sizes */}
            {currentChartPage === 3 && (
              <>
                <h3>Household Sizes</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={householdChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" label={{ value: 'Household Number', position: 'insideBottom', offset: -5 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="residents" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </>
            )}

            {/* Voter Status */}
            {currentChartPage === 4 && (
              <>
                <h3>Voter Status</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={voterChartData} dataKey="residents" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {voterChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#00C49F', '#FFBB28'][index % 2]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </>
            )}

            {/* Pagination for charts */}
            <div className="chart-pagination">
              <button 
                onClick={() => paginateCharts(currentChartPage - 1)} 
                disabled={currentChartPage === 1}
                className="pagination-button"
              >
                Previous
              </button>
              
              <div className="page-numbers">
                {[1, 2, 3, 4].map(number => (
                  <button
                    key={number}
                    onClick={() => paginateCharts(number)}
                    className={currentChartPage === number ? 'active-page' : 'pagination-button'}
                  >
                    {number}
                  </button>
                ))}
              </div>
              
              <button 
                onClick={() => paginateCharts(currentChartPage + 1)} 
                disabled={currentChartPage === 4}
                className="pagination-button"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <ToastContainer />
      </div>
    </>
  );
}

export default App;