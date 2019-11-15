#### - async createProject(project,projectProposal,projectCoverPhoto,projectCardPhoto,projectMilestones,projectAgreement,ownerId) : 
	1) checks agreement file type
	2) checks proposal file type
	3) checks project card photo file type
	4) checks project cover photo file type
	5) checks project card photo file size
	6) checks project cover photo file size
	7) checks milestone file type
	8) saves project
	9) add paths to files properties
	10) creates directorys for project's file
	11) saves project's photos and proposal
	12) saves milestone excel
	13) reads milestone excel
	14) creates milestones for project 
	15) eth.createProject
	16) updates project? why? --> because between steps 8 and 15, it does a lot of changes (saves img and blockchain stuff) 

#### - checkProposalType(file)
	1) looks for file's mimeType
	2) checks if file's mimeType is a valid file type for proposal

##### Proposal valid types: 
	- application/msword
	- application/vnd.openxmlformats-officedocument.wordprocessingml.document
	- application/pdf
	- application/vnd.ms-powerpoint
	- application/vnd.openxmlformats-officedocument.presentationml.presentation
		
#### -  checkAgreementType(file)
	1) looks for file's mimeType
        2) checks if file's mimeType is a valid file type for agreement

##### Agreement valid types:
	- application/msword
	- application/vnd.openxmlformats-officedocument.wordprocessingml.document
	- application/pdf

#### - checkCoverPhotoType(file)
	1) looks for file's mimeType
        2) checks if file's mimeType is a valid file type for cover photo

##### Cover photo valid types:
	- image/

#### - checkPhotoSize(photo)
	1) checks photo's size not being bigger than MAX_PHOTO_SIZE

#### - checkCardPhotoType(file)
	1) looks for file's mimeType
        2) checks if file's mimeType is a valid file type for card photo

##### Card photo vald types:
	- image/

#### - checkMilestonesFileType(file)
	1) looks for file's mimeType
        2) checks if file's mimeType is a valid file type for mylestones
	
##### Milestones valid types:
	- application/vnd.ms-excel
	- application/vnd.openxmlformats-officedocument.spreadsheetml.sheet

#### - updateProject(project, projectCoverPhoto, projectCardPhoto, id, user)
	1) remove fields that shouldnt be updated (pitchProposal, projectAgreement, milestonesFile, transactionHash, creationTransactionHash)
	2) searchs project to update
	3) if statusToUpdate == inProgress - -> start project 
	4) if currentStatus == inProgress || blockchainPending - -> error
	5) updates projectCardPhoto or projectCoverPhoto
	6) do project's update  

	` Notes: why can i only update projectCoverPhoto or projectCardPhoto? Does that make sense? Why can i not update texts or milestones? `

#### - async getProjectList()
	1) returns list of projects with status pendingApproval

#### - async getActiveProjectList()
	1) returns list of projects with status published

#### - async getProjectsPreview()
	1) returns a list of projects with limited info for preview

#### - async getProjectWithId({ projectId })
	1) search for project with id projectId
	2) calculates total funded for project with id projectId
	3) returns project + totalFunded

#### - async deleteProject({ projectId })
	1) deletes project

#### - async getProjectMilestones(projectId) 
	1) returns an array of milestones with type
	
	` Notes: i dont really much understand why there is a forEach here `

#### - async downloadMilestonesTemplate()
	1) serves milestone template

#### - async downloadProposalTemplate()
	1) serves proposal template 

#### - async getProjectMilestonesPath(projectId)
	1) returns project milestone path for project with id projectId

#### - async uploadAgreement(projectAgreement, projectId)
	1) search for project with id projectId
	2) create dir where project's agreement will be saved
	3) update project for agreement's path

#### - async downloadAgreement(projectId)
	1) serves agreement's file for project with id - -> projectId

#### - async downloadProposal(projectId)
	1) serves proposal's file for project with id - -> projectId

#### - async getTotalFunded(projectId)
	1) calculates total funded for project with id - -> projectId

#### - async startProject(project)
	1) validates project's status (needs to be published or inProgress)
	2) valides project's status and blockchain status, if its inProgress but not blockchain published - -> error
	3) if project has no oracles assigned - -> error
	4) start project's milestone
	5) update blockchain status to sent

#### - async isFullyAssigned(projectId)
	1) for every milestone, check if it has an oracle assigned

#### - async getProjectsAsOracle(oracleId)
	1) finds projects where the oracle with id oracleId has assigned
	
	`Notes: the function doc says that it returns projects without duplicates, but why've be duplicates?`

#### - async getProjectOwner(projectId)
	1) finds project owner of project with id projectId

#### - async isProjectTransactionConfirmed(projectId)
	1) it finds the project with id projectId
	2) returns true if and only if the project has blockchain status sent (the tx is confirmed)

#### - async getProjectsOfOwner(ownerId)
	1) finds all the project where the owner has id ownerId

#### - async getAllProjectsById(projectsId)
	1) returns all project that corresponds to each id in projectsId

#### - async uploadExperience(projectId, experience, files)
	1) finds project with id projectId
	2) finds user which like to upload coa ux's
	3) saves experience
	4) saves experience files
	5) returns experience

#### - async saveExperienceFile(file, projectId, projectExperienceId, index)
	1) search mimeType from file
	2) checks if fileMimeType is a valid one
	3) adds timestamp to filename
	4) creates dirs if not found
	5) saves photo to experienceId

	`Notes: projectId and index are used to create filePath, the file to save is a photo one. Valid mimeTypes: image/`

#### - async getExperiences(projectId)
	1) finds project with id projectId
	2) finds experiences by project
	3) returns experiences

	`Notes: experiences could be empty and no error is shown`

#### - async updateBlockchainStatus(projectId, status)
	1) validates that status is a valid blockchain status	
	2) update blockchain status of project with id projectId

#### - async allActivitiesAreConfirmed(projectId, activityDao)
	1) finds milestones of project with id projectId
	2) gets all activities on milestones
	3) check if all activities are confirmed
	4) returns true if and only if activitiesUnconfirmed is empty
