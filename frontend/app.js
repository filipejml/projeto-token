const CONTRACT_ABI = [
  "function ping() external returns (string memory)",
  "function getMessage() external view returns (string memory)"
];

let provider = null;
let signer = null;
let currentAccount = null;

const connectBtn = document.getElementById('connectBtn');
const testBtn = document.getElementById('testBtn');
const contractBtn = document.getElementById('contractBtn');
const contractAddressInput = document.getElementById('contractAddress');
const statusEl = document.getElementById('status');

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.className = `status ${isError ? 'error' : 'success'}`;
}

function enableButtons(enabled) {
  testBtn.disabled = !enabled;
  contractBtn.disabled = !enabled;
}

async function ensureWallet() {
  if (!window.ethereum) {
    setStatus('MetaMask não encontrado. Instale a extensão.', true);
    throw new Error('MetaMask not found');
  }

  if (!provider) {
    provider = new ethers.BrowserProvider(window.ethereum);
  }

  if (!signer) {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    currentAccount = accounts[0];
    signer = await provider.getSigner();
  }

  return { provider, signer, currentAccount };
}

async function connectWallet() {
  try {
    const { currentAccount } = await ensureWallet();
    setStatus(`Conectado: ${currentAccount.slice(0, 8)}...`);
    enableButtons(true);
  } catch (error) {
    console.error(error);
    setStatus('Não foi possível conectar ao MetaMask.', true);
  }
}

async function runWalletTest() {
  try {
    const { signer, currentAccount } = await ensureWallet();
    setStatus('Aguardando confirmação no MetaMask...');

    const tx = await signer.sendTransaction({
      to: currentAccount,
      value: 0n
    });

    setStatus('Transação enviada. Aguardando confirmação...');
    const receipt = await tx.wait();
    setStatus(`Teste concluído. Hash: ${receipt.hash}`);
  } catch (error) {
    console.error(error);
    setStatus('O teste de transação foi cancelado ou falhou.', true);
  }
}

async function runContractTest() {
  try {
    const { signer } = await ensureWallet();
    const contractAddress = contractAddressInput.value.trim();

    if (!contractAddress) {
      setStatus('Informe o endereço do contrato antes de chamar a função.', true);
      return;
    }

    const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
    setStatus('Enviando chamada ao contrato...');

    const tx = await contract.ping();
    setStatus(`Chamada enviada. Hash: ${tx.hash}`);
    await tx.wait();
    setStatus('Contrato chamado com sucesso.');
  } catch (error) {
    console.error(error);
    setStatus('Falha ao chamar o contrato.', true);
  }
}

connectBtn.addEventListener('click', connectWallet);
testBtn.addEventListener('click', runWalletTest);
contractBtn.addEventListener('click', runContractTest);

window.addEventListener('load', () => {
  enableButtons(false);
  if (window.ethereum) {
    setStatus('MetaMask detectado. Clique em conectar para começar.');
  }
});
