
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BookOpenIcon, CheckCircleIcon, ClockIcon } from '../components/icons/Icons';

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 flex items-center space-x-4">
    <div className={`p-3 rounded-full ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-slate-500 text-sm">{title}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

const ProgressBar: React.FC<{ topic: string; percentage: number; color: string }> = ({ topic, percentage, color }) => (
  <div>
    <div className="flex justify-between mb-1">
      <span className="text-sm font-medium text-slate-700">{topic}</span>
      <span className={`text-sm font-medium text-${color}-500`}>{percentage}%</span>
    </div>
    <div className="w-full bg-slate-200 rounded-full h-2.5">
      <div className={`bg-${color}-500 h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
    </div>
  </div>
);

const weeklyData = [
  { name: 'Mon', questions: 25, correct: 20 },
  { name: 'Tue', questions: 40, correct: 32 },
  { name: 'Wed', questions: 30, correct: 28 },
  { name: 'Thu', questions: 50, correct: 40 },
  { name: 'Fri', questions: 45, correct: 35 },
  { name: 'Sat', questions: 60, correct: 55 },
  { name: 'Sun', questions: 15, correct: 15 },
];

const Analytics: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Performance Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Questions Practiced" value="345" icon={<BookOpenIcon className="text-white"/>} color="bg-blue-500" />
        <StatCard title="Overall Accuracy" value="85%" icon={<CheckCircleIcon className="text-white"/>} color="bg-green-500" />
        <StatCard title="Total Study Time" value="28 Hours" icon={<ClockIcon className="text-white"/>} color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Chapter Mastery</h3>
          <div className="space-y-4">
            <ProgressBar topic="Thermodynamics" percentage={92} color="green" />
            <ProgressBar topic="Organic Chemistry" percentage={78} color="yellow" />
            <ProgressBar topic="Optics" percentage={85} color="blue" />
            <ProgressBar topic="Calculus" percentage={65} color="red" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Weekly Performance</h3>
          <div style={{ width: '100%', height: 300 }}>
             <ResponsiveContainer>
                <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="questions" fill="#14B8A6" name="Attempted" />
                    <Bar dataKey="correct" fill="#94A3B8" name="Correct" />
                </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
