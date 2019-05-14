const saveProjectExperience = projectExperienceModel => async projectExperience => {
  const savedProjectExperience = await projectExperienceModel.create(
    projectExperience
  );
  return savedProjectExperience;
};

module.exports = projectExperienceModel => ({
  saveProjectExperience: saveProjectExperience(projectExperienceModel)
});
