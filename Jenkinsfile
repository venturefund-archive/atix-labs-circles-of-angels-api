pipeline {
	agent {
		docker {
			image 'node:8.12'
			args '-u 0:0'
		}
	}
	post {
		failure {
			updateGitlabCommitStatus name: 'Test', state: 'failed'
		}
		success {
			updateGitlabCommitStatus name: 'Test', state: 'success'
		}
		cleanup {
			sh 'rm -rf hitcoins/front/'
			cleanWs()
		}
	}
	stages {
		stage("checkout") {
			steps {
				checkout scm
					updateGitlabCommitStatus name: 'Test', state: 'pending'
			}
		}
		stage("install packages") {
			steps {
				sh 'npm install'
			}
		}
		stage("run test ") {
			steps {
                    		sh 'npm test'
     	       		}
       		}
		stage("run eslint") {
			steps {
				sh 'npm run lint'
			}
		}
	}
}

