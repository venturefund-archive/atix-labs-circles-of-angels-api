const ProjectDao = ({ projectModel }) => ({
  async saveProject(project) {
    const createdProject = await projectModel.create(project);
    return createdProject;
  },
  async getProjecListWithStatusFrom({ status }) {
    const projects = projectModel.find({ where: { status: { '>=': status } } });
    return projects;
  },
  async getProjectById({ projectId }) {
    const project = projectModel.findOne({ id: projectId });
    return project;
  },
  async updateProjectStatus({ projectId, status }) {
    const response = projectModel.updateOne({ id: projectId }).set({ status });
    return response;
  }
});

module.exports = ProjectDao;
