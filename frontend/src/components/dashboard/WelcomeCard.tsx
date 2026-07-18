import { Button } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const WelcomeCard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white shadow-lg">
      <h1 className="text-3xl font-bold">
        👋 Welcome back, {user?.name || "User"}!
      </h1>

      <p className="mt-2 text-blue-100">
        Ready to test your knowledge today?
      </p>

      <Button
        className="mt-6 font-semibold"
        onPress={() => navigate("/quiz")}
      >
        Start Quiz →
      </Button>
    </div>
  );
};

export default WelcomeCard;
