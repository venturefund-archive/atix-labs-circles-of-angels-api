const ProjectDao = () => ({
  projectModel: require('../server').fastify.models.project,

  async saveProject(project) {
    const createdProject = await this.projectModel.createProject(project);
    return createdProject;
  }
});

module.exports = ProjectDao;
