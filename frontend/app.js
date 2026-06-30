const CONTRACT_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function decimals() external view returns (uint8)"
];

let provider = null;
let signer = null;
let currentAccount = null;

const connectBtn = document.getElementById('connectBtn');
const balanceBtn = document.getElementById('balanceBtn');
const transferBtn = document.getElementById('transferBtn');
const contractAddressInput = document.getElementById('contractAddress');
const recipientInput = document.getElementById('recipient');
const amountInput = document.getElementById('amount');
const balanceEl = document.getElementById('balance');
const statusEl = document.getElementById('status');

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.className = `status ${isError ? 'error' : 'success'}`;
}

function enableButtons(enabled) {
  balanceBtn.disabled = !enabled;
  transferBtn.disabled = !enabled;
}

async function ensureWallet() {
  if (!window.ethereum) {
    throw new Error('MetaMask não encontrado. Instale a extensão.');
  }

  if (!provider) {
    provider = new ethers.BrowserProvider(window.ethereum);
  }

  if (!signer) {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    currentAccount = accounts[0];
    signer = await provider.getSigner();
  }

  return { signer, currentAccount };
}

function getContract() {
  const address = contractAddressInput.value.trim();

  if (!ethers.isAddress(address)) {
    throw new Error('Informe um endereço de contrato válido.');
  }

  return new ethers.Contract(address, CONTRACT_ABI, signer);
}

async function connectWallet() {
  try {
    await ensureWallet();
    enableButtons(true);
    setStatus(`Conectado: ${currentAccount.slice(0, 8)}...`);

    if (ethers.isAddress(contractAddressInput.value.trim())) {
      await loadBalance();
    }
  } catch (error) {
    console.error(error);
    setStatus(error.message || 'Não foi possível conectar ao MetaMask.', true);
  }
}

async function loadBalance() {
  try {
    await ensureWallet();
    const contract = getContract();
    const [rawBalance, decimals] = await Promise.all([
      contract.balanceOf(currentAccount),
      contract.decimals()
    ]);

    balanceEl.textContent = ethers.formatUnits(rawBalance, decimals);
    setStatus('Saldo atualizado com sucesso.');
  } catch (error) {
    console.error(error);
    setStatus(error.shortMessage || error.message || 'Falha ao consultar o saldo.', true);
  }
}

async function transferTokens() {
  try {
    await ensureWallet();
    const recipient = recipientInput.value.trim();
    const amount = amountInput.value.trim();

    if (!ethers.isAddress(recipient)) {
      throw new Error('Informe uma carteira de destino válida.');
    }
    if (!amount || Number(amount) <= 0) {
      throw new Error('Informe uma quantidade maior que zero.');
    }

    const contract = getContract();
    const decimals = await contract.decimals();
    const value = ethers.parseUnits(amount, decimals);

    setStatus('Confirme a transferência no MetaMask...');
    const tx = await contract.transfer(recipient, value);
    setStatus(`Transferência enviada: ${tx.hash}`);
    await tx.wait();

    amountInput.value = '';
    await loadBalance();
    setStatus(`Transferência confirmada: ${tx.hash}`);
  } catch (error) {
    console.error(error);
    setStatus(error.shortMessage || error.message || 'Falha na transferência.', true);
  }
}

connectBtn.addEventListener('click', connectWallet);
balanceBtn.addEventListener('click', loadBalance);
transferBtn.addEventListener('click', transferTokens);

window.addEventListener('load', () => {
  enableButtons(false);
  if (window.ethereum) {
    setStatus('MetaMask detectado. Clique em conectar para começar.');
  }
});

if (window.ethereum) {
  window.ethereum.on('accountsChanged', () => {
    signer = null;
    currentAccount = null;
    balanceEl.textContent = '--';
    enableButtons(false);
    setStatus('Conta alterada. Conecte novamente.');
  });
}
