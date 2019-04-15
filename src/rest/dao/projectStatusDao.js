const ProjectStatusDao = ({ projectStatusModel }) => ({
  async existStatus({ status }) {
    const exists = (await projectStatusModel.count({ status })) > 0;
    return exists;
  },

  async getProjectStatusByName(name) {
    const projectStatus = await projectStatusModel.findOne({ name });
    return projectStatus;
  }
});

module.exports = ProjectStatusDao;
