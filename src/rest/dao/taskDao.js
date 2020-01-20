/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

module.exports = {
  async findById(taskId) {
    const task = await this.model.findOne({ id: taskId });
    return task;
  },

  async getTaskByIdWithMilestone(taskId) {
    const task = await this.model.findOne({ id: taskId }).populate('milestone');
    return task;
  }
};
