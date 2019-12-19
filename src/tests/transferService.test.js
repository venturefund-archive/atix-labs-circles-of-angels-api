/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart
 * contracts to develop impact milestones agreed
 * upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const {
  projectStatusType,
  userRoles,
  txFunderStatus
} = require('../rest/util/constants');
const { injectMocks } = require('../rest/util/injection');
const files = require('../rest/util/files');
const errors = require('../rest/errors/exporter/ErrorExporter');
const transferService = require('../rest/services/transferService');

describe('Testing transferService', () => {
  let dbProject = [];
  let dbUser = [];
  let dbTransfer = [];

  const consensusProject = {
    id: 1,
    status: projectStatusType.CONSENSUS
  };

  const draftProject = {
    id: 2,
    status: projectStatusType.DRAFT
  };

  const userFunder = {
    id: 1,
    role: userRoles.FUNDER
  };

  const oracleUser = {
    id: 2,
    role: userRoles.ORACLE
  };

  const newTransfer = {
    transferId: '1AA22SD444',
    amount: 200,
    senderId: userFunder.id,
    projectId: consensusProject.id,
    currency: 'USD',
    destinationAccount: '1235AASDD',
    receiptFile: { name: 'receipt.jpg', size: 20000 }
  };

  const verifiedTransfer = {
    id: 2,
    transferId: 'existing123',
    status: txFunderStatus.VERIFIED
  };

  const pendingTransfer = {
    id: 3,
    transferId: 'pendingABC',
    status: txFunderStatus.PENDING
  };

  beforeAll(() => {
    files.saveFile = jest.fn(() => '/dir/path');
  });

  const transferDao = {
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

    update: ({ id, status }) => {
      const existing = dbTransfer.find(transfer => transfer.id === id);
      if (existing) existing.status = status;
      return existing;
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

  const projectDao = {
    findById: id => dbProject.find(project => project.id === id)
  };

  const userDao = {
    findById: id => dbUser.find(user => user.id === id)
  };

  describe('Testing transferService createTransfer', () => {
    beforeAll(() => {
      injectMocks(transferService, {
        projectDao,
        userDao,
        transferDao
      });
    });

    beforeEach(() => {
      dbProject = [];
      dbUser = [];
      dbTransfer = [];
      dbProject.push(consensusProject);
      dbUser.push(userFunder);
    });

    it('should save the transfer as pending and return its id', async () => {
      const response = await transferService.createTransfer(newTransfer);
      const savedTransfer = dbTransfer.find(
        transfer => transfer.id === response.transferId
      );
      expect(savedTransfer.status).toEqual(txFunderStatus.PENDING);
      expect(response).toEqual({ transferId: 1 });
    });

    it('should throw an error if parameters are not valid', async () => {
      await expect(
        transferService.createTransfer({ ...newTransfer, projectId: undefined })
      ).rejects.toThrow(errors.RequiredParamsMissing('createTransfer'));
    });

    it('should throw an error if project does not exist', async () => {
      await expect(
        transferService.createTransfer({ ...newTransfer, projectId: 0 })
      ).rejects.toThrow(errors.CantFindModelWithId('project', 0));
    });

    it('should throw an error if sender user does not exist', async () => {
      await expect(
        transferService.createTransfer({ ...newTransfer, senderId: 0 })
      ).rejects.toThrow(errors.CantFindModelWithId('user', 0));
    });

    it('should throw an error if sender user is not a funder', async () => {
      dbUser.push(oracleUser);
      await expect(
        transferService.createTransfer({ ...newTransfer, senderId: 2 })
      ).rejects.toThrow(errors.UnauthorizedUserRole(oracleUser.role));
    });

    it('should throw an error if project status is not consensus', async () => {
      dbProject.push(draftProject);
      await expect(
        transferService.createTransfer({ ...newTransfer, projectId: 2 })
      ).rejects.toThrow(
        errors.ProjectCantReceiveTransfers(draftProject.status)
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
            transferId: verifiedTransfer.transferId
          })
        ).rejects.toThrow(
          errors.TransferIdAlreadyExists(verifiedTransfer.transferId)
        );
      }
    );

    it('should throw an error if the receipt file is not a valid image', async () => {
      await expect(
        transferService.createTransfer({
          ...newTransfer,
          receiptFile: { name: 'receipt.doc', size: 20000 }
        })
      ).rejects.toThrow(errors.ImgFileTyPeNotValid);
    });

    it('should throw an error if the receipt image size is bigger than allowed', async () => {
      await expect(
        transferService.createTransfer({
          ...newTransfer,
          receiptFile: { name: 'receipt.jpg', size: 10000000 }
        })
      ).rejects.toThrow(errors.ImgSizeBiggerThanAllowed);
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
      ).rejects.toThrow(errors.RequiredParamsMissing('updateTransfer'));
    });

    it('should throw an error if transfer does not exist', async () => {
      await expect(
        transferService.updateTransfer(0, { status: txFunderStatus.VERIFIED })
      ).rejects.toThrow(errors.CantFindModelWithId('fund_transfer', 0));
    });

    it('should throw an error if new status is not valid', async () => {
      await expect(
        transferService.updateTransfer(pendingTransfer.id, { status: 'wrong' })
      ).rejects.toThrow(errors.TransferStatusNotValid('wrong'));
    });

    it('should throw an error if transfer status is not pending', async () => {
      dbTransfer.push(verifiedTransfer);
      await expect(
        transferService.updateTransfer(verifiedTransfer.id, {
          status: txFunderStatus.CANCELLED
        })
      ).rejects.toThrow(
        errors.TransferStatusCannotChange(verifiedTransfer.status)
      );
    });
  });

  describe('Testing transferService getAllTransfersByProject', () => {
    beforeAll(() => {
      injectMocks(transferService, {
        transferDao,
        projectDao
      });
    });

    beforeEach(() => {
      dbTransfer = [];
      dbProject = [consensusProject];
      dbTransfer.push(
        { ...pendingTransfer, projectId: consensusProject.id },
        { ...verifiedTransfer, projectId: consensusProject.id }
      );
    });

    it('should return an object with the list of transfers', async () => {
      const response = await transferService.getAllTransfersByProject(
        consensusProject.id
      );

      expect(response.transfers.length).toEqual(2);
    });

    it('should throw an error if projectId is undefined', async () => {
      await expect(transferService.getAllTransfersByProject()).rejects.toThrow(
        errors.RequiredParamsMissing('getAllTransfersByProject')
      );
    });

    it('should throw an error if project does not exist', async () => {
      await expect(transferService.getAllTransfersByProject(0)).rejects.toThrow(
        errors.CantFindModelWithId('project', 0)
      );
    });

    it('should throw an error if project status is not CONSENSUS or ONGOING', async () => {
      dbProject.push(draftProject);
      await expect(
        transferService.getAllTransfersByProject(draftProject.id)
      ).rejects.toThrow(errors.ProjectNotApproved);
    });
  });

  describe('Testing projectService getTotalFundedByProject', () => {
    const project = 1;

    beforeAll(() => {
      injectMocks(transferService, {
        transferDao
      });
    });

    it('should return the amount total for an array of transfers for a project', async () => {
      const response = await transferService.getTotalFundedByProject(project);
      const expected = 600;
      return expect(response).toEqual(expected);
    });

    it('should return 0 if the project does not have any funds transferred', async () => {
      const response = await transferService.getTotalFundedByProject(0);
      const expected = 0;
      return expect(response).toEqual(expected);
    });

    it('should throw an error if it fails to get the transfers for a project', async () =>
      expect(transferService.getTotalFundedByProject()).rejects.toEqual(
        Error('Error getting transfers')
      ));
  });
});
