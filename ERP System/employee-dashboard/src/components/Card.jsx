export default function Card({ title, value, icon, color }) {
  return (
    <div className="bg-white border rounded-xl p-6 flex items-center justify-between hover:shadow-lg transition">

      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-3xl font-semibold mt-1">{value}</h3>
      </div>

      <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${color}`}>
        {icon}
      </div>

    </div>
  );
}