const configs = require('config');
const ethServicesMock = require('../rest/services/eth/ethServicesMock')();

const {
  userRegistrationStatus,
  projectStatus,
  blockchainStatus,
  userRoles,
  activityStatus
} = require('../rest/util/constants');

exports.userOracle = {
  address: ethServicesMock.createAccount(),
  createdAt: '2019-04-16T03:00:00.000Z',
  email: 'oracle@test.com',
  id: 4,
  pwd: '$2a$10$phVS6ulzQvLpjIWE8bkyf.1EXtwcKUD7pgpe0CK7bYkYXmD5Ux2YK',
  registrationStatus: userRegistrationStatus.APPROVED,
  role: userRoles.ORACLE,
  updatedAt: '2019-05-28T03:00:00.000Z',
  username: 'Oracle 1'
};
exports.userSE = {
  address: ethServicesMock.createAccount(),
  createdAt: '2019-04-16T03:00:00.000Z',
  email: 'user@test.com',
  id: 2,
  pwd: '$2a$10$phVS6ulzQvLpjIWE8bkyf.1EXtwcKUD7pgpe0CK7bYkYXmD5Ux2YK',
  registrationStatus: userRegistrationStatus.APPROVED,
  role: userRoles.SOCIAL_ENTREPRENEUR,
  updatedAt: '2019-05-28T03:00:00.000Z',
  username: 'SE 1'
};

exports.userAdmin = {
  address: ethServicesMock.createAccount(),
  createdAt: '2019-04-16T03:00:00.000Z',
  email: 'admin@test.com',
  id: 1,
  pwd: '$2a$10$phVS6ulzQvLpjIWE8bkyf.1EXtwcKUD7pgpe0CK7bYkYXmD5Ux2YK',
  registrationStatus: userRegistrationStatus.APPROVED,
  role: userRoles.BO_ADMIN,
  updatedAt: '2019-05-28T03:00:00.000Z',
  username: 'Admin'
};

exports.userFunder = {
  address: ethServicesMock.createAccount(),
  createdAt: '2019-04-16T03:00:00.000Z',
  email: 'funder@test.com',
  id: 3,
  pwd: '$2a$10$phVS6ulzQvLpjIWE8bkyf.1EXtwcKUD7pgpe0CK7bYkYXmD5Ux2YK',
  registrationStatus: userRegistrationStatus.APPROVED,
  role: userRoles.IMPACT_FUNDER,
  updatedAt: '2019-05-28T03:00:00.000Z',
  username: 'Funder 1'
};

exports.activity = {
  blockchainStatus: blockchainStatus.CONFIRMED,
  budget: '1',
  category: 'Salary',
  createdAt: '2019-05-31T03:00:00.000Z',
  id: 1,
  impact: 'Increased capacity of outreach to students and process contracts',
  impactCriterion: 'Contract signed and person start working with us',
  keyPersonnel: 'COO, CEO, Investment in Education (IE) Manager ',
  milestone: 1,
  oracle: { ...this.userOracle },
  quarter: 'Quarter 1',
  signsOfSuccess: 'New team member joins the team',
  signsOfSuccessCriterion: 'Contract signed with new team member',
  status: activityStatus.PENDING,
  tasks: 'Hire a FISA officer in Cambodia (or Thailand)',
  transactionHash: '',
  type: 'Activity',
  updatedAt: '2019-05-31T03:00:00.000Z'
};

exports.milestone = {
  activities: [],
  blockchainStatus: blockchainStatus.CONFIRMED,
  budget: '1200',
  budgetStatus: { id: 1, name: 'Claimable' },
  category: 'Marketing costs and salaries',
  createdAt: '2019-05-31T03:00:00.000Z',
  id: 1,
  impact: 'Increased capacity of outreach to students and process contracts',
  impactCriterion: 'Contract signed and person start working with us',
  keyPersonnel: 'Newly hired IE team member',
  project: 1,
  quarter: 'Quarter 1',
  signsOfSuccess: 'Attendance and/or reach of event',
  signsOfSuccessCriterion:
    'Pictures of event, sign up sheets or other evidence when applicable',
  status: { status: 1, name: 'Pending' },
  tasks: 'Operations: Expand marketing capacity in Cambodia (or Thailand)',
  transactionHash: '',
  type: 'Milestone',
  updatedAt: '2019-05-31T03:00:00.000Z'
};

const projectId = 11;

exports.project = {
  blockchainStatus: blockchainStatus.CONFIRMED,
  cardPhoto: 2,
  coverPhoto: 1,
  createdAt: '2019-05-31T03:00:00.000Z',
  creationTransactionHash: ethServicesMock.createProject(),
  faqLink: 'http://www.google.com/',
  goalAmount: 9000,
  id: projectId,
  location: 'Location',
  milestones: [],
  milestonesFile: `${
    configs.fileServer.filePath
  }/projects/${projectId}/milestones.xlsx`,
  mission: 'Project Mission',
  ownerEmail: 'user@test.com',
  ownerId: 2,
  ownerName: 'Patrick Steward',
  pitchProposal: `${
    configs.fileServer.filePath
  }/projects/${projectId}/pitchProposal.pdf`,
  problemAddressed: 'Problem',
  projectAgreement: `${
    configs.fileServer.filePath
  }/projects/${projectId}/agreement.pdf`,
  projectName: 'nuevo',
  status: projectStatus.PUBLISHED,
  timeframe: 'Project Timeframe',
  transactionHash: ethServicesMock.createProject(),
  updatedAt: '2019-05-31T03:00:00.000Z'
};

exports.photos = [
  { id: 1, path: `${configs.fileServer.filePath}/projectCoverPhoto.png` },
  { id: 2, path: `${configs.fileServer.filePath}/projectCardPhoto.png` }
];
