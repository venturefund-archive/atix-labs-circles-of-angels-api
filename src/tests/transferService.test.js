/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart contracts to develop impact milestones agreed upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { injectMocks } = require('../rest/util/injection');

describe('Testing projectService getTotalFundedByProject', () => {
  let transferDao;
  let transferService;

  const project = 1;

  beforeAll(() => {
    transferDao = {
      getTransfersByProjectAndState: (projectId, state) => {
        if (projectId === 0) {
          return undefined;
        }

        if (!projectId) {
          throw Error('Error getting transfers from db');
        }

        const transfers = [
          {
            id: 1,
            project: projectId,
            state,
            amount: 100
          },
          {
            id: 2,
            project: projectId,
            state,
            amount: 500
          }
        ];

        return transfers;
      }
    };

    transferService = require('../rest/services/transferService');
    injectMocks(transferService, {
      transferDao
    });
  });

  it('should return the amount total for an array of transfers for a project', async () => {
    const response = await transferService.getTotalFundedByProject(project);
    const expected = 600;
    return expect(response).toEqual(expected);
  });

  it('should return 0 if the project does not have any funds transferred', async () => {
    const response = await transferService.getTotalFundedByProject(0);
    const expected = 0;
    return expect(response).toEqual(expected);
  });

  it('should throw an error if it fails to get the transfers for a project', async () =>
    expect(transferService.getTotalFundedByProject()).rejects.toEqual(
      Error('Error getting transfers')
    ));
});
