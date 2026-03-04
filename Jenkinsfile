pipeline {
    agent any 

    environment {
        SONARQUBE_SERVER = 'SonarCloud'
        // This must match the name in Manage Jenkins -> Global Tool Configuration
        SONAR_SCANNER_NAME = 'SonarScanner'
        VERSION = "1.0.${env.BUILD_ID}"
        DOCKER_IMAGE_BACKEND = 'pragyanborthakur/devops-server:${VERSION}'
        DOCKER_IMAGE_FRONTEND = 'pragyanborthakur/devops-client:${VERSION}'
    }

    tools {
        'hudson.plugins.sonar.SonarRunnerInstallation' 'SonarScanner'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/Pragyan124/Project247.git'
            }
        }

        stage('SonarQube Scan') {
            steps {
                script {
                    // This finds the installation path and adds /bin to the command
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

        stage('Build Docker Images') {
            steps {
               sh """
               # Download the standalone compose binary if it doesn't exist
               curl -SL https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-linux-x86_64 -o docker-compose
               chmod +x docker-compose
               ./docker-compose build
               
                # Use the variables to build so the names match exactly for the push
                docker build -t ${DOCKER_IMAGE_BACKEND} ./server
                docker build -t ${DOCKER_IMAGE_FRONTEND} ./client
                """
            }
        }

        stage('Push Images') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh """
                        # Use single quotes (\'\'\') for the script to be secure
                        echo "${DOCKER_PASS}" | docker login -u "${DOCKER_USER}" --password-stdin
                
                        # Manually push the images since docker-compose isn't available
                        
                        docker push pragyanborthakur/devops-server:${VERSION}
                        docker push pragyanborthakur/devops-client:${VERSION}
                    """
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                // Use the ID you created in Jenkins Credentials
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh """
                    # Securely login
                    echo "${DOCKER_PASS}" | docker login -u "${DOCKER_USER}" --password-stdin
                    
                    # Push the images
                    docker push ${DOCKER_IMAGE_BACKEND}
                    docker push ${DOCKER_IMAGE_BACKEND}
                    
                    # Optional: Logout to clean up
                    docker logout
                    """
                }
            }
        }
    } // End of Stages

    post {
        success { echo 'Pipeline completed successfully!' }
        failure { echo 'Pipeline failed!' }
    }
}
