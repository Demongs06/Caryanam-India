function About() {
  return (
    <div className="min-h-screen bg-white px-10 py-16">
      <h2 className="text-4xl font-bold text-center mb-10 text-blue-600">
        About EduPlatform
      </h2>

      <div className="max-w-3xl mx-auto text-gray-700 text-lg space-y-6">
        <p>
          EduPlatform is a simple educational resource management system built
          with React and Tailwind CSS.
        </p>

        <p>
          Admin users can upload PDF resources with thumbnail previews.
          Students can browse and view those PDFs securely.
        </p>

        <p>
          This project demonstrates role-based authentication and protected
          content access.
        </p>
      </div>
    </div>
  );
}

export default About;