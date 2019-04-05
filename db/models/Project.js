/**
 * @description Represents a project of Circles Of Angels
 *@attribute `id`: id of the project in the business domain
 *@attribute `projectName`: name with which the user will be shown
 *@attribute `ownerId`: id of the user who is the creator
 *@attribute `mission`: project mission
 *@attribute `problemAddressed`: problem addressed by the project
 *@attribute `location`: geographical location where the project will be developed
 *@attribute `timeframe`: project time duration
 *@attribute `coverPhoto`: project cover image
 *@attribute `cardPhoto`: project icon
 *@attribute `status`: current project status
 *@attribute `goalAmount`: amount of money needed from the project
 *@attribute `faqLink`: link to the FAQ page
 *@attribute `pitchProposal`: initial proposal of the project
 *@attribute `milestonesFile`: excel file of milestones
 *@attribute `projectAgreement`: project consensus file
 */

module.exports = {
  identity: 'project',
  primaryKey: 'id',
  attributes: {
    projectName: { type: 'string', required: true },
    mission: { type: 'string', required: true },
    problemAddressed: { type: 'string', required: true },
    location: { type: 'string', required: true },
    timeframe: { type: 'string', required: true },
    pitchProposal: { type: 'string', required: false },
    faqLink: { type: 'string', required: true },
    coverPhoto: { type: 'string', required: false },
    milestonesFile: { type: 'string', required: false },
    cardPhoto: { type: 'string', required: false },
    goalAmount: { type: 'number', required: true },
    status: { type: 'number', defaultsTo: 0 },
    ownerId: { type: 'number', required: true },
    projectAgreement: { type: 'string', required: false },
    createdAt: { type: 'string', autoCreatedAt: true, required: false },
    updatedAt: { type: 'string', autoUpdatedAt: true, required: false },
    milestones: {
      collection: 'milestone',
      via: 'project'
    },
    id: { type: 'number', autoMigrations: { autoIncrement: true } }
  }
};
