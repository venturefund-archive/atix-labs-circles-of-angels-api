/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { forEachPromise } = require('../util/promises');
const { projectStatus } = require('../util/constants');

module.exports = {
  async saveProject(project) {
    const createdProject = await this.model.create(project);
    return createdProject;
  },

  async findAllByProps(props) {
    return this.model.find({ ...props });
  },

  async getProjecListWithStatusFrom({ status }) {
    const projects = await this.model.find({
      where: { status: { '>=': status } },
      sort: 'id DESC'
    });
    await forEachPromise(projects, project =>
      this.addUserInfoOnProject(project)
    );
    return projects;
  },

  async updateProjectStatus({ projectId, status }) {
    const response = this.model.updateOne({ id: projectId }).set({ status });
    return response;
  },

  async updateProjectTransaction({ projectId, transactionHash }) {
    const response = this.model
      .updateOne({ id: projectId })
      .set({ transactionHash });
    return response;
  },

  async getProjectById({ projectId }) {
    const project = await this.model.findOne({ id: projectId });

    // returns undefined if not found
    if (!project || project == null) {
      return project;
    }
    return this.addUserInfoOnProject(project);
  },

  async findById(id) {
    return this.model.findOne({ id });
  },

  async addUserInfoOnProject(project) {
    const user = await userDao.getUserById(project.ownerId);
    if (!user) return project;
    project.ownerName = user.username;
    project.ownerEmail = user.email;
    return project;
  },

  async deleteProject({ projectId }) {
    const deletedProject = this.model.destroy({ id: projectId }).fetch();
    return deletedProject;
  },

  async getProjectMilestones({ projectId }) {
    const projectMilestones = await this.model
      .findOne({ id: projectId })
      .populate('milestones');
    return projectMilestones ? projectMilestones.milestones : [];
  },

  async getProjectMilestonesFilePath(projectId) {
    return this.model.findOne({
      where: { id: projectId },
      select: ['milestonesFile']
    });
  },

  async updateProjectAgreement({ projectAgreement, projectId }) {
    const updated = this.model
      .update({ id: projectId })
      .set({ projectAgreement });
    return updated;
  },

  async updateProject(project, id) {
    const toUpdate = { ...project };
    console.log('toUpdate', toUpdate);

    delete toUpdate.id;
    delete toUpdate.ownerId;

    const savedProject = await this.model
      .updateOne({ id })
      .set({ ...toUpdate });

    return savedProject;
  },

  async getProjectPhotos(projectId) {
    return this.model.findOne({
      where: { id: projectId },
      select: ['coverPhoto', 'cardPhoto']
    });
  },

  async getUserOwnerOfProject(projectId) {
    try {
      const project = await this.getProjectById({ projectId });
      const owner = await userDao.getUserById(project.ownerId);
      return owner;
    } catch (error) {
      throw Error('Error getting User');
    }
  },

  async getProjectsByOwner(ownerId) {
    return this.model.find({
      ownerId,
      status: { '>=': projectStatus.PUBLISHED }
    });
  },

  async getAllProjectsById(projectsId) {
    return this.model.find({
      id: projectsId,
      status: { '>=': projectStatus.PUBLISHED }
    });
  },

  async updateBlockchainStatus(id, blockchainStatus) {
    return this.model.updateOne({ id }).set({ blockchainStatus });
  },

  async updateStartBlockchainStatus(id, startBlockchainStatus) {
    return this.model.updateOne({ id }).set({ startBlockchainStatus });
  },

  async updateCreationTransactionHash(id, creationTransactionHash) {
    return this.model.updateOne({ id }).set({ creationTransactionHash });
  },

  async updateStartTransactionHash(id, transactionHash) {
    return this.model.updateOne({ id }).set({ transactionHash });
  }
};
