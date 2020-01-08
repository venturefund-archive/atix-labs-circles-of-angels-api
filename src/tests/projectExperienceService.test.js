const { injectMocks } = require('../rest/util/injection');
const projectExperienceService = require('../rest/services/projectExperienceService');

const COAError = require('../rest/errors/COAError');
const errors = require('../rest/errors/exporter/ErrorExporter');

const validPhoto = { name: 'photo.jpeg', size: 12312 };
const invalidMtypePhoto = { name: 'invalid.json', size: 1233 };
const invalidSizePhoto = { name: 'photo.jpeg', size: 1231231231 };

const comment = 'commentaso';
const projectExperience = { projectId: 1, userId: 1, photos: [], comment };

describe('Project experience service', () => {
  beforeAll(() => {
    const files = { saveFile: () => 'path/of/photo' };
    const projectDao = {
      findById: id => {
        if (id === 1 || id === 2) return { id };
        return undefined;
      }
    };
    const userDao = {
      findById: id => {
        if (id === 1) return { id };
        return undefined;
      }
    };
    const projectExperienceDao = {
      saveProjectExperience: () => ({
        id: 1
      }),
      getExperiencesByProject: ({ project }) => {
        if (project === 1) {
          return [projectExperience];
        }
        return [];
      }
    };
    const projectExperiencePhotoDao = {
      saveProjectExperiencePhoto: () => {}
    };
    injectMocks(projectExperienceService, {
      files,
      projectDao,
      userDao,
      projectExperienceDao,
      projectExperiencePhotoDao
    });
  });
  describe('Validate photos', () => {
    it('Should not throw an error whenever valid photos are validated', () => {
      expect(() =>
        projectExperienceService.validatePhotos([
          validPhoto,
          validPhoto,
          validPhoto
        ])
      ).not.toThrow(COAError);
    });
    it('Should throw an error whenever valid photos and a photo with invalid size are validated', () => {
      expect(() =>
        projectExperienceService.validatePhotos([invalidSizePhoto, validPhoto])
      ).toThrow(COAError);
    });
    it('Should throw an error whenever valid photos and a photo with invalid type are validated', () => {
      expect(() =>
        projectExperienceService.validatePhotos([invalidMtypePhoto, validPhoto])
      ).toThrow(COAError);
    });
    it('Should throw an error whenever valid photos, a photo with invalid type and a photo with invalid size are validated', () => {
      expect(() =>
        projectExperienceService.validatePhotos([
          validPhoto,
          invalidSizePhoto,
          validPhoto,
          invalidMtypePhoto
        ])
      ).toThrow(COAError);
    });
  });
  describe('Save photos', () => {
    it('Should return an array with the paths of the files recently saved', async () => {
      const photoPaths = await projectExperienceService.savePhotos([
        validPhoto,
        validPhoto
      ]);
      photoPaths.forEach(async path =>
        expect(await path).toEqual('path/of/photo')
      );
    });
  });
  describe.only('Add experience', () => {
    it('Should create the project experience whenever the project exists and all fields are valid', async () => {
      const {
        projectExperienceId
      } = await projectExperienceService.addExperience({
        comment,
        projectId: 1,
        userId: 1,
        photos: [validPhoto]
      });
      expect(projectExperienceId).toEqual(1);
    });
    it('Should throw an error when some needed field is missing', () => {
      expect(
        projectExperienceService.addExperience({
          comment,
          projectId: 1,
          userId: 1
        })
      ).rejects.toThrow(errors.project.CreateProjectFieldsNotValid);
    });
    it('Should throw an error when the project exists but some photo has an invalid size', () => {
      expect(
        projectExperienceService.addExperience({
          comment,
          projectId: 1,
          userId: 1,
          photos: [invalidSizePhoto]
        })
      ).rejects.toThrow(errors.file.ImgSizeBiggerThanAllowed);
    });
    it('Should throw an error when the project exists but some photo has an invalid type', () => {
      expect(
        projectExperienceService.addExperience({
          comment,
          projectId: 1,
          userId: 1,
          photos: [invalidMtypePhoto]
        })
      ).rejects.toThrow(errors.file.ImgFileTyPeNotValid);
    });
    it('Should throw an error when the project does not exist', () => {
      expect(
        projectExperienceService.addExperience({
          comment,
          projectId: 2,
          userId: 1,
          photos: [validPhoto]
        })
      ).rejects.toThrow(errors.common.CantFindModelWithId('project', 2));
    });
    it('Should throw an error when the user does not exist', () => {
      expect(
        projectExperienceService.addExperience({
          comment,
          projectId: 1,
          userId: 5,
          photos: [validPhoto]
        })
      ).rejects.toThrow(errors.common.CantFindModelWithId('user', 5));
    });
  });
  describe('Get experiences on project', () => {
    it('Should return an array with all the project experiences of an existent project', async () => {
      const response = await projectExperienceService.getExperiencesOnProject({
        projectId: 1
      });
      expect(response).toHaveLength(1);
    });
    it('Should return an empty array when te project exist but no experience has been created', async () => {
      const response = await projectExperienceService.getExperiencesOnProject({
        projectId: 2
      });
      expect(response).toHaveLength(0);
    });
    it('Should throw an error when the project does not exist', () => {
      expect(
        projectExperienceService.getExperiencesOnProject({ projectId: 3 })
      ).rejects.toThrow(errors.common.CantFindModelWithId('project', 3));
    });
  });
});
