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
    .populate('user');
  return projectExperiences;
};

module.exports = projectExperienceModel => ({
  saveProjectExperience: saveProjectExperience(projectExperienceModel),
  getExperiencesByProject: getExperiencesByProject(projectExperienceModel)
});
