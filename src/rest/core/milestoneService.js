const filePath = '/home/atixlabs/files/server';
const fastify = require('fastify')({ logger: true });

const milestoneService = () => {
  return {
    async createMilestones(projectMilestones, projectId) {
      const milestoneDao = require('../dao/milestoneDao')();
      const activityService = require('../core/activityService')();

      await projectMilestones.mv(`${filePath}/${projectMilestones.name}`);
      const milestones = await this.readMilestones(
        `${filePath}/${projectMilestones.name}`
      );

      const savedMilestones = [];
      Object.values(milestones).forEach(async milestone => {
        if (!this.isEmpty(milestone)) {
          const activityList = milestone.activityList.slice(0);
          const savedMilestone = await milestoneDao.saveMilestone(
            milestone,
            projectId
          );
          fastify.log.info(
            '[Milestone Service] :: Milestone Created: ',
            savedMilestone
          );
          savedMilestones.push(savedMilestone);
          await activityService.createActivities(
            activityList,
            savedMilestone.id
          );
        }
      });

      return savedMilestones;
    },

    async readMilestones(file) {
      const XLSX = require('xlsx');

      let workbook = null;
      try {
        workbook = XLSX.readFile(file);
      } catch (err) {
        throw err;
      }

      const sheetNameList = workbook.SheetNames;

      const worksheet = workbook.Sheets[sheetNameList[0]];

      const range = XLSX.utils.decode_range(worksheet['!ref']);
      range.s.r = 2; // skip first two rows
      worksheet['!ref'] = XLSX.utils.encode_range(range);

      const milestonesJSON = XLSX.utils.sheet_to_json(worksheet).slice(1);

      const milestones = [];
      let milestone = {};
      let quarter = '';

      Object.values(milestonesJSON).forEach(row => {
        let activity = {};

        if ('Timeline' in row) {
          quarter = row.Timeline;
        } else if (row.__EMPTY.includes('Milestone')) {
          milestone = {};
          milestone.quarter = quarter;
          milestone.tasks = row.Tasks !== undefined ? row.Tasks : '';
          milestone.impact =
            row['Expected Changes/ Social Impact Targets'] !== undefined
              ? row['Expected Changes/ Social Impact Targets']
              : '';
          milestone.impactCriterion =
            row['Review Criterion '] !== undefined
              ? row['Review Criterion ']
              : '';
          milestone.signsOfSuccess =
            row['Signs of Success'] !== undefined
              ? row['Signs of Success']
              : '';
          milestone.signsOfSuccessCriterion =
            row['Review Criterion _1'] !== undefined
              ? row['Review Criterion _1']
              : '';
          milestone.category =
            row['Expenditure Category'] !== undefined
              ? row['Expenditure Category']
              : '';
          milestone.keyPersonnel =
            row['Key Personnel Responsible'] !== undefined
              ? row['Key Personnel Responsible']
              : '';
          milestone.budget =
            row['Budget needed'] !== undefined ? row['Budget needed'] : '';

          milestone.activityList = [];

          milestones.push(milestone);
        } else if (row.__EMPTY.includes('Activity')) {
          activity = {};
          activity.tasks = row.Tasks !== undefined ? row.Tasks : '';
          activity.impact =
            row['Expected Changes/ Social Impact Targets'] !== undefined
              ? row['Expected Changes/ Social Impact Targets']
              : '';
          activity.impactCriterion =
            row['Review Criterion '] !== undefined
              ? row['Review Criterion ']
              : '';
          activity.signsOfSuccess =
            row['Signs of Success'] !== undefined
              ? row['Signs of Success']
              : '';
          activity.signsOfSuccessCriterion =
            row['Review Criterion _1'] !== undefined
              ? row['Review Criterion _1']
              : '';
          activity.category =
            row['Expenditure Category'] !== undefined
              ? row['Expenditure Category']
              : '';
          activity.keyPersonnel =
            row['Key Personnel Responsible'] !== undefined
              ? row['Key Personnel Responsible']
              : '';
          activity.budget =
            row['Budget needed'] !== undefined ? row['Budget needed'] : '';

          milestone.activityList.push(activity);
        }
      });

      return milestones;
    },

    isEmpty(milestone) {
      let empty = true;
      Object.entries(milestone).forEach(e => {
        if (e[0] !== 'activityList' && e[0] !== 'quarter') {
          if (e[1] !== '') {
            empty = false;
          }
        }
      });
      return empty;
    }
  };
};

module.exports = milestoneService;
