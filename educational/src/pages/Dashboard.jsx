import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";

function Dashboard() {
  const { user } = useContext(AuthContext);

  const [files, setFiles] = useState([]);
  const [title, setTitle] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    const storedFiles = JSON.parse(localStorage.getItem("files")) || [];
    setFiles(storedFiles);
  }, []);

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleUpload = async () => {
    if (!title || !pdfFile || !thumbnail) {
      alert("All fields required");
      return;
    }

    if (pdfFile.type !== "application/pdf") {
      alert("Only PDF allowed");
      return;
    }

    // 1MB validation
    if (pdfFile.size > 1 * 1024 * 1024) {
      alert("Maximum upload limit is 1MB");
      return;
    }

    if (!thumbnail.type.startsWith("image/")) {
      alert("Thumbnail must be image");
      return;
    }

    const pdfBase64 = await convertToBase64(pdfFile);
    const thumbBase64 = await convertToBase64(thumbnail);

    const newFile = {
      title,
      pdf: pdfBase64,
      thumbnail: thumbBase64,
    };

    const updated = [...files, newFile];
    localStorage.setItem("files", JSON.stringify(updated));
    setFiles(updated);

    setTitle("");
    setPdfFile(null);
    setThumbnail(null);

    alert("File uploaded successfully");
  };

  const deleteFile = (index) => {
    const updated = files.filter((_, i) => i !== index);
    localStorage.setItem("files", JSON.stringify(updated));
    setFiles(updated);
  };

  const handleRename = (index) => {
    if (!newTitle.trim()) return;

    const updated = [...files];
    updated[index].title = newTitle;

    localStorage.setItem("files", JSON.stringify(updated));
    setFiles(updated);

    setEditingIndex(null);
    setNewTitle("");
  };

  const handleThumbnailChange = async (index, file) => {
    if (!file.type.startsWith("image/")) {
      alert("Thumbnail must be image");
      return;
    }

    const thumbBase64 = await convertToBase64(file);

    const updated = [...files];
    updated[index].thumbnail = thumbBase64;

    localStorage.setItem("files", JSON.stringify(updated));
    setFiles(updated);

    alert("Thumbnail updated successfully");
  };

  if (!user) return <h2 className="p-10">Please login</h2>;

  return (
    <div className="pt-40 px-8 bg-gray-100 min-h-screen">

      {/* Sticky Header */}
      <div className="fixed top-16 left-0 w-full bg-white z-40 px-8 py-4 shadow">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Courses</h1>

          <div className="relative w-[30%]">
            <input
              type="text"
              placeholder="Search files..."
              className="w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 text-sm"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ADMIN SECTION */}
      {user.role === "admin" && (
        <div className="bg-white p-6 rounded shadow mb-10">
          <h2 className="text-xl font-bold mb-4">Upload New PDF</h2>

          <input
            type="text"
            placeholder="Title"
            className="w-full mb-4 p-3 border rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            type="file"
            accept="application/pdf"
            className="mb-1"
            onChange={(e) => setPdfFile(e.target.files[0])}
          />

          <p className="text-red-500 text-sm mb-4">
            Maximum upload limit is 1MB
          </p>

          <input
            type="file"
            accept="image/*"
            className="mb-4"
            onChange={(e) => setThumbnail(e.target.files[0])}
          />

          <button
            onClick={handleUpload}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Upload
          </button>
        </div>
      )}

      {/* FILE LIST */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {files
          .filter((file) =>
            file.title.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((file, index) => (
            <div key={index} className="bg-white p-4 rounded shadow">

              <img
                src={file.thumbnail}
                alt="thumbnail"
                className="h-40 w-full object-cover rounded"
              />

              {editingIndex === index ? (
                <div className="mt-4">
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                  <div className="mt-2 space-x-4">
                    <button
                      onClick={() => handleRename(index)}
                      className="text-green-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingIndex(null)}
                      className="text-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <h3 className="font-bold mt-4">{file.title}</h3>
              )}

              <button
                onClick={() => {
                  const byteCharacters = atob(file.pdf.split(",")[1]);
                  const byteNumbers = new Array(byteCharacters.length);

                  for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                  }

                  const byteArray = new Uint8Array(byteNumbers);
                  const blob = new Blob([byteArray], {
                    type: "application/pdf",
                  });

                  const blobUrl = URL.createObjectURL(blob);
                  window.open(blobUrl, "_blank");
                }}
                className="text-blue-600 block mt-2"
              >
                View PDF
              </button>

              {user.role === "admin" && (
                <div className="mt-3 space-y-2">

                  <div className="space-x-4">
                    <button
                      onClick={() => {
                        setEditingIndex(index);
                        setNewTitle(file.title);
                      }}
                      className="text-yellow-600"
                    >
                      Rename
                    </button>

                    <button
                      onClick={() => deleteFile(index)}
                      className="text-red-500"
                    >
                      Delete
                    </button>
                  </div>

                  {/* Change Thumbnail */}
                  <label className="text-blue-600 cursor-pointer text-sm">
                    Change Thumbnail
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleThumbnailChange(index, e.target.files[0])
                      }
                    />
                  </label>

                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

export default Dashboard;