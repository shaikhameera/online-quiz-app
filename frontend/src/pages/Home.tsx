import Navbar from "../components/common/Navbar/Navbar";
import WelcomeCard from "../components/dashboard/WelcomeCard";
import QuickActions from "../components/dashboard/QuickActions";
import QuizHistory from "../components/dashboard/QuizHistory";
import { userNavigation } from "../utils/navigation";

const Home = () => {
  return (
    <>
      <Navbar links={userNavigation} />

      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <WelcomeCard />

          <QuickActions />

          <QuizHistory recent />
        </div>
      </main>
    </>
  );
};

export default Home;
