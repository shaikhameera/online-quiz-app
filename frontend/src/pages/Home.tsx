import Navbar from "../components/common/Navbar/Navbar";
import WelcomeCard from "../components/dashboard/WelcomeCard";
import QuickActions from "../components/dashboard/QuickActions";
import StatsCards from "../components/dashboard/StatsCards";
import RecentAttempts from "../components/dashboard/RecentAttempts";
import type { QuizAttempt } from "../components/dashboard/types";

const Home = () => {
  const stats = {
    highestScore: null,
    lastScore: null,
    totalAttempts: 0,
    averageScore: null,
  };

  const attemptsRecord: QuizAttempt[] = [];

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <WelcomeCard />

          <QuickActions />

          <StatsCards stats={stats} />

          <RecentAttempts attempts={attemptsRecord} />
        </div>
      </main>
    </>
  );
};

export default Home;
