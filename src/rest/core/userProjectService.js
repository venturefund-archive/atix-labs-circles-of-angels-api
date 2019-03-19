const userProjectService = ({ fastify, userProjectDao }) => ({
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
  }
});

module.exports = userProjectService;
