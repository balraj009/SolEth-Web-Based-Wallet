**SolEth Wallet - A Unified Solana & Ethereum Web Wallet**
==========================================================

**A lightweight client-side wallet for Solana and Ethereum with seed generation, key derivation, multi-account support, and balance lookups.** 

> It lets users create wallets, import existing seed phrases, view balances, and securely manage keys all inside a clean, minimal interface.

* * *

🚀 **Features**
---------------

### 1) Generate New Wallets

* Create secure wallets for Solana or Ethereum using BIP39 mnemonics and standard derivation paths.

### 2) Import Existing Recovery Phrases

* Already have a wallet? Just enter your 12-word phrase and the app will rebuild your keys instantly.

### 3) Toggle Visibility

* Hide or show private keys and secret phrases with a single click to prevent shoulder-surfing.

### 4) One-Click Copy

* Easily copy public keys, private keys, and mnemonics to your clipboard with instant feedback.

### 5) Manage Wallets

* Add multiple accounts, delete individual wallets, or clear everything safely using confirmation dialogs.

* * *

🛠️ **Tech Stack**
------------------

*   **React + Vite**
    
*   **TweetNaCl** (Solana keypair generation)
    
*   **BIP39** (mnemonic + seed)
    
*   **ed25519-hd-key** (Solana derivation)
    
*   **ethers.js** (Ethereum wallet + balance)
    
*   **@solana/web3.js** (Solana wallet + balance)
    
*   **Framer Motion** (animations)
    
*   **Lucide Icons**
    
*   **Custom AlertDialog** + **Theme System (light/dark)**
    

* * *

📦 **Installation**
-------------------

Clone the repo:

`git clone https://github.com/your-username/your-repo.git
cd your-repo` 

Install dependencies:

`npm install` 

Required packages (if installing separately):

`npm install tweetnacl bip39 ed25519-hd-key @solana/web3.js ethers sonner lucide-react`

Start the project:

`npm run dev` 

* * *

📚 **Core State Management**
----------------------------

> The component internally manages:

| State              | Purpose |
| :---------------- | :------: |
| `mnemonicWords`      |   Stores the generated or imported recovery phrase   |
| `wallets`          |   Array containing all wallet objects   |
| `pathTypes`    |  Tracks the blockchain path (501 = Solana, 60 = Ethereum)   |
| `visiblePrivateKeys` |  Controls visibility of private keys   |
| `visiblePhrases`  |   Controls visibility of mnemonics   |
| `showMnemonic` |  Toggles reveal of the phrase section   |
| `gridView`  |   Switches between list/grid UI layouts   |
  

* * *

🔎 **How SolEth Wallet Works**
------------------------------

### 1️⃣ Create or Import a Wallet

*   If no phrase is provided, a new mnemonic is generated.
    
*   If a phrase is entered, it is validated first.
    

### 2️⃣ Derive Keys

Based on chain selection:

*   **Solana** → ed25519 derivation (`m/44'/501'/index'`)
    
*   **Ethereum** → secp256k1 derivation (`m/44'/60'/0'/0/index`)
    

### 3️⃣ Display Wallet Info

Users can:

*   Copy keys
    
*   Toggle visibility
    
*   Add multiple wallets
    
*   Delete or clear wallets
    

Everything is stored in **localStorage** so wallets persist across sessions.

* * *

🤝 **Contributing**
-------------------

If you'd like to improve SolEth Wallet or add new blockchain support, feel free to open:

*   Issues
    
*   Feature requests
    
*   Pull requests
    

Contributions are always welcome ❤️

* * *

📄 **License**
--------------

This project is available under the **MIT License**  - free to use, modify, and distribute.