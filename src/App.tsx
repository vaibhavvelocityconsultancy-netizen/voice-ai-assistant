import { Outlet } from "react-router-dom";

const App = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative">
      {/* <h1 className="text-3xl font-semibold  mb-6">Voice AI Receptionist</h1> */}
      
      <div className="w-full max-w-full bg-gray-100 shadow-lg rounded-2xl flex flex-col gap-4">
        <Outlet />
      </div>
    </div>
  );
};

export default App;
