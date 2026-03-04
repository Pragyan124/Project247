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

        // stage('Security Scan') {
        //     steps {
        //       script {
        //             // Ensure the reports directory exists
        //             sh 'mkdir -p ./reports'

        //             sh """
        //             trivy image -q -f json -o /var/lib/jenkins/reports/trivy-report-backend.json ${DOCKER_IMAGE_BACKEND}
        //             trivy image -q -f json -o /var/lib/jenkins/reports/trivy-report-frontend.json ${DOCKER_IMAGE_FRONTEND}
        //             """
        //             archiveArtifacts artifacts: 'reports/*.json', fingerprint: true
        //       }
        //    }
        // }

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

        stage('Update Manifest Repo') {
            steps {
                script {
            // 1. Define your Manifest Repo URL (use HTTPS)
                def manifestRepo = "https://github.com/Pragyan124/Project247.git"
            
            // 2. Use credentials to clone and push
                    withCredentials([usernamePassword(credentialsId: 'github-creds', passwordVariable: 'GIT_PASSWORD', usernameVariable: 'GIT_USERNAME')]) {
                
                // Clone the repo into a temporary folder
                    sh "git clone https://${GIT_USERNAME}:${GIT_PASSWORD}@${manifestRepo} temp-repo"
                
                    dir('temp-repo') {
                    // 3. Use 'sed' to replace the old image tag with the new one
                    // This looks for 'devops-server:ANYTHING' and replaces it with 'devops-server:NEW_TAG'
                    sh """
                    sed -i 's|devops-server:.*|devops-server:${BUILD_NUMBER}|g' k8s/backend.yaml
                    sed -i 's|devops-client:.*|devops-client:${BUILD_NUMBER}|g' k8s/frontend.yaml
                    """
                    
                    // 4. Commit and Push
                    sh """
                    git config user.email "jenkins@yourdomain.com"
                    git config user.name "Jenkins Automation"
                    git add .
                    git commit -m "Update image tags to version ${BUILD_NUMBER} [skip ci]"
                    git push origin main
                    """
                    }
                }
            }
        }
    }
    } // End of Stages

    post {
        success { echo 'Pipeline completed successfully!' }
        failure { echo 'Pipeline failed!' }
    }
}
