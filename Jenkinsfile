pipeline {
    agent any 

    environment {
        SONARQUBE_SERVER = 'SonarCloud'
        SONAR_SCANNER_NAME = 'SonarScanner'
        // VERSION must be in double quotes to work
        VERSION = "1.0.${env.BUILD_NUMBER}"
        DOCKER_IMAGE_BACKEND = "pragyanborthakur/devops-server:${VERSION}"
        DOCKER_IMAGE_FRONTEND = "pragyanborthakur/devops-client:${VERSION}"
    }

    tools {
        'hudson.plugins.sonar.SonarRunnerInstallation' 'SonarScanner'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/Pragyan124/Project247.git'
            }
        }

        stage('SonarQube Scan') {
            steps {
                script {
                    def scannerHome = tool 'SonarScanner'
                    withSonarQubeEnv('SonarCloud') {
                        sh """
                        ${scannerHome}/bin/sonar-scanner \
                          -Dsonar.projectKey=Pragyan124_Project247 \
                          -Dsonar.organization=pragyan124 \
                          -Dsonar.sources=. \
                          -Dsonar.host.url=https://sonarcloud.io
                        """
                    }
                }
            }
        }

        stage('Build & Push Docker Images') {
            steps {
                script {
                    // Build images with the versioned tag
                    sh "docker build -t ${DOCKER_IMAGE_BACKEND} ./server"
                    sh "docker build -t ${DOCKER_IMAGE_FRONTEND} ./client"

                    withCredentials([usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )]) {
                        sh "echo ${DOCKER_PASS} | docker login -u ${DOCKER_USER} --password-stdin"
                        sh "docker push ${DOCKER_IMAGE_BACKEND}"
                        sh "docker push ${DOCKER_IMAGE_FRONTEND}"
                    }
                }
            }
        }

        stage('Update Manifest Repo') {
            steps {
                script {
                    def manifestRepo = "github.com/Pragyan124/Project247.git"
                    
                    withCredentials([usernamePassword(credentialsId: 'github-creds', passwordVariable: 'GIT_PASSWORD', usernameVariable: 'GIT_USERNAME')]) {
                        // Clean workspace of old temp-repo
                        sh "rm -rf temp-repo"
                        sh "git clone https://${GIT_USERNAME}:${GIT_PASSWORD}@${manifestRepo} temp-repo"
                        
                        dir('temp-repo/k8s/overlays/dev') {
                            // Update the newTag in kustomization.yaml to match Docker image tag
                            sh "sed -i 's|newTag:.*|newTag: ${VERSION}|g' kustomization.yaml"
                            
                            sh """
                            git config user.email "jenkins@yourdomain.com"
                            git config user.name "Jenkins Automation"
                            git add kustomization.yaml
                            # [skip ci] prevents an infinite loop of builds
                            git commit -m "Update image tags to version ${VERSION} [skip ci]" || echo "No changes to commit"
                            git push origin main
                            """
                        }
                    }
                }
            }
        }
    }

    post {
        success { 
            echo "Successfully deployed version ${VERSION}. Argo CD will now sync the changes." 
        }
        failure { 
            echo "Pipeline failed. Check Docker Hub or SonarCloud logs." 
        }
    }
}