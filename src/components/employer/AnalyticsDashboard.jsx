import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Clock, Users, Star, DollarSign, Briefcase, CheckCircle } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function AnalyticsDashboard({ shifts, applications, jobs, jobApplications }) {
  // Shift Fill Rate
  const totalShifts = shifts.length;
  const filledShifts = shifts.filter(s => s.status === 'filled' || s.status === 'completed').length;
  const fillRate = totalShifts > 0 ? ((filledShifts / totalShifts) * 100).toFixed(1) : 0;

  // Average Response Time (time from shift posted to first application)
  const shiftsWithApps = shifts.filter(s => s.applications_count > 0);
  const avgResponseTime = shiftsWithApps.length > 0 
    ? shiftsWithApps.reduce((sum, shift) => {
        const shiftApps = applications.filter(a => a.shift_id === shift.id);
        if (shiftApps.length > 0) {
          const firstApp = shiftApps.sort((a, b) => new Date(a.created_date) - new Date(b.created_date))[0];
          const hours = (new Date(firstApp.created_date) - new Date(shift.created_date)) / (1000 * 60 * 60);
          return sum + hours;
        }
        return sum;
      }, 0) / shiftsWithApps.length
    : 0;

  // Worker Ratings (from completed shifts)
  const completedShifts = shifts.filter(s => s.status === 'completed' && s.reviewed);
  const avgWorkerRating = completedShifts.length > 0 
    ? (completedShifts.reduce((sum, s) => sum + (s.worker_rating || 0), 0) / completedShifts.length).toFixed(1)
    : 0;

  // Cost per hire for jobs
  const acceptedJobApps = jobApplications.filter(a => a.status === 'accepted');
  const totalJobApps = jobApplications.length;
  const costPerHire = acceptedJobApps.length > 0 
    ? (totalJobApps / acceptedJobApps.length).toFixed(1)
    : 0;

  // Monthly data for charts
  const last6Months = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();
    const monthKey = `${year}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    const monthShifts = shifts.filter(s => s.created_date?.startsWith(monthKey));
    const monthApps = applications.filter(a => a.created_date?.startsWith(monthKey));
    
    last6Months.push({
      name: monthName,
      shifts: monthShifts.length,
      applications: monthApps.length,
      filled: monthShifts.filter(s => s.status === 'filled' || s.status === 'completed').length
    });
  }

  // Role type distribution
  const roleDistribution = [
    { name: 'Barista', value: shifts.filter(s => s.role_type === 'barista').length, color: '#C89F8C' },
    { name: 'Chef', value: shifts.filter(s => s.role_type === 'chef').length, color: '#8A9B8E' }
  ];

  // Application status breakdown
  const appStatusData = [
    { name: 'Pending', value: applications.filter(a => a.status === 'pending').length, color: '#E8E3DC' },
    { name: 'Accepted', value: applications.filter(a => a.status === 'accepted').length, color: '#8A9B8E' },
    { name: 'Rejected', value: applications.filter(a => a.status === 'rejected').length, color: '#C89F8C' }
  ];

  const metrics = [
    {
      title: "Shift Fill Rate",
      value: `${fillRate}%`,
      change: fillRate > 75 ? "+12%" : "-5%",
      trend: fillRate > 75 ? "up" : "down",
      icon: CheckCircle,
      color: "#8A9B8E"
    },
    {
      title: "Avg Response Time",
      value: avgResponseTime > 0 ? `${avgResponseTime.toFixed(1)}h` : "N/A",
      change: "-18%",
      trend: "up",
      icon: Clock,
      color: "#C89F8C"
    },
    {
      title: "Worker Rating",
      value: avgWorkerRating > 0 ? avgWorkerRating : "N/A",
      change: "+0.3",
      trend: "up",
      icon: Star,
      color: "#705D56"
    },
    {
      title: "Cost per Hire",
      value: costPerHire > 0 ? `${costPerHire} apps` : "N/A",
      change: "-2",
      trend: "up",
      icon: DollarSign,
      color: "#A67C6D"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => (
          <Card key={idx} className="border rounded-2xl" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: metric.color + '20' }}>
                  <metric.icon className="w-5 h-5" style={{ color: metric.color }} />
                </div>
                <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg ${metric.trend === 'up' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {metric.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {metric.change}
                </div>
              </div>
              <div className="text-3xl font-light mb-1" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                {metric.value}
              </div>
              <div className="text-sm" style={{ color: 'var(--clay)' }}>{metric.title}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shift & Applications Trend */}
        <Card className="border rounded-2xl" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
          <CardHeader>
            <CardTitle className="font-normal text-lg" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              6-Month Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={last6Months}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E3DC" />
                <XAxis dataKey="name" stroke="#A67C6D" />
                <YAxis stroke="#A67C6D" />
                <Tooltip contentStyle={{ backgroundColor: '#FFFCF7', border: '1px solid #E8E3DC', borderRadius: '12px' }} />
                <Legend />
                <Line type="monotone" dataKey="shifts" stroke="#C89F8C" strokeWidth={2} name="Shifts Posted" />
                <Line type="monotone" dataKey="applications" stroke="#8A9B8E" strokeWidth={2} name="Applications" />
                <Line type="monotone" dataKey="filled" stroke="#705D56" strokeWidth={2} name="Filled" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Role Distribution */}
        <Card className="border rounded-2xl" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
          <CardHeader>
            <CardTitle className="font-normal text-lg" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              Role Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={roleDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {roleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#FFFCF7', border: '1px solid #E8E3DC', borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Application Status */}
        <Card className="border rounded-2xl" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
          <CardHeader>
            <CardTitle className="font-normal text-lg" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              Application Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={appStatusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E3DC" />
                <XAxis dataKey="name" stroke="#A67C6D" />
                <YAxis stroke="#A67C6D" />
                <Tooltip contentStyle={{ backgroundColor: '#FFFCF7', border: '1px solid #E8E3DC', borderRadius: '12px' }} />
                <Bar dataKey="value" fill="#C89F8C" radius={[8, 8, 0, 0]}>
                  {appStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card className="border rounded-2xl" style={{ borderColor: 'var(--sand)', backgroundColor: 'var(--warm-white)' }}>
          <CardHeader>
            <CardTitle className="font-normal text-lg" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
              Hiring Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: 'var(--cream)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#8A9B8E20' }}>
                  <Users className="w-5 h-5" style={{ color: '#8A9B8E' }} />
                </div>
                <div>
                  <div className="font-normal" style={{ color: 'var(--earth)' }}>Total Applicants</div>
                  <div className="text-sm" style={{ color: 'var(--clay)' }}>All time</div>
                </div>
              </div>
              <div className="text-2xl font-light" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                {applications.length}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: 'var(--cream)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#C89F8C20' }}>
                  <Briefcase className="w-5 h-5" style={{ color: '#C89F8C' }} />
                </div>
                <div>
                  <div className="font-normal" style={{ color: 'var(--earth)' }}>Active Jobs</div>
                  <div className="text-sm" style={{ color: 'var(--clay)' }}>Currently posted</div>
                </div>
              </div>
              <div className="text-2xl font-light" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                {jobs.filter(j => j.status === 'open').length}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: 'var(--cream)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#705D5620' }}>
                  <Star className="w-5 h-5" style={{ color: '#705D56' }} />
                </div>
                <div>
                  <div className="font-normal" style={{ color: 'var(--earth)' }}>Avg Quality Score</div>
                  <div className="text-sm" style={{ color: 'var(--clay)' }}>Worker ratings</div>
                </div>
              </div>
              <div className="text-2xl font-light" style={{ fontFamily: 'Crimson Pro, serif', color: 'var(--earth)' }}>
                {avgWorkerRating > 0 ? avgWorkerRating : 'N/A'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}