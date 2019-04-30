const getUserRegistrationStatusById = userRegistrationStatusModel => async id => {
  const userRegistrationStatus = await userRegistrationStatusModel.findOne({
    id
  });
  return userRegistrationStatus;
};

module.exports = userRegistrationStatusModel => ({
  getUserRegistrationStatusById: getUserRegistrationStatusById(
    userRegistrationStatusModel
  )
});
