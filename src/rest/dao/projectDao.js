const ProjectDao = ({ projectModel }) => ({
  async saveProject(project) {
    const createdProject = await projectModel.create(project);
    return createdProject;
  },
  async getProjecListWithStatusFrom({ status }) {
    const projects = projectModel.find({ where: { status: { '>=': status } } });
    return projects;
  }
});

module.exports = ProjectDao;
