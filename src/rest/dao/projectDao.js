const _ = require('lodash');

const ProjectDao = ({ projectModel, userDao }) => ({
  async saveProject(project) {
    const createdProject = await projectModel.create(project);
    return createdProject;
  },
  async getProjecListWithStatusFrom({ status }) {
    let projects = await projectModel.find({
      where: { status: { '>=': status } }
    });
    for (var i in projects) {
      const aux = await this.addUserInfoOnProject({ project: projects[i] });
      projects[i] = aux;
    }
    return projects;
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
  }
});

module.exports = ProjectDao;
