const ProjectDao = ({ projectModel }) => ({
  async saveProject(project) {
    const createdProject = await projectModel.create(project);
    return createdProject;
  },
  async getProjectList() {
    const projects = projectModel.find({ where: { status: { '>': 0 } } });
    return projects;
  }
});

module.exports = ProjectDao;
