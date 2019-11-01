/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

// const mailService = (serviceLocator) => {

module.exports = {
  sendMail(to) {
    console.log(this.serviceLocator.get('emailClient'));
  }
};

// module.exports = serviceLocator => {
//   console.log(deps)
//   return {
//     sendMail(to) {
//       console.log(to, serviceLocator.get('emailClient'));
//     }

//    };
// };

// module.exports = {
//   configure: (deps) => {
//     Object.defineProperty(mailService, 'emailClient', deps.emailClient);
//   },
//   mailService
// };
