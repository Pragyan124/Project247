pipeline {
    agent any 

    environment {
        SONARQUBE_SERVER = 'SonarCloud'
        // This must match the name in Manage Jenkins -> Global Tool Configuration
        SONAR_SCANNER_NAME = 'SonarScanner' 
        DOCKER_IMAGE_BACKEND = 'pragyanborthakur/devops-server:1.0'
        DOCKER_IMAGE_FRONTEND = 'pragyanborthakur/devops-frontend:1.0'
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
                    echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                    docker-compose push
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
