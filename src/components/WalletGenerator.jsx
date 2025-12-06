import { useEffect, useState } from "react";
import { easeInOut, motion } from "framer-motion";
import Button from "../ui/Button";
import { toast } from "react-toastify";
import Input from "../ui/Input";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  EyeOff,
  Grid2X2,
  List,
  Trash,
} from "lucide-react";
import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from "bip39";
import { derivePath } from "ed25519-hd-key";
import nacl from "tweetnacl";
import { Keypair } from "@solana/web3.js";
import { ethers } from "ethers";
import bs58 from "bs58";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/AlertDialog";

function WalletGenerator() {
  const [mnemonicWords, setMnemonicWords] = useState(Array(12).fill(" "));

  const [wallets, setWallets] = useState([]);
  const [pathTypes, setPathTypes] = useState([]);
  const [mnemonicInput, setMnemonicInput] = useState("");
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [visiblePrivateKeys, setVisiblePrivateKeys] = useState([]);
  const [visiblePhrases, setVisiblePhrases] = useState([]);
  const [gridView, setGridView] = useState(false);

  const [openClearDialog, setOpenClearDialog] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);

  const pathTypeNames = {
    501: "Solana",
    60: "Ethereum",
  };

  const pathTypeName = pathTypeNames[pathTypes[0]] || "";

  useEffect(() => {
    try {
      const storedWallets = localStorage.getItem("wallets");
      const storedMnemonics = localStorage.getItem("mnemonics");
      const storedPathTypes = localStorage.getItem("paths");

      if (storedWallets && storedMnemonics && storedPathTypes) {
        const parsedWallets = JSON.parse(storedWallets);
        const parsedMnemonics = JSON.parse(storedMnemonics);
        const parsedPaths = JSON.parse(storedPathTypes);

        setMnemonicWords(parsedMnemonics);
        setWallets(parsedWallets);
        setPathTypes(parsedPaths);

        setVisiblePrivateKeys(parsedWallets.map(() => false));
        setVisiblePhrases(parsedWallets.map(() => false));
      }
    } catch (error) {
      console.warn("Failed to load wallets from localStorage", error);
    }
  }, []);

  const copyToClipboard = (content) => {
    if (!content) {
      toast.error("Nothing to copy.");
      return;
    }
    navigator.clipboard.writeText(content);
    toast.success("Copy to clipboard.");
  };

  const togglePrivateKeyVisibility = (index) => {
    setVisiblePrivateKeys(
      visiblePrivateKeys.map((visible, i) => (i === index ? !visible : visible))
    );
  };

  const togglePhrasesVisibility = (index) => {
    setVisiblePhrases(
      visiblePhrases.map((visible, i) => (i === index ? !visible : visible))
    );
  };

  const generateWalletFromMnemonic = (pathType, mnemonic, accountIndex = 0) => {
    try {
      const seedBuffer = mnemonicToSeedSync(mnemonic); //refers buffer

      let path = "";
      let publicKeyEncoded = "";
      let privateKeyEncoded = "";

      if (pathType === "501") {
        // Solana (ed25519)
        // derivedSeed should be 32 bytes suitable for nacl

        path = `m/44'/501'/${accountIndex}'/0'`;

        const { key: derivedSeed } = derivePath(
          path,
          seedBuffer.toString("hex")
        );

        const seedUint8 = new Uint8Array(derivedSeed);

        const keyPairNacl = nacl.sign.keyPair.fromSeed(seedUint8);
        const secretKey = keyPairNacl.secretKey;

        const keypair = Keypair.fromSecretKey(secretKey);

        privateKeyEncoded = bs58.encode(secretKey);
        publicKeyEncoded = keypair.publicKey.toBase58();
      } else if (pathType === "60") {
        // Ethereum (secp256k1) - use derivedSeed as private key (hex)

        path = `m/44'/60'/0'/0/${accountIndex}`;

        let wallet;

        if (ethers.Wallet.fromMnemonic) {
          wallet = ethers.Wallet.fromMnemonic(mnemonic, path);
        } else if (ethers.Wallet.fromPhrase) {
          wallet = ethers.Wallet.fromPhrase(mnemonic, path);
        } else {
          throw new Error(
            "Unsupported ethers version for HD wallet derivation."
          );
        }

        privateKeyEncoded = wallet.privateKey;
        publicKeyEncoded = wallet.address;
      } else {
        toast.error("Unsupported path type.");
        return null;
      }

      return {
        publicKey: publicKeyEncoded,
        privateKey: privateKeyEncoded,
        mnemonic,
        path,
      };
    } catch (error) {
      console.error("generateWalletFromMnemonic error: ", error);
      toast.error("Failed to generate wallet. Please try again.");
      return null;
    }
  };

  const handleGenerateWallet = () => {
    let mnemonic = mnemonicInput.trim();

    if (mnemonic) {
      if (!validateMnemonic(mnemonic)) {
        toast.error("Invalid recovery phrase. Please try again.");
        return;
      }
    } else {
      mnemonic = generateMnemonic();
    }

    const words = mnemonic.split(" ");
    setMnemonicWords(words);

    // Ensure there's selected chain
    if (!pathTypes || pathTypes.length === 0) {
      toast.error("Please select a blockchain (Solana or Ethereum) first.");
      return;
    }

    // Account index will be the current number of wallets (0-based)
    const wallet = generateWalletFromMnemonic(
      pathTypes[0],
      mnemonic,
      wallets.length
    );
    if (wallet) {
      const updateWallets = [...wallets, wallet];

      // Append the same pathType for this new wallet so arrays stay alinged
      const updatePathTypes = [
        ...(pathTypes.length === wallets.length ? pathTypes : pathTypes),
        pathTypes[0],
      ];
      // Explanation: If pathTypes was only the single selection, we keep the single item and append
      // per-wallet copies so lengths match wallets.

      setWallets(updateWallets);
      setPathTypes(updatePathTypes);

      localStorage.setItem("wallets", JSON.stringify(updateWallets));
      localStorage.setItem("mnemonics", JSON.stringify(words));
      localStorage.setItem("paths", JSON.stringify(updatePathTypes));

      setVisiblePrivateKeys([...visiblePrivateKeys, false]);
      setVisiblePhrases([...visiblePhrases, false]);

      setMnemonicInput("");

      toast.success("Wallet generated Successfullt!");
    }
  };

  const handleAddWallet = () => {
    if (!mnemonicWords || mnemonicWords.length === 0) {
      toast.error("No Mnemonic key found. Please generate a wallet first.");
      return;
    }

    if (!pathTypes || pathTypes.length === 0) {
      toast.error("Please select a blockchain (Solana or Ethereum) first.");
      return;
    }

    const mnemonic = mnemonicWords.join(" ");

    const wallet = generateWalletFromMnemonic(
      pathTypes[0],
      mnemonic,
      wallets.length
    );

    if (wallet) {
      const updatedWallets = [...wallets, wallet];
      const updatedPathTypes = [...pathTypes, pathTypes[0]];

      setWallets(updatedWallets);
      setPathTypes(updatedPathTypes);

      localStorage.setItem("wallets", JSON.stringify(updatedWallets));
      localStorage.setItem("paths", JSON.stringify(updatedPathTypes));

      setVisiblePrivateKeys([...visiblePrivateKeys, false]);
      setVisiblePhrases([...visiblePhrases, false]);

      toast.success("Wallet generated successfully!");
    }
  };

  const handleClearWallets = () => {
    localStorage.removeItem("wallets");
    localStorage.removeItem("mnemonics");
    localStorage.removeItem("paths");

    setWallets([]);
    setMnemonicWords(Array(12).fill(" "));
    setPathTypes([]);
    setVisiblePrivateKeys([]);
    setVisiblePhrases([]);
    setShowMnemonic(false);

    toast.success("All wallets cleared.");
  };

  const handleDeleteWallet = (index) => {
    const updatedWallets = wallets.filter((_, i) => i !== index);
    const updatedPathTypes = pathTypes.filter((_, i) => i !== index);

    setWallets(updatedWallets);
    setPathTypes(updatedPathTypes);

    localStorage.setItem("wallets", JSON.stringify(updatedWallets));
    localStorage.setItem("paths", JSON.stringify(updatedPathTypes));

    setVisiblePrivateKeys(visiblePrivateKeys.filter((_, i) => i !== index));
    setVisiblePhrases(visiblePhrases.filter((_, i) => i !== index));

    toast.success("Wallet deleted successfully!");
  };

  return (
    <div className="flex flex-col gap-4">
      {wallets.length === 0 && (
        <motion.div
          className="fle flex-col gap-4 items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            ease: easeInOut,
          }}
        >
          <div className="flex flex-col gap-4 items-center">
            {pathTypes.length === 0 && (
              <motion.div
                className="flex gap-4 flex-col my-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  ease: easeInOut,
                }}
              >
                <div className="flex flex-col gap-2 items-center">
                  <h1 className="tracking-tighter text-4xl md:text-5xl font-black text-center">
                    SolEth Wallet supports multiple blockchains..
                  </h1>
                  <p className="text-primary/80 font-semibold text-lg md:text-xl text-center">
                    Please select a derivation path type to proceed.
                  </p>
                </div>

                <div className="flex gap-4 justify-center items-center">
                  <Button
                    size={"lg"}
                    onClick={() => {
                      setPathTypes(["501"]);
                      toast.success(
                        "Solana selected. Please generate a wallet to continue."
                      );
                    }}
                  >
                    Solana
                  </Button>
                  <Button
                    size={"lg"}
                    onClick={() => {
                      setPathTypes(["60"]);
                      toast.success(
                        "Ethereum selected. Please generate a wallet to continue."
                      );
                    }}
                  >
                    Ethereum
                  </Button>
                </div>
              </motion.div>
            )}

            {pathTypes.length !== 0 && (
              <motion.div
                className="flex gap-4 flex-col my-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  ease: easeInOut,
                }}
              >
                <div className="flex flex-col gap-2 items-center">
                  <h1 className="tracking-tighter text-4xl md:text-5xl font-black text-center">
                    Secret Recovery Phrase
                  </h1>
                  <p className="text-primary/80 font-semibold text-lg md:text-xl text-center">
                    Save this words somewhere safe and secure. You will need
                    them to access your wallet.
                  </p>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <Input
                    size={"sm"}
                    type="password"
                    placeholder="Enter your secret phrase (or leave blank to generate new)"
                    onChange={(e) => setMnemonicInput(e.target.value)}
                    value={mnemonicInput}
                  />
                  <Button size={"md"} onClick={() => handleGenerateWallet()}>
                    {mnemonicInput ? "Add Wallet" : "Generate Wallet"}
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {mnemonicWords && wallets.length > 0 && (
        <motion.div
          className="flex gap-4 flex-col my-4 cursor-pointer border border-primary/10 p-8 rounded-2xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            ease: easeInOut,
          }}
        >
          <div
            className="flex w-full justify-between items-center"
            onClick={() => setShowMnemonic(!showMnemonic)}
          >
            <h2 className="tracking-tighter text-4xl md:text-5xl font-black text-center">
              Your Secret Phrase
            </h2>
            <button
              className="text-gray-500 cursor-pointer"
              onClick={() => setShowMnemonic(!showMnemonic)}
            >
              {showMnemonic ? (
                <ChevronUp className="size-6" />
              ) : (
                <ChevronDown className="size-6" />
              )}
            </button>
          </div>

          {showMnemonic && (
            <motion.div
              className="flex flex-col w-full items-center justify-center"
              onClick={() => copyToClipboard(mnemonicWords.join(" "))}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                ease: easeInOut,
              }}
            >
              <motion.div
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 justify-center w-full items-center mx-auto my-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  ease: easeInOut,
                }}
              >
                {mnemonicWords.map((word, index) => (
                  <p
                    key={index}
                    className="md:text-lg bg-gray-300/15 hover:bg-gray-500/10 transition-all duration-300 rounded-lg p-3 text-center"
                  >
                    {word}
                  </p>
                ))}
              </motion.div>

              <div className="text-sm md:text-base flex w-full gap-2 hover:opacity-50 items-center transition-all duration-300">
                <Copy className="size-6" /> Copy Anywhere To Copy
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {wallets.length > 0 && (
        <motion.div
          className="flex flex-col gap-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.3,
            ease: easeInOut,
          }}
        >
          <div className="flex md:flex-row flex-col justify-between w-full gap-4 md:items-center px-8">
            <h2 className="tracking-tighter text-3xl md:text-4xl">
              {pathTypeName} Wallet
            </h2>

            <div className="flex gap-2">
              {wallets.length > 1 && (
                <button
                  className="bg-gray-300/20 hover:bg-gray-500/10 transition-all duration-300 rounded-lg p-2.5 cursor-pointer"
                  onClick={() => setGridView(!gridView)}
                >
                  {gridView ? <Grid2X2 /> : <List />}
                </button>
              )}

              <Button onClick={() => handleAddWallet()}>Add Wallet</Button>

              <Button
                onClick={() => setOpenClearDialog(true)}
                className="dark:bg-red-500/90 dark:hover:bg-red-500/80"
              >
                Clear Wallets
              </Button>

              <AlertDialog open={openClearDialog} setOpen={setOpenClearDialog}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you sure want to delete all wallets?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your wallets and keys from local storage.
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <AlertDialogFooter>
                    <AlertDialogCancel />

                    <AlertDialogAction onClick={() => handleClearWallets()}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <div
            className={`grid gap-6 grid-cols-1 col-span-1 ${
              gridView ? "md:grid-cols-2 lg:grid-cols-3" : ""
            }`}
          >
            {wallets.map((wallet, index) => (
              <motion.div
                key={index}
                className="flex flex-col rounded-2xl border border-gray-400/50"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.3 + index * 0.1,
                  duration: 0.3,
                  ease: easeInOut,
                }}
              >
                <div className="flex justify-between px-8 py-6">
                  <h3 className="font-bold tracking-tighter text-2xl md:text-3xl">
                    Wallet {index + 1}
                  </h3>

                  <button
                    onClick={() => setDeleteIndex(index)}
                    className="text-red-500/90 hover:text-red-500/60 cursor-pointer"
                  >
                    <Trash className="size-6" />
                  </button>

                  <AlertDialog
                    open={deleteIndex === index}
                    setOpen={(val) => setDeleteIndex(val ? index : null)}
                  >
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you sure want to delete wallet {index + 1}?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete the wallet and keys from local storage.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <AlertDialogFooter>
                        <AlertDialogCancel />

                        <AlertDialogAction
                          onClick={() => {
                            handleDeleteWallet(index);
                            setDeleteIndex(null);
                          }}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <div className="flex flex-col gap-8 px-8 py-4 rounded-2xl bg-gray-300/20">
                  <div
                    className="flex flex-col w-full gap-2"
                    onClick={() => copyToClipboard(wallet.publicKey)}
                  >
                    <span className="text-lg md:text-xl font-bold tracking-tighter">
                      Public Key
                    </span>
                    <p className="text-gray-400 hover:text-gray-500 font-medium transition-all duration-300 cursor-pointer truncate">
                      {wallet.publicKey}
                    </p>
                  </div>

                  <div className="flex flex-col w-full gap-2">
                    <span className="text-lg md:text-xl font-bold tracking-tighter">
                      Private Key
                    </span>

                    <div className="flex justify-between items-center w-full gap-2">
                      <p
                        className="text-gray-400 hover:text-gray-500 font-medium transition-all duration-300 cursor-pointer truncate"
                        onClick={() => copyToClipboard(wallet.privateKey)}
                      >
                        {visiblePrivateKeys[index]
                          ? wallet.privateKey
                          : "●".repeat(32)}
                      </p>

                      <button
                        className="cursor-pointer"
                        onClick={() => togglePrivateKeyVisibility(index)}
                      >
                        {visiblePrivateKeys[index] ? (
                          <EyeOff className="size-6" />
                        ) : (
                          <Eye className="size-6" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col w-full gap-2">
                    <span className="text-lg md:text-xl font-bold tracking-tighter">
                      Secret Phrases
                    </span>

                    <div className="flex justify-between items-center w-full gap-2">
                      <p
                        className="text-gray-400 hover:text-gray-500 font-medium transition-all duration-300 cursor-pointer truncate"
                        onClick={() => copyToClipboard(wallet.mnemonic)}
                      >
                        {visiblePhrases[index]
                          ? wallet.mnemonic
                          : "●".repeat(wallet.mnemonic.length)}
                      </p>

                      <button
                        className="cursor-pointer"
                        onClick={() => togglePhrasesVisibility(index)}
                      >
                        {visiblePhrases[index] ? (
                          <EyeOff className="size-6" />
                        ) : (
                          <Eye className="size-6" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default WalletGenerator;
