const userProjectService = ({ fastify, userProjectDao }) => ({
  /**
   * Receives a user id and a project id.
   *
   * Changes the status of the agreement between to signed if not already signed.
   *
   * @param {*} { userId, projectId }
   * @returns updated userProject row
   */
  async signAgreement({ userId, projectId }) {
    const userProject = await userProjectDao.findUserProject({
      userId,
      projectId
    });

    fastify.log.info(
      '[User Project Service] :: userProject found:',
      userProject
    );

    if (!userProject && userProject == null) {
      fastify.log.info('[User Project Service] :: userProject not found for:', {
        userId,
        projectId
      });
      return { error: 'User Project relation not found', status: 404 };
    }

    if (userProject.status === 1) {
      fastify.log.info(
        '[User Project Service] :: Agreement already signed for:',
        userProject
      );
      return { error: 'Agreement already signed', status: 409 };
    }

    const updatedUserProject = await userProjectDao.updateStatus({
      userProject,
      newStatus: 1
    });

    fastify.log.info(
      '[User Project Service] :: userProject status updated:',
      updatedUserProject
    );

    return updatedUserProject;
  },

  /**
   * Gets all userProjects and the users information associated with the project id received
   *
   * @param {*} projectId
   * @returns list of userProjects with the users information
   */
  async getUsers(projectId) {
    const userProjects = await userProjectDao.getUserProjects(projectId);

    fastify.log.info(
      '[User Project Service] :: UsersProjects found:',
      userProjects
    );

    if (!userProjects && userProjects == null) {
      fastify.log.info(
        '[User Project Service] :: Users not found for Project ID:',
        projectId
      );
      return { error: 'Users not found', status: 404 };
    }

    fastify.log.info(
      '[User Project Service] :: UsersProject found:',
      userProjects
    );

    return userProjects;
  }
});

module.exports = userProjectService;
