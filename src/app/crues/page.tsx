import CruesMapLeaflet from "./CruesMapLeaflet";

export default function CruesPage() {
  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-blue-700">
        🌊 Repères de crue – Toulouse
      </h1>
      <CruesMapLeaflet />
    </div>
  );
}
