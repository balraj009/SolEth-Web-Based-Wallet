import { ModeToggle } from "../ui/ThemeButton";

function NavBar() {
  return (
    <nav className="flex justify-between items-center py-4 px-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-md overflow-hidden bg-white/5 flex items-center justify-center">
          <img
            src="/soleth-wallet-logo.png"
            alt="SolEth Wallet"
            className="w-10 h-10 object-contain"
          />
        </div>

        <div className="flex flex-col">
          <span className="tracking-tighter text-2xl font-extrabold text-primary flex items-center gap-2">
            SolEth Wallet
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 -mt-0.5">
            Solana + Ethereum
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ModeToggle />
      </div>
    </nav>
  );
}

export default NavBar;
