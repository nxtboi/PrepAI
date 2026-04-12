
import React from 'react';
import { Link } from 'react-router-dom';
import { User } from '../types';
import { BookOpenIcon, LightBulbIcon, ChartBarIcon, AcademicCapIcon, BoltIcon, StarIcon } from '../components/icons/Icons';

interface DashboardProps {
  user: User;
}

const ActionCard: React.FC<{ title: string, description: string, to: string, icon: React.ReactNode }> = ({ title, description, to, icon }) => (
  <Link to={to} className="bg-white p-6 rounded-lg hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between border border-slate-200 group">
    <div>
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-slate-100 rounded-full">
            {icon}
        </div>
        <h3 className="text-lg font-bold font-serif text-charcoal">{title}</h3>
      </div>
      <p className="mt-2 text-charcoal-light text-sm">{description}</p>
    </div>
    <div className="mt-4 text-sm font-semibold text-primary group-hover:underline">
      Get Started &rarr;
    </div>
  </Link>
);


const Dashboard: React.FC<DashboardProps> = ({ user }) => {

  const badges = [
    { name: 'First Steps', icon: <StarIcon className="text-yellow-500"/> },
    { name: 'Topic Explorer', icon: <StarIcon className="text-blue-500"/> },
    { name: 'Curious Mind', icon: <StarIcon className="text-green-500"/> },
    { name: 'Practice Pro', icon: <StarIcon className="text-purple-500"/> },
  ];

  const leaderboard = [
    { name: 'Rohan Sharma', score: 12500, avatar: 'https://i.pravatar.cc/40?u=rohan' },
    { name: 'Priya Patel', score: 11800, avatar: 'https://i.pravatar.cc/40?u=priya' },
    { name: 'Anjali Singh', score: 11250, avatar: 'https://i.pravatar.cc/40?u=anjali' },
    { name: 'You', score: 9800, avatar: `https://i.pravatar.cc/40?u=${user.email}`, isCurrentUser: true },
    { name: 'Sameer Khan', score: 9500, avatar: 'https://i.pravatar.cc/40?u=sameer' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-primary-800 rounded-xl p-8 text-white flex justify-between items-center shadow-lg">
        <div>
          <h2 className="text-3xl font-bold font-serif">Hello, {user.name.split(' ')[0]}!</h2>
          <p className="mt-1 text-primary-200">Ready to conquer your exams today?</p>
        </div>
        <Link to="/q-bank-generator">
          <button className="flex items-center space-x-2 bg-accent hover:bg-accent-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-colors">
            <BoltIcon />
            <span>Start a Quick Test</span>
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ActionCard title="Q-Bank Generator" description="Generate unlimited practice questions for any topic." to="/q-bank-generator" icon={<BookOpenIcon className="text-blue-500"/>} />
        <ActionCard title="AI Doubt Solver" description="Get instant answers to your toughest questions, 24/7." to="/doubt-solver" icon={<LightBulbIcon className="text-yellow-500"/>} />
        <ActionCard title="Performance Analytics" description="Track your progress and identify areas for improvement." to="/analytics" icon={<ChartBarIcon className="text-green-500"/>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md border border-slate-200">
          <h3 className="text-lg font-bold font-serif text-charcoal">Your Badges</h3>
          <p className="text-sm text-charcoal-light mb-4">Celebrate your learning milestones!</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {badges.map(badge => (
              <div key={badge.name} className="flex flex-col items-center p-4 bg-slate-50 rounded-lg border">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-200">
                  {badge.icon}
                </div>
                <span className="mt-2 text-sm font-semibold text-charcoal text-center">{badge.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
          <h3 className="text-lg font-bold font-serif text-charcoal mb-4">Leaderboard</h3>
          <ul className="space-y-3">
            {leaderboard.map((player, index) => (
              <li key={player.name} className={`flex items-center justify-between p-2 rounded-md ${player.isCurrentUser ? 'bg-primary-100' : ''}`}>
                <div className="flex items-center">
                  <span className="font-bold text-charcoal-light w-6">{index + 1}</span>
                  <img src={player.avatar} alt={player.name} className="w-8 h-8 rounded-full ml-2" />
                  <span className={`ml-3 font-medium ${player.isCurrentUser ? 'text-primary-700' : 'text-charcoal'}`}>{player.name}</span>
                </div>
                <span className={`font-bold ${player.isCurrentUser ? 'text-primary-700' : 'text-charcoal-light'}`}>{player.score} PTS</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
