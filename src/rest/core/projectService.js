const filePath = '/home/atixlabs/files/server';
const fastify = require('fastify')({ logger: true });

const projectService = () => {
  return {
    async createProject(projectXls, projectPhoto, projectMilestones) {
      const projectDao = require('../dao/projectDao')();
      const milestoneService = require('../core/milestoneService')();

      try {
        await projectXls.mv(`${filePath}/${projectXls.name}`);
        const project = await this.readProject(
          `${filePath}/${projectXls.name}`
        );

        project.ownerId = 1;
        project.status = 0;

        await projectPhoto.mv(`${filePath}/${projectPhoto.name}`);
        project.photo = `${filePath}/${projectPhoto.name}`;

        const savedProject = await projectDao.saveProject(project);

        fastify.log.info(
          '[Project Service] :: Project Created: ',
          savedProject
        );

        await milestoneService.createMilestones(
          projectMilestones,
          savedProject.id
        );

        return savedProject;
      } catch (err) {
        throw err;
      }
    },

    async readProject(file) {
      const XLSX = require('xlsx');

      let workbook = null;

      try {
        workbook = XLSX.readFile(file);
      } catch (err) {
        throw err;
      }

      if (workbook == null) {
        fastify.log.error(
          '[Project Service] :: Error reading project excel file'
        );
        throw Error('Error reading excel file');
      }

      const sheetNameList = workbook.SheetNames;
      const worksheet = workbook.Sheets[sheetNameList[0]];

      const projectJSON = XLSX.utils.sheet_to_json(worksheet).slice(1)[0];

      const project = {
        projectName: projectJSON['Project Name'],
        mission: projectJSON.Mission,
        problemAddressed: projectJSON['Problem Addressed'],
        location: projectJSON['Enterprise Location'],
        timeframe: projectJSON.Timeframe
      };

      return project;
    }
  };
};

module.exports = projectService;
