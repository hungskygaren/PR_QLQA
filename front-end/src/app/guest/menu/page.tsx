import MenuOrder from "@/app/guest/menu/menu-order";

export default async function MenuPage() {
  return (
    <div className="max-w-[400px] mx-auto space-y-4">
      <div className="bg-yellow-400 p-2 rounded-lg shadow-md">
        <h1 className="text-center text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-900 drop-shadow-lg animate-pulse">
          Menu Quán
        </h1>
      </div>

      <MenuOrder />
    </div>
  );
}
