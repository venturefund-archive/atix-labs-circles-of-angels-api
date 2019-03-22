const { forEachPromise } = require('../util/promises');

const ProjectDao = ({ projectModel, userDao }) => ({
  async saveProject(project) {
    const createdProject = await projectModel.create(project);
    return createdProject;
  },
  async getProjecListWithStatusFrom({ status }) {
    const projects = await projectModel.find({
      where: { status: { '>=': status } }
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
  async getProjectById({ projectId }) {
    const project = await projectModel.findOne({ id: projectId });
    return this.addUserInfoOnProject(project);
  },
  async addUserInfoOnProject(project) {
    const user = await userDao.getUserById({ id: project.ownerId });
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
  }
});

module.exports = ProjectDao;
