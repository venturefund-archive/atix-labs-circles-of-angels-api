const _ = require('lodash');

const ProjectDao = ({ projectModel, userDao }) => ({
  async saveProject(project) {
    const createdProject = await projectModel.create(project);
    return createdProject;
  },
  async getProjecListWithStatusFrom({ status }) {
    const projects = projectModel.find({ where: { status: { '>=': status } } });
    return projects;
  },
  async updateProjectStatus({ projectId, status }) {
    const response = projectModel.updateOne({ id: projectId }).set({ status });
    return response;
  },
  async getProjectById({ projectId }) {
    const project = await projectModel.findOne({ id: projectId });
    return this.addUserInfoOnProject({ project });
  },
  async addUserInfoOnProject({ project }) {
    const user = await userDao.getUserById({ id: project.ownerId });
    project.ownerName = user.username;
    project.ownerEmail = user.email;
    return project;
  },
  async updateProjectStatus({ projectId, status }) {
    const response = projectModel.updateOne({ id: projectId }).set({ status });
    return response;
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
  }
});

module.exports = ProjectDao;
