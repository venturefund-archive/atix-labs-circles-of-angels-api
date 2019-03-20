const ProjectStatusDao = ({ projectStatusModel }) => ({
  async existStatus({ status }) {
    const exists = (await projectStatusModel.count({ status })) > 0;
    return exists;
  }
});

module.exports = ProjectStatusDao;
