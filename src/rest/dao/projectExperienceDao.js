/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */
module.exports = {
  async saveProjectExperience(projectExperience) {
    const savedProjectExperience = await this.model.create(projectExperience);
    return savedProjectExperience;
  },

  async getExperiencesByProject({ project }) {
    const projectExperiences = await this.model
      .find({
        project
      })
      .populate('user')
      .populate('photos');
    return projectExperiences;
  }
};
