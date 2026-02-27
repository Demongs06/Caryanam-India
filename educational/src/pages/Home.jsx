import { useEffect, useContext } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import Rellax from "rellax";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Home() {

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 1000 });

    let rellaxInstance = null;

    if (window.innerWidth >= 768) {
      rellaxInstance = new Rellax(".rellax");
    }

    return () => {
      if (rellaxInstance) {
        rellaxInstance.destroy();
      }
    };
  }, []);

  const handleExplore = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <>
      {/* HERO */}
      <section className="pt-24 bg-gradient-to-r from-indigo-50 to-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">

            <div data-aos="fade-right" className="text-center md:text-left max-w-xl">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                Upgrade Your Skills Online
              </h1>
              <p className="text-gray-600 mb-6">
                Learn Web Development, UI/UX and more with industry experts.
              </p>

              <button
                onClick={handleExplore}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition inline-block"
              >
                Explore Courses
              </button>
            </div>

            <div
              className="rellax w-full md:w-1/2 flex justify-center"
              data-rellax-speed="-2"
            >
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644"
                alt="Students"
                className="w-full max-w-sm md:max-w-md lg:max-w-lg 
               h-auto object-cover 
               rounded-2xl shadow-lg"
              />
            </div>

          </div>
        </div>
      </section>

      {/* COURSES */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2
            className="text-3xl font-bold text-center mb-12"
            data-aos="fade-up"
          >
            Popular Courses
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

            <div
              className="bg-gray-50 rounded-xl shadow-md p-6 text-center hover:shadow-xl transition"
              data-aos="zoom-in"
            >
              <img
                src="https://images.unsplash.com/photo-1498050108023-c5249f4df085"
                className="w-full h-48 object-cover rounded-lg mb-4"
                alt="Web Development"
              />
              <h3 className="text-xl font-semibold mb-2">
                Web Development
              </h3>
              <p className="text-gray-600">
                Master HTML, CSS, React & backend.
              </p>
            </div>

            <div
              className="bg-gray-50 rounded-xl shadow-md p-6 text-center hover:shadow-xl transition"
              data-aos="zoom-in"
              data-aos-delay="200"
            >
              <img
                src="https://images.unsplash.com/photo-1581291518857-4e27b48ff24e"
                className="w-full h-48 object-cover rounded-lg mb-4"
                alt="UI UX"
              />
              <h3 className="text-xl font-semibold mb-2">
                UI/UX Design
              </h3>
              <p className="text-gray-600">
                Design modern & user-friendly interfaces.
              </p>
            </div>

            <div
              className="bg-gray-50 rounded-xl shadow-md p-6 text-center hover:shadow-xl transition"
              data-aos="zoom-in"
              data-aos-delay="400"
            >
              <img
                src="https://images.unsplash.com/photo-1519389950473-47ba0277781c"
                className="w-full h-48 object-cover rounded-lg mb-4"
                alt="Digital Marketing"
              />
              <h3 className="text-xl font-semibold mb-2">
                Digital Marketing
              </h3>
              <p className="text-gray-600">
                Grow businesses with smart strategies.
              </p>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}