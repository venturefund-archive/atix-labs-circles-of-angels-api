/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart
 * contracts to develop impact milestones agreed
 * upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { coa } = require('@nomiclabs/buidler');
const {
  projectStatuses,
  userRoles,
  txFunderStatus
} = require('../../rest/util/constants');
const { injectMocks } = require('../../rest/util/injection');
const files = require('../../rest/util/files');
const errors = require('../../rest/errors/exporter/ErrorExporter');
const COAError = require('../../rest/errors/COAError');
const transferService = require('../../rest/services/transferService');

describe('Testing transferService', () => {
  let dbProject = [];
  let dbUser = [];
  let dbTransfer = [];

  const fundingProject = {
    id: 1,
    status: projectStatuses.FUNDING,
    address: '0xEa51CfB26e6547725835b4138ba96C0b5de9E54A'
  };

  const draftProject = {
    id: 2,
    status: projectStatuses.NEW
  };

  const userFunder = {
    id: 1,
    role: userRoles.PROJECT_SUPPORTER
  };

  const oracleUser = {
    id: 2,
    role: userRoles.ENTREPRENEUR
  };

  const bankOperatorUser = {
    id: 3,
    role: userRoles.BANK_OPERATOR
  };

  const newTransfer = {
    transferId: '1AA22SD444',
    amount: 200,
    senderId: userFunder.id,
    project: fundingProject.id,
    currency: 'USD',
    destinationAccount: '1235AASDD',
    receiptFile: { name: 'receipt.jpg', size: 20000 }
  };

  const verifiedTransfer = {
    id: 2,
    amount: 150,
    transferId: 'existing123',
    status: txFunderStatus.VERIFIED,
    project: fundingProject.id
  };

  const pendingTransfer = {
    id: 3,
    transferId: 'pendingABC',
    status: txFunderStatus.PENDING,
    project: fundingProject.id,
    rejectionReason: null
  };

  const anotherVerifiedTransfer = {
    id: 4,
    amount: 50,
    transferId: 'existing123',
    status: txFunderStatus.VERIFIED,
    project: fundingProject.id
  };

  beforeAll(() => {
    files.saveFile = jest.fn(() => '/dir/path');
    coa.sendAddClaimTransaction = jest.fn(() => ({ hash: '0x01' }));
    coa.getAddClaimTransaction = jest.fn();
  });
  afterAll(() => jest.clearAllMocks());

  const transferDao = {
    findAllByProps: filter =>
      dbTransfer.filter(transfer =>
        Object.keys(filter).every(key => transfer[key] === filter[key])
      ),
    create: transfer => {
      const toCreate = {
        ...transfer,
        id: 1,
        createdAt: new Date()
      };
      dbTransfer.push(toCreate);
      return toCreate;
    },
    getTransferById: ({ transferId }) =>
      dbTransfer.find(transfer => transfer.transferId === transferId),

    update: ({ id, ...params }) => {
      const found = dbTransfer.find(transfer => transfer.id === id);
      if (!found) return;
      const updated = { ...found, ...params };
      dbTransfer[dbTransfer.indexOf(found)] = updated;
      return updated;
    },
    findById: id => dbTransfer.find(transfer => transfer.id === id),
    getAllTransfersByProject: projectId =>
      dbTransfer.filter(transfer => transfer.projectId === projectId),

    getTransfersByProjectAndState: (projectId, state) => {
      if (projectId === 0) {
        return undefined;
      }

      if (!projectId) {
        throw Error('Error getting transfers from db');
      }

      const transfers = [
        {
          id: 1,
          project: projectId,
          state,
          amount: 100
        },
        {
          id: 2,
          project: projectId,
          state,
          amount: 500
        }
      ];

      return transfers;
    }
  };

  const projectService = {
    getProjectById: id => {
      const found = dbProject.find(project => project.id === id);
      if (!found)
        throw new COAError(errors.common.CantFindModelWithId('project', id));
      return found;
    }
  };

  const userService = {
    getUserById: id => {
      const found = dbUser.find(user => user.id === id);
      if (!found)
        throw new COAError(errors.common.CantFindModelWithId('user', id));
      return found;
    }
  };

  describe('Testing transferService createTransfer', () => {
    beforeAll(() => {
      injectMocks(transferService, {
        transferDao,
        projectService,
        userService
      });
    });

    beforeEach(() => {
      dbProject = [];
      dbUser = [];
      dbTransfer = [];
      dbProject.push(fundingProject);
      dbUser.push(userFunder);
    });

    it('should save the transfer as pending and return its id', async () => {
      const response = await transferService.createTransfer({
        ...newTransfer,
        projectId: newTransfer.project
      });
      const savedTransfer = dbTransfer.find(
        transfer => transfer.id === response.transferId
      );
      expect(savedTransfer.status).toEqual(txFunderStatus.PENDING);
      expect(response).toEqual({ transferId: 1 });
    });

    it('should throw an error if parameters are not valid', async () => {
      await expect(
        transferService.createTransfer({ ...newTransfer, projectId: undefined })
      ).rejects.toThrow(errors.common.RequiredParamsMissing('createTransfer'));
    });

    it('should throw an error if project does not exist', async () => {
      await expect(
        transferService.createTransfer({ ...newTransfer, projectId: 0 })
      ).rejects.toThrow(errors.common.CantFindModelWithId('project', 0));
    });

    it('should throw an error if sender user does not exist', async () => {
      await expect(
        transferService.createTransfer({
          ...newTransfer,
          projectId: newTransfer.project,
          senderId: 0
        })
      ).rejects.toThrow(errors.common.CantFindModelWithId('user', 0));
    });

    it('should throw an error if sender user is not a funder', async () => {
      dbUser.push(oracleUser);
      await expect(
        transferService.createTransfer({
          ...newTransfer,
          projectId: newTransfer.project,
          senderId: 2
        })
      ).rejects.toThrow(errors.user.UnauthorizedUserRole(oracleUser.role));
    });

    it('should throw an error if project status is not consensus', async () => {
      dbProject.push(draftProject);
      await expect(
        transferService.createTransfer({ ...newTransfer, projectId: 2 })
      ).rejects.toThrow(
        errors.transfer.ProjectCantReceiveTransfers(draftProject.status)
      );
    });

    it(
      'should throw an error if there is another pending or verified ' +
        'transfer with the same transferId',
      async () => {
        dbTransfer.push(verifiedTransfer);
        await expect(
          transferService.createTransfer({
            ...newTransfer,
            projectId: newTransfer.project,
            transferId: verifiedTransfer.transferId
          })
        ).rejects.toThrow(
          errors.transfer.TransferIdAlreadyExists(verifiedTransfer.transferId)
        );
      }
    );

    it('should throw an error if the receipt file is not a valid image', async () => {
      await expect(
        transferService.createTransfer({
          ...newTransfer,
          projectId: newTransfer.project,
          receiptFile: { name: 'receipt.doc', size: 20000 }
        })
      ).rejects.toThrow(errors.file.ImgFileTyPeNotValid);
    });

    it('should throw an error if the receipt image size is bigger than allowed', async () => {
      await expect(
        transferService.createTransfer({
          ...newTransfer,
          projectId: newTransfer.project,
          receiptFile: { name: 'receipt.jpg', size: 10000000 }
        })
      ).rejects.toThrow(errors.file.ImgSizeBiggerThanAllowed);
    });
  });

  describe('Testing transferService updateTransfer', () => {
    beforeAll(() => {
      injectMocks(transferService, {
        transferDao
      });
    });

    beforeEach(() => {
      dbTransfer = [];
      dbTransfer.push(pendingTransfer);
    });

    it('should update the pending transfer status and return its id', async () => {
      const response = await transferService.updateTransfer(
        pendingTransfer.id,
        { status: txFunderStatus.VERIFIED }
      );
      const updatedTransfer = dbTransfer.find(
        transfer => transfer.id === response.transferId
      );
      expect(updatedTransfer.status).toEqual(txFunderStatus.VERIFIED);
      expect(response).toEqual({ transferId: pendingTransfer.id });
    });

    it('should throw an error if parameters are not valid', async () => {
      await expect(
        transferService.updateTransfer(pendingTransfer.id, {})
      ).rejects.toThrow(errors.common.RequiredParamsMissing('updateTransfer'));
    });

    it('should throw an error if transfer does not exist', async () => {
      await expect(
        transferService.updateTransfer(0, { status: txFunderStatus.VERIFIED })
      ).rejects.toThrow(errors.common.CantFindModelWithId('fund_transfer', 0));
    });

    it('should throw an error if new status is not valid', async () => {
      await expect(
        transferService.updateTransfer(pendingTransfer.id, { status: 'wrong' })
      ).rejects.toThrow(errors.transfer.TransferStatusNotValid('wrong'));
    });

    it('should throw an error if transfer status is not pending', async () => {
      dbTransfer.push(verifiedTransfer);
      await expect(
        transferService.updateTransfer(verifiedTransfer.id, {
          status: txFunderStatus.CANCELLED
        })
      ).rejects.toThrow(
        errors.transfer.TransferStatusCannotChange(verifiedTransfer.status)
      );
    });
  });

  describe('Testing transferService getAllTransfersByProject', () => {
    beforeAll(() => {
      injectMocks(transferService, {
        transferDao,
        projectService
      });
    });

    beforeEach(() => {
      dbTransfer = [];
      dbProject = [fundingProject];
      dbTransfer.push(
        { ...pendingTransfer, projectId: fundingProject.id },
        { ...verifiedTransfer, projectId: fundingProject.id }
      );
    });

    it('should return an object with the list of transfers', async () => {
      const response = await transferService.getAllTransfersByProject(
        fundingProject.id
      );

      expect(response.length).toEqual(2);
    });

    it('should throw an error if projectId is undefined', async () => {
      await expect(transferService.getAllTransfersByProject()).rejects.toThrow(
        errors.common.RequiredParamsMissing('getAllTransfersByProject')
      );
    });

    it('should throw an error if project does not exist', async () => {
      await expect(transferService.getAllTransfersByProject(0)).rejects.toThrow(
        errors.common.CantFindModelWithId('project', 0)
      );
    });

    it('should throw an error if project status is not CONSENSUS or ONGOING', async () => {
      dbProject.push(draftProject);
      await expect(
        transferService.getAllTransfersByProject(draftProject.id)
      ).rejects.toThrow(errors.project.ProjectNotApproved);
    });
  });

  describe('Testing projectService getFundedAmount', () => {
    beforeAll(() => {
      injectMocks(transferService, {
        transferDao,
        projectService
      });
    });

    beforeEach(() => {
      dbProject = [];
      dbTransfer = [];
      dbProject.push(fundingProject);
      dbTransfer.push(verifiedTransfer, anotherVerifiedTransfer);
    });

    it('should return the funded amount for a project', async () => {
      const response = await transferService.getFundedAmount({
        projectId: fundingProject.id
      });

      const fundedAmount =
        verifiedTransfer.amount + anotherVerifiedTransfer.amount;

      return expect(response).toEqual({ fundedAmount });
    });

    it('should throw an error if an argument is not defined', async () => {
      await expect(transferService.getFundedAmount({})).rejects.toThrow(
        errors.common.RequiredParamsMissing('getFundedAmount')
      );
    });

    it('should throw an error if the project does not exist', async () => {
      await expect(
        transferService.getFundedAmount({
          projectId: 0
        })
      ).rejects.toThrow(errors.common.CantFindModelWithId('project', 0));
    });
  });

  describe('Testing sendAddTransferClaimTransaction method', () => {
    beforeAll(() => {
      injectMocks(transferService, {
        transferDao
      });
    });

    beforeEach(() => {
      dbUser = [];
      dbTransfer = [];
      dbUser.push(bankOperatorUser, userFunder);
      dbTransfer.push(pendingTransfer, verifiedTransfer);
    });

    it.each([
      [txFunderStatus.VERIFIED, true],
      [txFunderStatus.CANCELLED, false]
    ])(
      'should send the claim to the blockchain, ' +
        'update its status to %s when approved is %s ' +
        'and save the txHash in database',
      async (status, approved) => {
        const response = await transferService.sendAddTransferClaimTransaction({
          transferId: pendingTransfer.id,
          userId: bankOperatorUser.id,
          approved,
          signedTransaction: '0x123'
        });

        const updated = dbTransfer.find(t => t.id === pendingTransfer.id);
        expect(updated.status).toEqual(status);
        expect(updated.txHash).toEqual('0x01');
        expect(coa.sendAddClaimTransaction).toHaveBeenCalled();
        expect(response).toEqual({ transferId: pendingTransfer.id });
      }
    );

    it('should throw an error if any required param is missing', async () => {
      await expect(
        transferService.sendAddTransferClaimTransaction({
          transferId: pendingTransfer.id,
          approved: true,
          signedTransaction: '0x123'
        })
      ).rejects.toThrow(
        errors.common.RequiredParamsMissing('sendAddTransferClaimTransaction')
      );
    });

    it('should throw an error if the user is not a bank operator', async () => {
      await expect(
        transferService.sendAddTransferClaimTransaction({
          transferId: pendingTransfer.id,
          userId: userFunder.id,
          approved: true,
          signedTransaction: '0x123'
        })
      ).rejects.toThrow(errors.common.UserNotAuthorized(userFunder.id));
    });

    it('should throw an error if the transfer could not be found', async () => {
      await expect(
        transferService.sendAddTransferClaimTransaction({
          transferId: 0,
          userId: bankOperatorUser.id,
          approved: true,
          signedTransaction: '0x123'
        })
      ).rejects.toThrow(errors.common.CantFindModelWithId('fund_transfer', 0));
    });

    it('should throw an error if the transfer is not pending', async () => {
      await expect(
        transferService.sendAddTransferClaimTransaction({
          transferId: verifiedTransfer.id,
          userId: bankOperatorUser.id,
          approved: true,
          signedTransaction: '0x123'
        })
      ).rejects.toThrow(errors.transfer.InvalidTransferTransition);
    });
  });

  describe('Testing getAddTransferClaimTransaction method', () => {
    const userWallet = {
      address: '0xf828EaDD69a8A5936d863a1621Fe2c3dC568778D',
      encryptedWallet: '{"address":"ea2c2f7582d196de3c99bc6daa22621c4d5fe4aa"}'
    };
    beforeAll(() => {
      injectMocks(transferService, {
        transferDao,
        projectService
      });
    });

    beforeEach(() => {
      dbUser = [];
      dbTransfer = [];
      dbProject = [];
      dbUser.push(bankOperatorUser, userFunder);
      dbTransfer.push(pendingTransfer, verifiedTransfer);
      dbProject.push(fundingProject);
    });

    it('should return the unsigned transaction and the encrypted user wallet', async () => {
      const unsignedTx = {
        to: 'address',
        data: 'txdata',
        gasLimit: 60000
      };
      coa.getAddClaimTransaction.mockReturnValueOnce(unsignedTx);
      const response = await transferService.getAddTransferClaimTransaction({
        transferId: pendingTransfer.id,
        userId: bankOperatorUser.id,
        approved: true,
        userWallet
      });

      expect(coa.getAddClaimTransaction).toHaveBeenCalled();
      expect(response).toEqual({
        tx: unsignedTx,
        encryptedWallet: userWallet.encryptedWallet
      });
    });

    it('should throw an error if the project does not have an address', async () => {
      dbProject = [{ ...fundingProject, address: undefined }];
      await expect(
        transferService.getAddTransferClaimTransaction({
          transferId: pendingTransfer.id,
          userId: bankOperatorUser.id,
          approved: true,
          userWallet
        })
      ).rejects.toThrow(errors.project.AddressNotFound(fundingProject.id));
    });

    it('should throw an error if any required param is missing', async () => {
      await expect(
        transferService.getAddTransferClaimTransaction({
          transferId: pendingTransfer.id,
          userId: bankOperatorUser.id,
          approved: true
        })
      ).rejects.toThrow(
        errors.common.RequiredParamsMissing('getAddTransferClaimTransaction')
      );
    });

    it('should throw an error if the user is not a bank operator', async () => {
      await expect(
        transferService.getAddTransferClaimTransaction({
          transferId: pendingTransfer.id,
          userId: userFunder.id,
          approved: true,
          userWallet
        })
      ).rejects.toThrow(errors.common.UserNotAuthorized(userFunder.id));
    });

    it('should throw an error if the transfer could not be found', async () => {
      await expect(
        transferService.getAddTransferClaimTransaction({
          transferId: 0,
          userId: bankOperatorUser.id,
          approved: true,
          userWallet
        })
      ).rejects.toThrow(errors.common.CantFindModelWithId('fund_transfer', 0));
    });

    it('should throw an error if the transfer is not pending', async () => {
      await expect(
        transferService.getAddTransferClaimTransaction({
          transferId: verifiedTransfer.id,
          userId: bankOperatorUser.id,
          approved: true,
          userWallet
        })
      ).rejects.toThrow(errors.transfer.InvalidTransferTransition);
    });
  });

  describe('Testing validateAddTransferClaim method', () => {
    beforeAll(() => {
      injectMocks(transferService, {
        transferDao
      });
    });

    beforeEach(() => {
      dbUser = [];
      dbTransfer = [];
      dbUser.push(bankOperatorUser, userFunder);
      dbTransfer.push(pendingTransfer, verifiedTransfer);
    });

    it('should resolve to true if the transfer claim can be created', async () => {
      await expect(
        transferService.validateAddTransferClaim({
          transferId: pendingTransfer.id,
          userId: bankOperatorUser.id,
          approved: true
        })
      ).resolves.toEqual(true);
    });

    it('should throw an error if any required param is missing', async () => {
      await expect(
        transferService.validateAddTransferClaim({
          transferId: pendingTransfer.id,
          approved: true
        })
      ).rejects.toThrow(
        errors.common.RequiredParamsMissing('validateAddTransferClaim')
      );
    });

    it('should throw an error if the user is not a bank operator', async () => {
      await expect(
        transferService.validateAddTransferClaim({
          transferId: pendingTransfer.id,
          userId: userFunder.id,
          approved: true
        })
      ).rejects.toThrow(errors.common.UserNotAuthorized(userFunder.id));
    });

    it('should throw an error if the transfer could not be found', async () => {
      await expect(
        transferService.validateAddTransferClaim({
          transferId: 0,
          userId: bankOperatorUser.id,
          approved: true
        })
      ).rejects.toThrow(errors.common.CantFindModelWithId('fund_transfer', 0));
    });

    it('should throw an error if the transfer is not pending', async () => {
      await expect(
        transferService.validateAddTransferClaim({
          transferId: verifiedTransfer.id,
          userId: bankOperatorUser.id,
          approved: true
        })
      ).rejects.toThrow(errors.transfer.InvalidTransferTransition);
    });
  });
});
