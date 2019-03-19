const ProjectDao = ({ projectModel }) => ({
  async saveProject(project) {
    const createdProject = await projectModel.create(project);
    return createdProject;
  },
  async getProjectList() {
    const projects = projectModel.find({ where: { status: { '>': 0 } } });
    return projects;
  },
  async getProjectById(projectId) {
    const project = projectModel.findOne({ id: projectId });
    return project;
  },
  async updateProjectAgreement({ projectAgreement, projectId }) {
    const updated = projectModel
      .update({ id: projectId })
      .set({ projectAgreement });
    return updated;
  }
});

module.exports = ProjectDao;
