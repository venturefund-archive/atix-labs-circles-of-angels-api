/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { coa } = require('@nomiclabs/buidler');
const { utils } = require('ethers');
const {
  txFunderStatus,
  projectStatuses,
  userRoles,
  publicProjectStatuses
} = require('../util/constants');
const files = require('../util/files');
const checkExistence = require('./helpers/checkExistence');
const validateRequiredParams = require('./helpers/validateRequiredParams');
const validateMtype = require('./helpers/validateMtype');
const validatePhotoSize = require('./helpers/validatePhotoSize');
const errors = require('../errors/exporter/ErrorExporter');
const COAError = require('../errors/COAError');
const logger = require('../logger');

// TODO: replace with actual function
const sha3 = (a, b) => utils.id(`${a}-${b}`);

module.exports = {
  /**
   * Creates a transfer from one user to another user's account.
   * Returns an object with the created transfer's `id`
   * @param {Object} transfer - The transfer to be created
   * @param {number} transfer.transferId
   * @param {number} transfer.senderId
   * @param {string} transfer.destinationAccount
   * @param {number} transfer.amount
   * @param {string} transfer.currency
   * @param {number} transfer.projectId
   * @returns {{ transferId: number }} transfer's `id` field
   */
  async createTransfer({
    transferId,
    senderId,
    destinationAccount,
    amount,
    currency,
    projectId,
    receiptFile
  }) {
    logger.info('[TransferService] :: Entering createTransfer method');
    validateRequiredParams({
      method: 'createTransfer',
      params: {
        transferId,
        senderId,
        destinationAccount,
        amount,
        currency,
        projectId,
        receiptFile
      }
    });
    const project = await checkExistence(this.projectDao, projectId, 'project');
    const user = await checkExistence(this.userDao, senderId, 'user');

    if (user.role !== userRoles.PROJECT_SUPPORTER) {
      logger.error(`[TransferService] :: User ${user.id} is not a funder`);
      throw new COAError(errors.user.UnauthorizedUserRole(user.role));
    }

    // TODO check if another status will allow transfers
    if (project.status !== projectStatuses.FUNDING) {
      logger.error(
        `[TransferService] :: Project ${project.id} is not on consensus phase`
      );
      throw new COAError(
        errors.transfer.ProjectCantReceiveTransfers(project.status)
      );
    }

    const existingTransfer = await this.transferDao.getTransferById({
      transferId
    });

    // TODO: define what should be done with the reconciliation status
    if (
      existingTransfer &&
      existingTransfer.status !== txFunderStatus.CANCELLED
    ) {
      logger.error(
        `[TransferService] :: Transfer ${
          existingTransfer.id
        } with same tranferId already exists`
      );
      throw new COAError(errors.transfer.TransferIdAlreadyExists(transferId));
    }

    validateMtype('transferReceipt', receiptFile);
    validatePhotoSize(receiptFile);
    const receiptPath = await files.saveFile('transferReceipt', receiptFile);

    const transfer = {
      transferId,
      senderId,
      destinationAccount,
      amount,
      currency,
      projectId,
      receiptPath
    };
    logger.info('[TransferService] :: Creating transfer with params', transfer);
    const created = await this.transferDao.create({
      ...transfer,
      status: txFunderStatus.PENDING
    });
    logger.info(
      '[TransferService] :: New transfer created with id',
      created.id
    );

    return { transferId: created.id };
  },

  /**
   * Updates an existing transfer status
   * Returns its `id` if successfully updated
   * @param {number} id - Transfer's `id` field
   * @param {Object} status - New status to update the transfer with
   * @param {string} status.status
   * @returns {{ transferId: number }} transfer's `id` field
   */
  async updateTransfer(id, { status }) {
    logger.info('[TransferService] :: Entering updateTransfer method');
    validateRequiredParams({
      method: 'updateTransfer',
      params: { id, status }
    });

    const transfer = await checkExistence(
      this.transferDao,
      id,
      'fund_transfer'
    );

    if (!Object.values(txFunderStatus).includes(status)) {
      logger.error(
        `[TransferService] :: Transfer status '${status}' is not valid`
      );
      throw new COAError(errors.transfer.TransferStatusNotValid(status));
    }

    // TODO: define what to do with RECONCILIATION status
    if (transfer.status !== txFunderStatus.PENDING) {
      logger.error('[TransferService] :: Transfer status is not pending', {
        id: transfer.id,
        status: transfer.status
      });
      throw new COAError(
        errors.transfer.TransferStatusCannotChange(transfer.status)
      );
    }

    const updated = await this.transferDao.update({ id, status });
    return { transferId: updated.id };
  },

  /**
   * Returns an array with all transfers for the specified project
   * @param {number} projectId - Project to get all transfers from
   * @returns {{ transfers: array }}
   */
  async getAllTransfersByProject(projectId) {
    logger.info(
      '[TransferService] :: Entering getAllTransfersByProject method'
    );
    validateRequiredParams({
      method: 'getAllTransfersByProject',
      params: { projectId }
    });

    const project = await checkExistence(this.projectDao, projectId, 'project');

    // TODO: define in which project phase/s this list would make sense
    if (!Object.values(publicProjectStatuses).includes(project.status)) {
      logger.error(
        '[TransferService] :: Project has not been approved yet',
        project
      );
      throw new COAError(errors.project.ProjectNotApproved);
    }

    logger.info(
      '[TransferService] :: Getting all transfer for project',
      projectId
    );

    // TODO: might have to add pagination
    const transfers = await this.transferDao.getAllTransfersByProject(
      projectId
    );

    logger.info(
      `[TransferService] :: Found ${transfers.length} for project ${projectId}`
    );
    return transfers;
  },

  /**
   * Returns an array with all transfers that match the criteria passed as parameter
   * @param {{ filters: object, populate: object }} props
   * @returns {Promise<transfer[]>}
   */
  async getAllTransfersByProps(props) {
    logger.info('[TransferService] :: Entering getAllTransfersByProps method');

    const filters = props ? props.filters : {};
    const populate = props ? props.populate : {};

    logger.info('[TransferService] :: Getting all transfers with options', {
      filters,
      populate
    });
    const transfers = await this.transferDao.findAllByProps(filters, populate);
    logger.info(`[TransferService] :: Found ${transfers.length} transfers`);
    return transfers;
  },

  async getTransferById({ transferId }) {
    return this.transferDao.findTransferById(transferId);
  },

  async getTransferStatusByUserAndProject({ senderId, projectId }) {
    const transfer = await this.transferDao.getTransferStatusByUserAndProject({
      senderId,
      projectId
    });
    return transfer;
  },

  /**
   * Finds all approved funds for a project and returns the total amount
   *
   * @param {number} projectId
   * @returns total funded amount || error
   */
  async getFundedAmount({ projectId }) {
    logger.info('[TransferService] :: Entering getFundedAmount method');
    validateRequiredParams({
      method: 'getFundedAmount',
      params: { projectId }
    });

    const project = await checkExistence(this.projectDao, projectId, 'project');

    const allowedStatuses = [
      projectStatuses.FUNDING,
      projectStatuses.EXECUTING,
      projectStatuses.FINISHED
    ];

    if (!allowedStatuses.includes(project.status)) {
      logger.error(
        `[TransferService] :: Can't get total fund amount when project is in ${
          project.status
        } status`
      );
      throw new COAError(
        errors.project.InvalidStatusForGetFundAmount(project.status)
      );
    }

    const transfers = await this.transferDao.findAllByProps({
      project: projectId,
      status: txFunderStatus.VERIFIED
    });

    const totalAmount = transfers.reduce(
      (total, transfer) => total + transfer.amount,
      0
    );

    logger.info(
      `[Transfer Service] :: Project ${projectId} has ${totalAmount} total funds`
    );

    return { fundedAmount: totalAmount };
  },

  /**
   * Add a transfer claim for an existing project
   *
   * @param {number} transferId
   * @param {number} userId
   * @param {object} file
   * @param {boolean} approved
   * @returns transferId || error
   */
  async addTransferClaim({ transferId, userId, approved, rejectionReason }) {
    logger.info('[TransferService] :: Entering addTransferClaim method');
    validateRequiredParams({
      method: 'addTransferClaim',
      params: { transferId, userId, approved }
    });

    const user = await checkExistence(this.userDao, userId, 'user');

    if (user.role !== userRoles.BANK_OPERATOR) {
      logger.error(
        `[TransferService] :: User ${userId} not authorized for this action`
      );
      throw new COAError(errors.common.UserNotAuthorized(userId));
    }

    const transfer = await checkExistence(
      this.transferDao,
      transferId,
      'fund_transfer'
    );

    const { status: currentStatus } = transfer;
    const { VERIFIED, CANCELLED } = txFunderStatus;

    if ([VERIFIED, CANCELLED].includes(currentStatus)) {
      logger.error(
        '[Transfer Service] :: Transfer status transition is not valid'
      );
      throw new COAError(errors.transfer.InvalidTransferTransition);
    }

    // TODO replace both fields with the correct information
    // const { projectId } = transfer;
    // const claim = sha3(projectId, transferId);
    // const proof = utils.id(file.name);

    // // TODO: uncomment this when contracts are deployed
    // // await coa.addClaim(projectId, claim, proof, approved);

    const status = approved ? VERIFIED : CANCELLED;
    const fields = { id: transferId, status };
    if (rejectionReason) fields.rejectionReason = rejectionReason;

    const updated = await this.transferDao.update(fields);
    logger.info('[TransferService] :: Claim added and status transfer updated');
    return { transferId: updated.id };
  }
};
