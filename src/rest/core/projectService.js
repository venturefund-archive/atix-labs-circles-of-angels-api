const filePath = '/home/atixlabs/files/server';
const fastify = require('fastify')({ logger: true });

const projectService = () => {
  return {
    async createProject(projectXls, projectPhoto, projectMilestones) {
      const projectDao = require('../dao/projectDao')();
      const milestoneService = require('../core/milestoneService')();

      try {
        fastify.log.info(
          '[Project Service] :: Saving Project excel to:',
          `${filePath}/${projectXls.name}`
        );

        await projectXls.mv(`${filePath}/${projectXls.name}`);
        const project = await this.readProject(
          `${filePath}/${projectXls.name}`
        );

        project.ownerId = 1; // <-- TODO: Replace this line for the actual user id
        project.status = 0;

        fastify.log.info(
          '[Project Service] :: Saving Project photo to:',
          `${filePath}/${projectPhoto.name}`
        );

        await projectPhoto.mv(`${filePath}/${projectPhoto.name}`);
        project.photo = `${filePath}/${projectPhoto.name}`;

        const savedProject = await projectDao.saveProject(project);

        fastify.log.info('[Project Service] :: Project created:', savedProject);

        await milestoneService.createMilestones(
          projectMilestones,
          savedProject.id
        );

        return savedProject;
      } catch (err) {
        fastify.log.error('[Project Service] :: Error creating Project:', err);
        throw Error('Error creating Project from file');
      }
    },

    async readProject(file) {
      const XLSX = require('xlsx');

      let workbook = null;

      try {
        fastify.log.info('[Project Service] :: Reading Project excel:', file);
        workbook = XLSX.readFile(file);
      } catch (err) {
        fastify.log.error('[Project Service] Error reading excel ::', err);
        throw Error('Error reading excel file');
      }

      if (workbook == null) {
        fastify.log.error(
          '[Project Service] :: Error reading Project excel file'
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

      fastify.log.info(
        '[Project Service] :: Project data retrieved from file:',
        project
      );
      return project;
    }
  };
};

module.exports = projectService;
