/**
 * AGPL License
 * Circle of Angels aims to democratize social impact financing.
 * It facilitate the investment process by utilizing smart
 * contracts to develop impact milestones agreed
 * upon by funders and the social entrepenuers.
 *
 * Copyright (C) 2019 AtixLabs, S.R.L <https://www.atixlabs.com>
 */

const { find } = require('lodash');
const assert = require('assert');

const { projectStatus } = require('../rest/util/constants');

const { injectMocks } = require('../rest/util/injection');

const projectService = require('../rest/services/projectService');

describe('Testing projectService createProject', () => {
  // here are the variables of dependencies to inject
  beforeAll(() => {
    injectMocks(projectService, {
      // dependencies
    });
  });

  it('should not explode', async () => {
    const params = undefined;
    assert.fail(projectService.validateParams(params));
  });
});
