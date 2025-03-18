import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const Dashboard = ({ residents }) => {
  // Data calculations for dashboard metrics
  const totalResidents = residents.length;
  const totalHouseholds = new Set(residents.map(r => r.householdNumber)).size;
  const averageAge = residents.length > 0 
    ? Math.round(residents.reduce((sum, r) => sum + Number(r.age), 0) / residents.length) 
    : 0;
  const voterCount = residents.filter(r => r.voterStatus === "Yes").length;
  const voterPercentage = residents.length > 0 
    ? Math.round((voterCount / residents.length) * 100) 
    : 0;

  // Gender Distribution Data
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

  // Civil Status Data
  const civilStatusData = residents.reduce((acc, resident) => {
    acc[resident.civilStatus] = (acc[resident.civilStatus] || 0) + 1;
    return acc;
  }, {});

  const civilStatusChartData = Object.entries(civilStatusData).map(([status, count]) => ({
    name: status,
    residents: count,
  }));

  // Voters Data
  const voterData = residents.reduce((acc, resident) => {
    acc[resident.voterStatus] = (acc[resident.voterStatus] || 0) + 1;
    return acc;
  }, {});

  const voterChartData = Object.entries(voterData).map(([status, count]) => ({
    name: status === "Yes" ? "Registered Voters" : "Non-Voters",
    residents: count,
  }));

  return (
    <div className="dashboard">
      <h2 className="dashboard-title">Barangay Dashboard</h2>
      
      {/* KPI Cards */}
      <div className="dashboard-metrics">
        <div className="metric-card">
          <h3>Total Residents</h3>
          <p className="metric-value">{totalResidents}</p>
        </div>
        <div className="metric-card">
          <h3>Total Households</h3>
          <p className="metric-value">{totalHouseholds}</p>
        </div>
        <div className="metric-card">
          <h3>Average Age</h3>
          <p className="metric-value">{averageAge}</p>
        </div>
        <div className="metric-card">
          <h3>Voter Percentage</h3>
          <p className="metric-value">{voterPercentage}%</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="dashboard-charts-row">
        <div className="chart-card">
          <h3>Gender Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie 
                data={genderChartData} 
                dataKey="residents" 
                nameKey="name" 
                cx="50%" 
                cy="50%" 
                outerRadius={80} 
                fill="#8884d8"
                label
              >
                {genderChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28'][index % 3]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3>Age Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ageChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="residents" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="dashboard-charts-row">
        <div className="chart-card">
          <h3>Civil Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={civilStatusChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="residents" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3>Voter Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie 
                data={voterChartData} 
                dataKey="residents" 
                nameKey="name" 
                cx="50%" 
                cy="50%" 
                outerRadius={80} 
                fill="#8884d8"
                label
              >
                {voterChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#00C49F', '#FFBB28'][index % 2]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;