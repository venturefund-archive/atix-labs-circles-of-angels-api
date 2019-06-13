/**
 * AGPL LICENSE
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const saveProjectExperience = projectExperienceModel => async projectExperience => {
  const savedProjectExperience = await projectExperienceModel.create(
    projectExperience
  );
  return savedProjectExperience;
};

const getExperiencesByProject = projectExperienceModel => async project => {
  const projectExperiences = await projectExperienceModel
    .find({
      project
    })
    .populate('user')
    .populate('photos');
  return projectExperiences;
};

module.exports = projectExperienceModel => ({
  saveProjectExperience: saveProjectExperience(projectExperienceModel),
  getExperiencesByProject: getExperiencesByProject(projectExperienceModel)
});
