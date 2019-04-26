const { forEachPromise } = require('../util/promises');

const ProjectDao = ({ projectModel, userDao }) => ({
  async saveProject(project) {
    const createdProject = await projectModel.create(project);
    return createdProject;
  },

  async getProjecListWithStatusFrom({ status }) {
    const projects = await projectModel.find({
      where: { status: { '>=': status } },
      sort: 'id DESC'
    });
    await forEachPromise(projects, project =>
      this.addUserInfoOnProject(project)
    );
    return projects;
  },

  async updateProjectStatus({ projectId, status }) {
    const response = projectModel.updateOne({ id: projectId }).set({ status });
    return response;
  },

  async updateProjectStatusWithTransaction({
    projectId,
    status,
    transactionHash
  }) {
    const response = projectModel
      .updateOne({ id: projectId })
      .set({ status, transactionHash });
    return response;
  },

  async getProjectById({ projectId }) {
    const project = await projectModel.findOne({ id: projectId });

    // returns undefined if not found
    if (!project || project == null) {
      return project;
    }
    return this.addUserInfoOnProject(project);
  },

  async addUserInfoOnProject(project) {
    const user = await userDao.getUserById(project.ownerId);
    if (!user) return project;
    project.ownerName = user.username;
    project.ownerEmail = user.email;
    return project;
  },

  async deleteProject({ projectId }) {
    const deletedProject = projectModel.destroy({ id: projectId }).fetch();
    return deletedProject;
  },

  async getProjectMilestones({ projectId }) {
    const projectMilestones = await projectModel
      .findOne({ id: projectId })
      .populate('milestones');
    return projectMilestones ? projectMilestones.milestones : [];
  },

  async getProjectMilestonesFilePath(projectId) {
    return projectModel.findOne({
      where: { id: projectId },
      select: ['milestonesFile']
    });
  },

  async updateProjectAgreement({ projectAgreement, projectId }) {
    const updated = projectModel
      .update({ id: projectId })
      .set({ projectAgreement });
    return updated;
  },

  async updateProject(project, id) {
    const toUpdate = { ...project };

    delete toUpdate.id;
    delete toUpdate.ownerId;

    const savedProject = await projectModel
      .updateOne({ id })
      .set({ ...toUpdate });

    return savedProject;
  },

  async getProjectPhotos(projectId) {
    return projectModel.findOne({
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
  }
});

module.exports = ProjectDao;
