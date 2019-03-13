const ProjectDao = () => ({
  projectModel: require('../server').fastify.models.project,

  async saveProject(project) {
    const createdProject = await this.projectModel.create(project);
    return createdProject;
  }
});

module.exports = ProjectDao;
