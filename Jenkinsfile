pipeline{
    agent any 

    environment {
        SONARQUBE_SERVER = 'SonarCloud'
        SONAR_SCANNER = 'SonarScanner'
        DOCKER_IMAGE_BACKEND = 'pragyanborthakur/devops-server:1.0'
        DOCKER_IMAGE_FRONTEND = 'pragyanborthakur/devops-frontend:1.0'
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
                withSonarQubeEnv('SonarCloud') {
                sh """
                sonar-scanner \
                  -Dsonar.projectKey=Pragyan124_Project247 \
                  -Dsonar.organization=pragyan124 \
                  -Dsonar.sources=.
                """
            }
        }
    }

        stage ('Build Docker Images') {
            steps {
                sh """
                docker-compose build
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
    }

    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
