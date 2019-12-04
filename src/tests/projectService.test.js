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
const errors = require('../rest/errors/exporter/ErrorExporter');
const COAError = require('../rest/errors/COAError');
const {
  validateExistence,
  validateParams,
  validateMtype,
  validatePhotoSize,
  xslValidator,
  imgValidator
} = require('../rest/services/helpers/projectServiceHelper');

const projectService = require('../rest/services/projectService');

describe('Project service helper', () => {
  // here are the variables of dependencies to inject

  describe('- ValidateParams', () => {
    it('Whenever one param is undefined, validateParams should throw COAError', async () => {
      const params = undefined;
      const notParamUndefined = 'this is not undefined';
      expect(() => validateParams(params, notParamUndefined)).toThrow(
        errors.CreateProjectFieldsNotValid
      );
    });

    it('Whenever the only param is undefined, validateParams should throw COAError', async () => {
      const params = undefined;
      expect(() => validateParams(params)).toThrow(
        errors.CreateProjectFieldsNotValid
      );
    });

    it('Whenever no param is undefined, validateParams should NOT throw COAError', async () => {
      const params = 'this is not undefined';
      const params2 = 'this is still not undefined';
      expect(() => validateParams(params, params2)).not.toThrow(COAError);
    });
  });

  describe('- ValidateExistence', () => {
    const projectDao = {
      findById: async id => {
        if (id === 1) {
          return new Promise(resolve => resolve);
        }
        return new Promise(resolve => resolve(undefined));
      }
    };

    beforeAll(() => {
      injectMocks(projectService, {
        projectDao
      });
    });

    it('Should not throw an error whenever the object exists', async () => {
      const idOfObjectThatExists = 1;
      expect(
        validateExistence(projectDao, idOfObjectThatExists, 'projectMock')
      ).rejects.not.toThrow(COAError);
    });

    it('Should return an object whenever the object exists', async () => {
      const idOfObjectThatExists = 1;
      expect(
        validateExistence(projectDao, idOfObjectThatExists, 'projectMock')
      ).resolves.toHaveProperty('id', 1);
    });

    it('Should throw an error whenever the object queried does not exists', async () => {
      const idOfObjectThatDoesntExists = 2;
      expect(
        validateExistence(projectDao, idOfObjectThatDoesntExists, 'projectMock')
      ).rejects.toThrow(COAError);
    });
  });
  describe('- ValidateMtype', () => {});
  describe('- ValidatePhotoSize', () => {});
  describe('- XslValidator', () => {});
  describe('- ImgValidator', () => {});
});
