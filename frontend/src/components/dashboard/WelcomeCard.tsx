import { Button } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import labels from "../../config/labels.json";

const WelcomeCard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white shadow-lg">
      <h1 className="text-3xl font-bold">
        {labels.app.dashboard.welcome.replace("{name}", user?.name || labels.app.dashboard.defaultUser)}
      </h1>

      <p className="mt-2 text-blue-100">
        {labels.app.dashboard.welcomeDescription}
      </p>

      <Button
        className="mt-6 font-semibold"
        onPress={() => navigate("/quiz")}
      >
        {labels.app.dashboard.startQuizArrow}
      </Button>
    </div>
  );
};

export default WelcomeCard;
