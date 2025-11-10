import { Link } from "react-router-dom";
import { img } from "../assets/img";

const ReceptionSelector = () => {
  const options = [
    {
      title: "Appointment",
      desc: "Talk to our AI receptionist for appointments, queries, and assistance.",
      path: "/voice-receptionist",
      img: img.doctor_img,
    },
    {
      title: "Insurance",
      desc: "Ask about insurance policies, coverage, or claim-related queries.",
      path: "/insurance-receptionist",
      img: img.insurance_img,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6 text-center">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">
        🤖 Welcome to <span className="text-blue-600">AI Reception Portal</span>
      </h1>

      <p className="text-gray-600 mb-10 max-w-md">
        Choose which receptionist you’d like to talk to.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {options.map((opt, i) => (
          <Link
            key={i}
            to={opt.path}
            className="bg-white/80 hover:bg-white border border-white/40 backdrop-blur-lg p-6 rounded-3xl shadow-lg flex flex-col items-center transition-transform hover:scale-105"
          >
            <img
              src={opt.img}
              alt={opt.title}
              className="w-32 h-32 rounded-full border-4 border-blue-500 object-cover mb-4"
            />
            <h2 className="text-xl font-semibold text-blue-700 mb-2">{opt.title}</h2>
            <p className="text-gray-600 text-sm max-w-xs">{opt.desc}</p>
           
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ReceptionSelector;
