const getUserRegistrationStatusById = userRegistrationStatusModel => async id => {
  const userRegistrationStatus = await userRegistrationStatusModel.findOne({
    id
  });
  return userRegistrationStatus;
};

const getAllRegistrationStatus = userRegistrationStatusModel => async () => {
  const userRegistrationStatusList = await userRegistrationStatusModel.find();
  return userRegistrationStatusList || [];
};

module.exports = userRegistrationStatusModel => ({
  getUserRegistrationStatusById: getUserRegistrationStatusById(
    userRegistrationStatusModel
  ),
  getAllRegistrationStatus: getAllRegistrationStatus(
    userRegistrationStatusModel
  )
});
