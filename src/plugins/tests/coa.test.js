const { run, coa, ethereum } = require('@nomiclabs/buidler');
const { Wallet } = require('ethers');
const { sha3 } = require('../../rest/util/hash');

const TEST_TIMEOUT_MS = 10000;

const deployContracts = async () => {
  await run('deploy', { reset: true });
  return ethereum.send('evm_snapshot', []);
};
const revertSnapshot = snapshot => ethereum.send('evm_revert', [snapshot]);

describe('COA plugin tests', () => {
  const address = '0xEa51CfB26e6547725835b4138ba96C0b5de9E54A';
  const txHash =
    '0xee079ea15a894cc95cca919812f490fdf5bc494ec69781d05cecda841d3c11a2';
  let evmSnapshot;
  beforeAll(async () => {
    evmSnapshot = await deployContracts();
  }, TEST_TIMEOUT_MS);
  beforeEach(() => revertSnapshot(evmSnapshot), TEST_TIMEOUT_MS);

  describe('Testing getUnsignedTransaction method', () => {
    it(
      'should return the unsigned transaction for ' +
        'the corresponding method and contract',
      async () => {
        const coaContract = await coa.getCOA();
        const response = await coa.getUnsignedTransaction(
          coaContract,
          'migrateMember',
          ['member profile', address]
        );
        expect(response).toHaveProperty('to', expect.any(String));
        expect(response).toHaveProperty('gasLimit', expect.any(Number));
        expect(response).toHaveProperty('gasPrice', expect.any(Number));
        expect(response).toHaveProperty('data', expect.any(String));
      }
    );
  });

  describe('Testing getAddClaimTransaction method', () => {
    const claim = sha3(1, 1, 1);
    it('should return the unsigned transaction for the addClaim method', async () => {
      const response = await coa.getAddClaimTransaction(
        address,
        claim,
        sha3('ipfshash'),
        true,
        1
      );
      expect(response).toHaveProperty('to', expect.any(String));
      expect(response).toHaveProperty('gasLimit', expect.any(Number));
      expect(response).toHaveProperty('data', expect.any(String));
    });
  });

  describe('Testing sendAddClaimTransaction method', () => {
    let signedTx;
    const unsignedTx = {
      to: '0x7c2C195CD6D34B8F845992d380aADB2730bB9C6F',
      gasLimit: 67381,
      data:
        '0x0472aa82000000000000000000000000ea51cfb26e6547725' +
        '835b4138ba96c0b5de9e54ade838e9e0a4b3e84cad3a9d39f9f' +
        'e437c20f318b30d3166f08c0cdbee96032ab16133cefb93b739' +
        '7e265a1aa1b1272a8561f9686d97b422a8c53b90247c5a1b600' +
        '000000000000000000000000000000000000000000000000000' +
        '000000000010000000000000000000000000000000000000000' +
        '000000000000000000000001'
    };
    beforeAll(async () => {
      const wallet = Wallet.createRandom();
      signedTx = await wallet.sign(unsignedTx);
    });

    it(
      'should send the signed tx to the contract and ' +
        'return the transaction response',
      async () => {
        const response = await coa.sendAddClaimTransaction(signedTx);
        expect(response).toHaveProperty('hash', expect.any(String));
        expect(response.to).toEqual(unsignedTx.to);
        expect(response.data).toEqual(unsignedTx.data);
        expect(Number(response.gasLimit)).toEqual(unsignedTx.gasLimit);
      }
    );
  });

  describe('Testing createProject method', () => {
    it('should send the project to the COA contract', async () => {
      const response = await coa.createProject(1, 'Test Project');
      expect(response).toHaveProperty('hash', expect.any(String));
    });
  });

  describe('Testing addProjectAgreement method', () => {
    it('should add the agreement to the COA contract', async () => {
      const response = await coa.addProjectAgreement(
        address,
        sha3('agreement')
      );
      expect(response).toHaveProperty('hash', expect.any(String));
    });
  });

  describe('Testing getTransactionNonce method', () => {
    it('should return the transaction count for the address', async () => {
      const signer = await coa.getSigner();
      const initialTxNonce = await coa.getTransactionNonce(signer._address);
      await signer.sendTransaction({ to: address, value: 100 });
      const finalTxNonce = await coa.getTransactionNonce(signer._address);
      expect(finalTxNonce).toEqual(initialTxNonce + 1);
    });
  });

  describe('Testing getTransactionResponse method', () => {
    it('should return the transaction response for the transaction', async () => {
      const signer = await coa.getSigner();
      const { hash } = await signer.sendTransaction({
        to: address,
        value: 100
      });
      const response = await coa.getTransactionResponse(hash);
      expect(response).toHaveProperty('hash', hash);
      expect(response).toHaveProperty('blockNumber', expect.any(Number));
    });
    it('should return null if the transaction does not exist', async () => {
      const response = await coa.getTransactionResponse(txHash);
      expect(response).toEqual(null);
    });
  });

  test.todo('Write missing tests');
});
