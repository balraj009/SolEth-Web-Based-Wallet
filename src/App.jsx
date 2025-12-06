import NavBar from "./components/NavBar";
import WalletGenerator from "./components/WalletGenerator";

function App() {
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-4 p-4 min-h-[92vh]">
      <NavBar />
      <WalletGenerator />
    </div>
  );
}

export default App;
